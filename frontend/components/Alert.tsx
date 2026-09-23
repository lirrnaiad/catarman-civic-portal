import type { ReactNode } from "react";

export type AlertVariant = "info" | "success" | "warning" | "danger";

const VARIANT_STYLES: Record<AlertVariant, string> = {
  info: "border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-100",
  success:
    "border-green-600 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950 dark:text-green-100",
  warning:
    "border-amber-600 bg-amber-50 text-amber-900 dark:border-amber-500 dark:bg-amber-950 dark:text-amber-100",
  danger:
    "border-red-600 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950 dark:text-red-100",
};

const ICON_STYLES: Record<AlertVariant, string> = {
  info: "text-blue-600 dark:text-blue-400",
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
};

const ICON_PATH: Record<AlertVariant, string> = {
  info: "M18 10A8 8 0 112 10a8 8 0 0116 0zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4.25a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z",
  success:
    "M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z",
  warning:
    "M9.3 3.4a1 1 0 011.4 0l7.15 12.25A1 1 0 0117 17H3a1 1 0 01-.85-1.35L9.3 3.4zM10 8a1 1 0 00-1 1v2.5a1 1 0 102 0V9a1 1 0 00-1-1zm0 6.5a1 1 0 100-2 1 1 0 000 2z",
  danger:
    "M18 10A8 8 0 112 10a8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 8.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z",
};

/**
 * Shared alert/banner pattern: colored left accent + icon + message, in
 * light-on-color pairs (e.g. blue-50/blue-900) chosen for WCAG AA contrast.
 * Not evacuation-specific — reuse this for offline-state banners, form
 * validation, etc. so alerts look consistent across the whole portal.
 */
export default function Alert({
  variant,
  children,
}: {
  variant: AlertVariant;
  children: ReactNode;
}) {
  return (
    <div
      role={variant === "danger" || variant === "warning" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-md border-l-4 px-4 py-3 text-sm ${VARIANT_STYLES[variant]}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`mt-0.5 h-5 w-5 shrink-0 ${ICON_STYLES[variant]}`}
      >
        <path fillRule="evenodd" clipRule="evenodd" d={ICON_PATH[variant]} />
      </svg>
      <div className="min-w-0 leading-snug">{children}</div>
    </div>
  );
}
