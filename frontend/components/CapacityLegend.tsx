import { STATUS_COLOR, STATUS_LABEL, type CapacityStatus } from "@/lib/evacuation-utils";

const ORDER: CapacityStatus[] = ["open", "near-full", "full"];

export default function CapacityLegend() {
  return (
    <div className="flex items-center gap-4 text-sm">
      {ORDER.map((status) => (
        <div key={status} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full border border-black/20"
            style={{ backgroundColor: STATUS_COLOR[status] }}
          />
          <span>{STATUS_LABEL[status]}</span>
        </div>
      ))}
    </div>
  );
}
