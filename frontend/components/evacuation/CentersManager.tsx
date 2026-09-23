"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Icon from "@/components/Icon";
import { BARANGAYS } from "@/lib/barangays";
import { CATARMAN_TOWN_CENTER, type EvacuationCenter } from "@/lib/evacuation-centers";
import { getCapacityStatus, getOccupancyRatio, spacesLeft, STATUS_COLOR, STATUS_LABEL } from "@/lib/evacuation-utils";
import styles from "./manager.module.css";
import { useCountUp } from "./useCountUp";

const PinPicker = dynamic(() => import("./PinPicker"), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" aria-label="Loading map" />,
});

interface Draft {
  name: string;
  barangay: string;
  capacity: string;
  currentOccupancy: string;
  contact: string;
  isOpen: boolean;
  lat: number;
  lng: number;
}

const blank = (): Draft => ({
  name: "",
  barangay: "",
  capacity: "",
  currentOccupancy: "0",
  contact: "",
  isOpen: true,
  lat: CATARMAN_TOWN_CENTER[0],
  lng: CATARMAN_TOWN_CENTER[1],
});

const draftFrom = (c: EvacuationCenter): Draft => ({
  name: c.name,
  barangay: c.barangay,
  capacity: String(c.capacity),
  currentOccupancy: String(c.currentOccupancy),
  contact: c.contact ?? "",
  isOpen: c.isOpen,
  lat: c.lat,
  lng: c.lng,
});

async function patch(id: number, body: Partial<EvacuationCenter>): Promise<EvacuationCenter | null> {
  const res = await fetch(`/api/centers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return (await res.json()).center;
}

export default function CentersManager({ initialCenters }: { initialCenters: EvacuationCenter[] }) {
  const [centers, setCenters] = useState(initialCenters);
  const [editing, setEditing] = useState<{ id: number | null; draft: Draft } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2400);
  };

  const replace = (c: EvacuationCenter) => setCenters((prev) => prev.map((x) => (x.id === c.id ? c : x)));

  const totals = centers.reduce(
    (acc, c) => (c.isOpen ? { cap: acc.cap + c.capacity, occ: acc.occ + c.currentOccupancy } : acc),
    { cap: 0, occ: 0 }
  );

  const set = (p: Partial<Draft>) => setEditing((cur) => (cur ? { ...cur, draft: { ...cur.draft, ...p } } : cur));

  const save = async () => {
    if (!editing) return;
    const d = editing.draft;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(editing.id ? `/api/centers/${editing.id}` : "/api/centers", {
        method: editing.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.name,
          barangay: d.barangay,
          capacity: Number(d.capacity),
          currentOccupancy: Number(d.currentOccupancy || 0),
          contact: d.contact,
          isOpen: d.isOpen,
          lat: d.lat,
          lng: d.lng,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Couldn't save. Try again.");
        return;
      }
      const saved: EvacuationCenter = data.center;
      setCenters((prev) =>
        [...prev.filter((c) => c.id !== saved.id), saved].sort((a, b) => a.name.localeCompare(b.name))
      );
      flash(editing.id ? "Center updated" : "Center added: citizens can see it now");
      setEditing(null);
    } catch {
      setError("No connection. Check your signal and try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/centers/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCenters((prev) => prev.filter((c) => c.id !== id));
      flash("Center removed");
    } else flash("Couldn't remove the center");
  };

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/admindashboard" className={styles.back}>
          <Icon name="arrowLeft" className="h-4 w-4" />
          Reports
        </Link>
        <Link href="/evacuation" className={styles.back}>
          Public view
          <Icon name="arrowUpRight" className="h-4 w-4" />
        </Link>
      </div>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Evacuation centers</h1>
          <p className={styles.subtitle}>
            {centers.length} centers · {totals.occ.toLocaleString()} of {totals.cap.toLocaleString()} spaces filled
          </p>
        </div>
        <button type="button" className={styles.addBtn} onClick={() => setEditing({ id: null, draft: blank() })}>
          <Icon name="plus" className="h-5 w-5" />
          Add center
        </button>
      </header>

      <p className={styles.tip}>
        <Icon name="info" className="h-4 w-4" />
        Headcount changes save instantly and show on the public Centers tab within 20 seconds.
      </p>

      <ul className={styles.list}>
        {centers.map((c, i) => (
          <ManagedCenter
            key={c.id}
            center={c}
            index={i}
            onSaved={replace}
            onEdit={() => {
              setError(null);
              setEditing({ id: c.id, draft: draftFrom(c) });
            }}
            onDelete={() => remove(c.id)}
          />
        ))}
      </ul>

      {editing && (
        <div className={styles.overlay} onClick={() => !saving && setEditing(null)}>
          <div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="center-editor"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.handle} aria-hidden />
            <div className={styles.sheetHead}>
              <h2 id="center-editor">{editing.id ? "Edit center" : "Add center"}</h2>
              <button type="button" className={styles.iconBtn} aria-label="Close" onClick={() => setEditing(null)}>
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <label className={styles.field}>
                <span>Name</span>
                <input
                  value={editing.draft.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="e.g. Catarman Central School Gym"
                  required
                  autoFocus
                />
              </label>
              <label className={styles.field}>
                <span>Barangay</span>
                <select value={editing.draft.barangay} onChange={(e) => set({ barangay: e.target.value })} required>
                  <option value="">Select barangay…</option>
                  {!BARANGAYS.some((b) => b.name === editing.draft.barangay) && editing.draft.barangay && (
                    <option value={editing.draft.barangay}>{editing.draft.barangay}</option>
                  )}
                  {BARANGAYS.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.row}>
                <label className={styles.field}>
                  <span>Capacity</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={editing.draft.capacity}
                    onChange={(e) => set({ capacity: e.target.value })}
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span>Current headcount</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={editing.draft.currentOccupancy}
                    onChange={(e) => set({ currentOccupancy: e.target.value })}
                  />
                </label>
              </div>
              <label className={styles.field}>
                <span>
                  Contact number <em>optional</em>
                </span>
                <input
                  type="tel"
                  value={editing.draft.contact}
                  onChange={(e) => set({ contact: e.target.value })}
                  placeholder="Shown to citizens as a Call button"
                />
              </label>
              <div className={styles.field}>
                <span>Location · tap the map or drag the pin</span>
                <div className={styles.pickerBox}>
                  <PinPicker
                    value={{ lat: editing.draft.lat, lng: editing.draft.lng }}
                    onChange={(v) => set(v)}
                  />
                </div>
              </div>
              <label className={styles.switchRow}>
                <span>
                  <strong>Open to evacuees</strong>
                  <small>Turn off if not activated or closed</small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  className={styles.switch}
                  checked={editing.draft.isOpen}
                  onChange={(e) => set({ isOpen: e.target.checked })}
                />
              </label>
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <div className={styles.sheetActions}>
                <button type="button" className={styles.ghostBtn} onClick={() => setEditing(null)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? "Saving…" : editing.id ? "Save changes" : "Add center"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={styles.toast} role="status">
          <Icon name="check" className="h-4 w-4" />
          {toast}
        </div>
      )}
    </main>
  );
}

function ManagedCenter({
  center,
  index,
  onSaved,
  onEdit,
  onDelete,
}: {
  center: EvacuationCenter;
  index: number;
  onSaved: (c: EvacuationCenter) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [count, setCount] = useState(center.currentOccupancy);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [confirm, setConfirm] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const shown = useCountUp(count, 300);

  // Keep in sync when the sheet edits this center.
  useEffect(() => setCount(center.currentOccupancy), [center.currentOccupancy]);

  const live = { ...center, currentOccupancy: count };
  const status = getCapacityStatus(live);
  const ratio = Math.min(1, getOccupancyRatio(live));

  // Debounced save: tapping +1 five times sends one request.
  const commit = (next: number) => {
    const value = Math.max(0, next);
    setCount(value);
    setState("saving");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      const saved = await patch(center.id, { currentOccupancy: value });
      if (saved) {
        onSaved(saved);
        setState("saved");
      } else setState("error");
    }, 450);
  };

  const toggleOpen = async () => {
    setState("saving");
    const saved = await patch(center.id, { isOpen: !center.isOpen });
    if (saved) {
      onSaved(saved);
      setState("saved");
    } else setState("error");
  };

  return (
    <li
      className={styles.card}
      style={
        {
          "--st": STATUS_COLOR[status],
          "--w": `${status === "closed" ? 0 : ratio * 100}%`,
          "--i": Math.min(index, 8),
        } as CSSProperties
      }
    >
      <div className={styles.cardHead}>
        <div>
          <h3 className={styles.cardName}>{center.name}</h3>
          <p className={styles.cardMeta}>Brgy. {center.barangay}</p>
        </div>
        <span className={styles.status}>{STATUS_LABEL[status]}</span>
      </div>

      <div className={styles.countRow}>
        <span className={styles.count}>
          <strong>{shown.toLocaleString()}</strong> / {center.capacity.toLocaleString()}
        </span>
        <span className={styles.saveState} aria-live="polite">
          {state === "saving" && "Saving…"}
          {state === "saved" && (
            <>
              <Icon name="check" className="h-3.5 w-3.5" /> Saved
            </>
          )}
          {state === "error" && "Not saved: retry"}
          {state === "idle" && `${spacesLeft(live).toLocaleString()} left`}
        </span>
      </div>
      <div className={styles.bar} aria-hidden>
        <span />
      </div>

      <div className={styles.stepper} role="group" aria-label={`Headcount for ${center.name}`}>
        <button type="button" onClick={() => commit(count - 10)} aria-label="Remove 10">
          −10
        </button>
        <button type="button" onClick={() => commit(count - 1)} aria-label="Remove 1">
          −1
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          aria-label="Headcount"
          value={count}
          onChange={(e) => commit(Number(e.target.value) || 0)}
        />
        <button type="button" onClick={() => commit(count + 1)} aria-label="Add 1">
          +1
        </button>
        <button type="button" onClick={() => commit(count + 10)} aria-label="Add 10">
          +10
        </button>
      </div>

      <div className={styles.cardActions}>
        <label className={styles.inlineSwitch}>
          <input type="checkbox" role="switch" className={styles.switch} checked={center.isOpen} onChange={toggleOpen} />
          {center.isOpen ? "Open" : "Closed"}
        </label>
        {confirm ? (
          <>
            <span className={styles.confirmText}>Remove center?</span>
            <button type="button" className={styles.ghostBtn} onClick={() => setConfirm(false)}>
              Cancel
            </button>
            <button type="button" className={styles.dangerBtn} onClick={onDelete}>
              Remove
            </button>
          </>
        ) : (
          <>
            <button type="button" className={styles.ghostBtn} onClick={onEdit}>
              <Icon name="edit" className="h-4 w-4" />
              Edit
            </button>
            <button type="button" className={styles.ghostBtn} aria-label={`Remove ${center.name}`} onClick={() => setConfirm(true)}>
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}
