"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/Icon";

// Report is the main tab (the pitch's core flow), so it comes first and is "/".
const LINKS: { href: string; label: string; icon: IconName; main?: boolean }[] = [
  { href: "/", label: "Report", icon: "alert", main: true },
  { href: "/evacuation", label: "Centers", icon: "home" },
  { href: "/events", label: "Events", icon: "calendar" },
  { href: "/admindashboard", label: "Admin", icon: "grid" },
];

/**
 * Portal-wide navigation, mounted once in the root layout.
 * Phones/tablets: a bottom tab bar within thumb reach, like most mobile apps.
 * Desktop (lg+): a top bar, where the admin dashboard is mostly used.
 * Its phone height is --nav-h in globals.css; keep the two in sync.
 * z-index sits above Leaflet's panes (up to 1000) so maps scroll underneath.
 */
export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-[1100] border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(15,23,42,0.06)] lg:sticky lg:top-0 lg:bottom-auto lg:border-t-0 lg:border-b lg:pb-0 lg:shadow-sm"
    >
      <div className="mx-auto flex h-16 max-w-5xl items-stretch lg:h-14 lg:items-center lg:gap-1 lg:px-6">
        <Link href="/" className="mr-auto hidden items-center gap-2 font-bold text-slate-900 lg:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-civic-strong text-white">
            <Icon name="shield" />
          </span>
          Catarman Civic Portal
        </Link>

        {LINKS.map(({ href, label, icon, main }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors lg:flex-none lg:flex-row lg:gap-2 lg:rounded-lg lg:px-3 lg:py-2 lg:text-sm lg:hover:bg-slate-100 ${
                active ? (main ? "text-hazard" : "text-civic") : "text-slate-500 hover:text-slate-900"
              } ${active ? "lg:bg-slate-100" : ""}`}
            >
              {main ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-hazard text-white shadow-sm lg:h-7 lg:w-7">
                  <Icon name={icon} className="h-5 w-5 lg:h-4 lg:w-4" />
                </span>
              ) : (
                <span className="flex h-8 items-center lg:h-7">
                  <Icon name={icon} className="h-6 w-6 lg:h-5 lg:w-5" />
                </span>
              )}
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
