import { STATUS_COLOR, STATUS_LABEL, type CapacityStatus } from "@/lib/evacuation-utils";

const ORDER: CapacityStatus[] = ["open", "near-full", "full"];

export default function CapacityLegend({
  counts,
}: {
  /** Optional per-status tallies, e.g. from getStatusCounts(). */
  counts?: Record<CapacityStatus, number>;
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-slate-200 sm:text-sm">
      {ORDER.map((status) => (
        <li key={status} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: STATUS_COLOR[status] }}
          />
          <span>
            {STATUS_LABEL[status]}
            {counts && <span className="text-slate-400"> ({counts[status]})</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
