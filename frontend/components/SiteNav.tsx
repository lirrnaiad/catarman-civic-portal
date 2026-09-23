"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectionPill from "@/components/ConnectionPill";
import Icon, { type IconName } from "@/components/Icon";

type Tab = { href: string; label: string; icon: IconName };

// Report is the main action (the pitch's core flow): "/" and the raised
// center button. Admin is deliberately absent: staff go to /admin.
const LEFT: Tab = { href: "/evacuation", label: "Centers", icon: "home" };
const MAIN: Tab = { href: "/", label: "Report", icon: "alert" };
const RIGHT: Tab = { href: "/events", label: "Events", icon: "calendar" };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function SideTab({ tab, pathname }: { tab: Tab; pathname: string }) {
  const active = isActive(pathname, tab.href);
  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors lg:flex-none lg:flex-row lg:gap-2 lg:rounded-lg lg:px-3 lg:py-2 lg:text-sm lg:hover:bg-slate-100 ${
        active ? "text-civic lg:bg-slate-100" : "text-slate-500 hover:text-slate-900"
      }`}
    >
      <Icon name={tab.icon} className="h-6 w-6 lg:h-5 lg:w-5" />
      {tab.label}
    </Link>
  );
}

/**
 * Portal-wide navigation, mounted once in the root layout.
 * Phones/tablets: bottom tab bar with Report as a raised center button
 * (the GCash / Instagram "main action in the middle" pattern).
 * Desktop (lg+): top bar with the municipal seal.
 * Its phone height is --nav-h in globals.css; keep the two in sync.
 */
export default function SiteNav() {
  const pathname = usePathname();
  const mainActive = isActive(pathname, MAIN.href);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-[1100] border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(15,23,42,0.06)] lg:sticky lg:top-0 lg:bottom-auto lg:border-t-0 lg:border-b lg:pb-0 lg:shadow-sm"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch lg:h-16 lg:max-w-5xl lg:items-center lg:gap-1 lg:px-6">
        <Link href="/" className="mr-auto hidden items-center gap-2.5 font-bold text-slate-900 lg:flex">
          <Image src="/catarman-logo.png" alt="" width={40} height={40} className="h-10 w-10" priority />
          Catarman Civic Portal
        </Link>

        <SideTab tab={LEFT} pathname={pathname} />

        {/* Main action: raised center button on phones, orange pill on desktop. */}
        <Link
          href={MAIN.href}
          aria-current={mainActive ? "page" : undefined}
          className="group flex flex-1 flex-col items-center justify-end pb-1.5 text-xs font-bold text-hazard lg:mx-1 lg:flex-none lg:justify-center lg:pb-0"
        >
          <span
            className={`-mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-hazard text-white shadow-lg ring-4 ring-white transition-transform group-hover:bg-hazard-hover group-active:scale-95 lg:hidden ${
              mainActive ? "shadow-orange-300" : ""
            }`}
          >
            <Icon name={MAIN.icon} className="h-8 w-8" />
          </span>
          <span className="mt-0.5 lg:hidden">{MAIN.label}</span>
          <span className="hidden h-10 items-center gap-2 rounded-full bg-hazard px-4 text-sm text-white group-hover:bg-hazard-hover lg:inline-flex">
            <Icon name={MAIN.icon} className="h-5 w-5" />
            Report an issue
          </span>
        </Link>

        <SideTab tab={RIGHT} pathname={pathname} />

        <span className="ml-2 hidden lg:inline-flex">
          <ConnectionPill />
        </span>
      </div>
    </nav>
  );
}
