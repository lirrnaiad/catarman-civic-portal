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
import { BARANGAYS, nearestBarangay } from "@/lib/barangays";
import { useOnline } from "@/lib/useOnline";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import styles from "./ReportForm.module.css";

// react-leaflet touches window/document, so it must never render on the server.
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => <div className={`${styles.mapPlaceholder} skeleton`} aria-label="Loading map" />,
});

const CATEGORY_ICON: Record<string, IconName> = {
  flood_landslide: "waves",
  garbage: "trash",
  crime: "siren",
  infrastructure: "wrench",
};

/** Short, readable reference for the confirmation screen. */
const shortRef = (id: string) => id.replace(/-/g, "").slice(0, 8).toUpperCase();

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
  const [barangay, setBarangay] = useState("");
  const [barangayTouched, setBarangayTouched] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const online = useOnline();
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

  // Suggest the barangay nearest the pin until the reporter picks one themselves.
  // (Adjusting state during render instead of in an effect avoids a second pass.)
  const suggested = location ? nearestBarangay(location.lat, location.lng) : "";
  if (!barangayTouched && suggested && barangay !== suggested) setBarangay(suggested);

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
    setBarangay("");
    setBarangayTouched(false);
    setShowErrors(false);
    setLocation(null);
    setPhotos([]);
    setStatus("idle");
    setErrorMessage(null);
    setLastResult(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Only category and location are required: a report should take two taps.
    if (!category || !location) {
      setShowErrors(true);
      setErrorMessage(!category ? "Choose what's happening." : "Set the location on the map.");
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
        barangay: barangay || undefined,
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
        if (payload.barangay) formData.append("barangay", payload.barangay);
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

  if ((status === "queued" || status === "success") && lastResult) {
    const queued = status === "queued";
    return (
      <div className={`${styles.doneCard} ${queued ? styles.doneQueued : styles.doneSent}`} role="status" key={status}>
        <div className={styles.doneIcon} aria-hidden>
          {queued ? (
            <Icon name="clock" className="h-9 w-9" />
          ) : (
            <svg viewBox="0 0 52 52" className={styles.checkSvg}>
              <circle cx="26" cy="26" r="23" className={styles.checkCircle} />
              <path d="M15 27l7 7 15-16" className={styles.checkMark} />
            </svg>
          )}
        </div>
        <h2 className={styles.doneTitle}>{queued ? "Saved on this device" : "Sent to MDRRMO"}</h2>
        <p className={styles.doneBody}>
          {queued
            ? "No signal right now. Your report will send automatically as soon as you're back online, even if you close this page."
            : "Thank you. Municipal responders can now see your report on their dashboard."}
        </p>
        <p className={styles.doneRef}>
          Reference <strong>#{shortRef(lastResult.id)}</strong>
        </p>
        <div className={styles.doneActions}>
          <button type="button" className={styles.primaryBtn} onClick={resetForm}>
            Report another issue
          </button>
          <Link href="/evacuation" className={styles.secondaryBtn}>
            <Icon name="home" className="h-4 w-4" />
            Nearest evacuation center
          </Link>
        </div>
      </div>
    );
  }

  const detailsFilled = [description.trim(), contact.trim()].filter(Boolean).length + (barangayTouched ? 1 : 0);

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <section className={styles.section} aria-labelledby="q-what">
        <h2 id="q-what" className={styles.sectionTitle}>
          What&apos;s happening?
        </h2>
        <div className={styles.categoryGrid} role="radiogroup" aria-labelledby="q-what">
          {categories.map((opt) => {
            const active = category === opt.value;
            return (
              <label key={opt.value} className={`${styles.categoryCard} ${active ? styles.categoryCardActive : ""}`}>
                <input
                  type="radio"
                  name="category"
                  value={opt.value}
                  checked={active}
                  onChange={() => setCategory(opt.value)}
                  className={styles.categoryRadio}
                />
                <span className={styles.categoryIcon} aria-hidden>
                  <Icon name={CATEGORY_ICON[opt.value] ?? "alert"} className="h-7 w-7" />
                </span>
                <span className={styles.categoryLabel}>{opt.label}</span>
                <span className={styles.categoryHint}>{opt.hint}</span>
                {active && (
                  <span className={styles.categoryCheck} aria-hidden>
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                )}
              </label>
            );
          })}
        </div>
        {showErrors && !category && <p className={styles.fieldError}>Choose what&apos;s happening.</p>}
      </section>

      <section className={styles.section} aria-labelledby="q-where">
        <h2 id="q-where" className={styles.sectionTitle}>
          Where is it?
        </h2>
        <LocationPicker value={location} onChange={setLocation} initialCenter={initialMapCenter} />
        {showErrors && !location && <p className={styles.fieldError}>Set the location on the map.</p>}
      </section>

      <section className={styles.section} aria-labelledby="q-photos">
        <h2 id="q-photos" className={styles.sectionTitle}>
          Photos <span className={styles.optional}>optional</span>
        </h2>
        {photos.length < MAX_PHOTOS && (
          <button type="button" className={styles.dropzone} onClick={() => fileInputRef.current?.click()}>
            <span className={styles.dropzoneIcon} aria-hidden>
              <Icon name="camera" className="h-7 w-7" />
            </span>
            <span className={styles.dropzoneTitle}>{photos.length ? "Add another photo" : "Take or add photos"}</span>
            <span className={styles.dropzoneHint}>
              Up to {MAX_PHOTOS} photos · helps responders see the situation
            </span>
          </button>
        )}
        {photos.length > 0 && (
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
          </div>
        )}
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
      </section>

      <details className={styles.details}>
        <summary className={styles.detailsSummary}>
          <span>
            Add details <span className={styles.optional}>optional</span>
          </span>
          {detailsFilled > 0 && <span className={styles.detailsCount}>{detailsFilled} added</span>}
          <Icon name="chevronDown" className={`h-5 w-5 ${styles.detailsChevron}`} />
        </summary>
        <div className={styles.detailsBody}>
          <label className={styles.fieldLabel} htmlFor="description">
            What are you seeing?
          </label>
          <textarea
            id="description"
            className={styles.textarea}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Water is knee-deep and rising near the bridge"
          />

          <label className={styles.fieldLabel} htmlFor="barangay">
            Barangay
          </label>
          <select
            id="barangay"
            className={styles.textInput}
            value={barangay}
            onChange={(e) => {
              setBarangay(e.target.value);
              setBarangayTouched(true);
            }}
          >
            <option value="">Not sure</option>
            {BARANGAYS.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          <label className={styles.fieldLabel} htmlFor="contact">
            Contact number
          </label>
          <input
            id="contact"
            type="tel"
            inputMode="tel"
            className={styles.textInput}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="09XX XXX XXXX, if you'd like a callback"
          />
        </div>
      </details>

      {errorMessage && !showErrors && <p className={styles.formError}>{errorMessage}</p>}

      <div className={styles.submitBar}>
        <button type="submit" className={styles.submitBtn} disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <span className={styles.btnSpinner} aria-hidden />
              Sending…
            </>
          ) : online ? (
            "Submit report"
          ) : (
            "Save report · sends when online"
          )}
        </button>
      </div>
    </form>
  );
}
