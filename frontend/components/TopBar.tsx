import Image from "next/image";
import Link from "next/link";
import ConnectionPill from "@/components/ConnectionPill";

/**
 * Phone/tablet app bar: who this is (seal + name) and whether you're online.
 * Desktop shows the same things in SiteNav's top bar instead.
 */
export default function TopBar() {
  return (
    <header className="sticky top-0 z-[1100] border-b border-slate-200 bg-white lg:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 font-bold text-slate-900">
          <Image src="/catarman-logo.png" alt="" width={32} height={32} className="h-8 w-8 shrink-0" priority />
          <span className="truncate">Catarman Civic Portal</span>
        </Link>
        <ConnectionPill />
      </div>
    </header>
  );
}
