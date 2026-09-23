"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/Icon";

const LINKS: { href: string; label: string; icon: IconName; hazard?: boolean }[] = [
  { href: "/", label: "Centers", icon: "home" },
  { href: "/reportform", label: "Report", icon: "alert", hazard: true },
  { href: "/events", label: "Events", icon: "calendar" },
  { href: "/admindashboard", label: "Admin", icon: "grid" },
];

/**
 * Portal-wide navigation, mounted once in the root layout. Sits above
 * Leaflet's panes (z-index up to 1000) so maps scroll underneath it.
 * On phones the tabs stack icon-over-label to fit four 44px+ targets.
 */
export default function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[1100] bg-civic-strong text-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold" aria-label="Catarman Civic Portal home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Icon name="shield" />
          </span>
          <span className="hidden leading-tight md:block">Catarman Civic Portal</span>
        </Link>

        <nav aria-label="Main" className="ml-auto flex flex-1 justify-end gap-1 sm:flex-none">
          {LINKS.map(({ href, label, icon, hazard }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            const tone = hazard
              ? "bg-hazard text-white hover:bg-hazard-hover"
              : active
                ? "bg-white/20 text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white";
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 min-w-16 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-[11px] font-semibold transition-colors sm:flex-none sm:flex-row sm:gap-2 sm:px-3 sm:text-sm ${tone} ${
                  hazard && active ? "ring-2 ring-white/70" : ""
                }`}
              >
                <Icon name={icon} className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
