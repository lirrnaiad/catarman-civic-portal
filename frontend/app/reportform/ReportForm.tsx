"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import {
  DEFAULT_CATEGORIES,
  type CategoryOption,
  type GeoLocation,
  type ReportPayload,
  type ReportPhoto,
  type SubmitResult,
} from "@/lib/types";
import { generateReportId } from "@/lib/id";
import { enqueueReport, getQueuedReports } from "@/lib/offlineQueue";
import { onFlush } from "@/lib/offlineSync";
import Icon from "@/components/Icon";
import styles from "./ReportForm.module.css";

// react-leaflet touches window/document, so it must never render on the server.
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => <div className={styles.mapPlaceholder}>Loading map…</div>,
});

const MAX_PHOTOS = 5;
const MAX_PHOTO_MB = 8;

interface PhotoDraft {
  file: File;
  previewUrl: string;
}

export interface ReportFormProps {
  /** Overrides the default four categories, e.g. to localize labels. */
  categories?: CategoryOption[];
  /**
   * Called with the built payload and the raw File objects when the person
   * submits. Provide this to hand the report to your own system (an SDK
   * call, a different endpoint, a native bridge, etc). If omitted, the form
   * POSTs to `apiEndpoint` itself using multipart/form-data.
   */
  onSubmit?: (payload: ReportPayload, files: File[]) => Promise<SubmitResult> | SubmitResult;
  /** Used only when `onSubmit` is not provided. Defaults to "/api/reports". */
  apiEndpoint?: string;
  /** Map center before a location is chosen. Pass your service area's centroid. */
  initialMapCenter?: [number, number];
  /** Shown after a successful submission. */
  onSuccess?: (result: SubmitResult) => void;
}

type Status = "idle" | "submitting" | "success" | "queued" | "error";

export default function ReportForm({
  categories = DEFAULT_CATEGORIES,
  onSubmit,
  apiEndpoint = "/api/reports",
  initialMapCenter,
  onSuccess,
}: ReportFormProps) {
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SubmitResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Once the reconnect flush has sent this report, swap "Saved on this device"
  // for the normal confirmation so the screen matches what actually happened.
  const queuedId = status === "queued" ? lastResult?.id : undefined;
  useEffect(() => {
    if (!queuedId) return;
    return onFlush(async () => {
      const stillQueued = (await getQueuedReports().catch(() => [])).some((r) => r.id === queuedId);
      if (!stillQueued) setStatus("success");
    });
  }, [queuedId]);

  // Revoke object URLs on unmount / when photos change to avoid leaking memory.
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [photos]);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const incoming = Array.from(fileList);
      const room = MAX_PHOTOS - photos.length;
      if (room <= 0) {
        setErrorMessage(`You can attach up to ${MAX_PHOTOS} photos.`);
        return;
      }
      const accepted: PhotoDraft[] = [];
      for (const file of incoming.slice(0, room)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
          setErrorMessage(`${file.name} is larger than ${MAX_PHOTO_MB}MB and was skipped.`);
          continue;
        }
        accepted.push({ file, previewUrl: URL.createObjectURL(file) });
      }
      setPhotos((prev) => [...prev, ...accepted]);
    },
    [photos.length]
  );

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  }, []);

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const resetForm = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setCategory("");
    setDescription("");
    setContact("");
    setLocation(null);
    setPhotos([]);
    setStatus("idle");
    setErrorMessage(null);
    setLastResult(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!category) {
      setErrorMessage("Choose a category.");
      return;
    }
    if (!location) {
      setErrorMessage("Set the location on the map.");
      return;
    }
    if (description.trim().length < 10) {
      setErrorMessage("Add a few more words describing what's happening.");
      return;
    }

    setStatus("submitting");
    try {
      const files = photos.map((p) => p.file);
      const reportPhotos: ReportPhoto[] = await Promise.all(
        photos.map(async (p) => ({
          fileName: p.file.name,
          mimeType: p.file.type,
          sizeBytes: p.file.size,
          dataUrl: await fileToDataUrl(p.file),
        }))
      );

      const payload: ReportPayload = {
        id: generateReportId(),
        category: category as ReportPayload["category"],
        description: description.trim(),
        location,
        photos: reportPhotos,
        reporterContact: contact.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      let result: SubmitResult;
      if (onSubmit) {
        result = await onSubmit(payload, files);
      } else {
        const formData = new FormData();
        formData.append("id", payload.id);
        formData.append("category", payload.category);
        formData.append("description", payload.description);
        formData.append("lat", String(payload.location.lat));
        formData.append("lng", String(payload.location.lng));
        if (payload.location.accuracy != null) {
          formData.append("accuracy", String(payload.location.accuracy));
        }
        if (payload.reporterContact) formData.append("reporterContact", payload.reporterContact);
        formData.append("createdAt", payload.createdAt);
        files.forEach((file) => formData.append("photos", file, file.name));

        // Story 3.2: no connection -> keep the report on this device. The
        // payload is plain JSON (photos as data URLs), which is exactly what
        // lib/offlineSync.ts re-POSTs once the browser is back online.
        const queueForLater = async () => {
          await enqueueReport(payload);
          window.dispatchEvent(new CustomEvent("civic-report:queued", { detail: { id: payload.id } }));
          setLastResult({ ok: true, id: payload.id, message: "queued" });
          setStatus("queued");
        };
        if (!navigator.onLine) {
          await queueForLater();
          return;
        }
        let res: Response;
        try {
          res = await fetch(apiEndpoint, { method: "POST", body: formData });
        } catch {
          // fetch only rejects on network failure (e.g. signal dropped mid-submit).
          await queueForLater();
          return;
        }
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        result = await res.json();
      }

      // Broadcast a DOM event too, so non-React host pages/systems can hook in
      // without needing the `onSubmit` prop.
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("civic-report:submitted", { detail: { payload, result } }));
      }

      setLastResult(result);
      setStatus("success");
      onSuccess?.(result);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  };

  if (status === "queued" && lastResult) {
    return (
      <div className={styles.successCard} role="status">
        <h2 className={styles.successTitle}>Saved on this device</h2>
        <p className={styles.successBody}>
          You&apos;re offline, so your report is stored on this phone. It will be sent
          automatically as soon as you&apos;re back online. Reference number{" "}
          <strong>{lastResult.id}</strong>.
        </p>
        <button type="button" className={styles.secondaryBtn} onClick={resetForm}>
          Submit another report
        </button>
      </div>
    );
  }

  if (status === "success" && lastResult) {
    return (
      <div className={styles.successCard}>
        <h2 className={styles.successTitle}>Report submitted</h2>
        <p className={styles.successBody}>
          Reference number <strong>{lastResult.id}</strong>. Keep this if you need to follow up.
        </p>
        <button type="button" className={styles.secondaryBtn} onClick={resetForm}>
          Submit another report
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.stepNumber}>1</span> What's the issue?
        </h2>
        <div className={styles.categoryGrid}>
          {categories.map((opt) => (
            <label
              key={opt.value}
              className={`${styles.categoryCard} ${category === opt.value ? styles.categoryCardActive : ""}`}
            >
              <input
                type="radio"
                name="category"
                value={opt.value}
                checked={category === opt.value}
                onChange={() => setCategory(opt.value)}
                className={styles.categoryRadio}
              />
              <span className={styles.categoryLabel}>{opt.label}</span>
              <span className={styles.categoryHint}>{opt.hint}</span>
            </label>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.stepNumber}>2</span> Where is it?
        </h2>
        <LocationPicker value={location} onChange={setLocation} initialCenter={initialMapCenter} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.stepNumber}>3</span> Add photos
        </h2>
        <div className={styles.photoGrid}>
          {photos.map((p, i) => (
            <div key={p.previewUrl} className={styles.photoThumb}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.previewUrl} alt={`Attached photo ${i + 1}`} />
              <button
                type="button"
                className={styles.removePhotoBtn}
                onClick={() => removePhoto(i)}
                aria-label={`Remove photo ${i + 1}`}
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              className={styles.addPhotoBtn}
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="plus" className="h-6 w-6" />
              <span>Add photo</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className={styles.hint}>Up to {MAX_PHOTOS} photos, {MAX_PHOTO_MB}MB each.</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.stepNumber}>4</span> Details
        </h2>
        <label className={styles.fieldLabel} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className={styles.textarea}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you're seeing, since when, and anything responders should know."
        />

        <label className={styles.fieldLabel} htmlFor="contact">
          Contact (optional)
        </label>
        <input
          id="contact"
          type="text"
          className={styles.textInput}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone or email, if you'd like an update"
        />
      </section>

      {errorMessage && <p className={styles.formError}>{errorMessage}</p>}

      <div className={styles.submitBar}>
        <button type="submit" className={styles.submitBtn} disabled={status === "submitting"}>
          {status === "submitting" ? "Submitting…" : "Submit report"}
        </button>
      </div>
    </form>
  );
}
