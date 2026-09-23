import Image from "next/image";
import Alert from "@/components/Alert";
import { staffLoginConfigured } from "@/lib/auth";
import { login } from "./actions";

export const metadata = {
  title: "LGU staff sign-in · Catarman Civic Portal",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const error = params.error === "1";
  const locked = params.error === "locked";
  const next = typeof params.next === "string" ? params.next : "";
  const configured = staffLoginConfigured();

  return (
    <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Image src="/catarman-logo.png" alt="" width={64} height={64} className="h-16 w-16" />
          <h1 className="mt-3 text-xl font-bold text-slate-900">LGU staff sign-in</h1>
          <p className="mt-1 text-sm text-slate-600">For MDRRMO and municipal offices. Your password opens your office&apos;s account.</p>
        </div>

        <div className="mt-5 space-y-3">
          {error && <Alert variant="danger">Wrong password. Try again.</Alert>}
          {locked && <Alert variant="danger">Too many wrong passwords. Wait 15 minutes, then try again.</Alert>}
          {!configured && (
            <Alert variant="warning">
              Staff login isn&apos;t set up. Add <code>ADMIN_PASSWORD</code> (and optionally <code>AGENCY_PASSWORDS</code>) to <code>frontend/.env.local</code> and restart the app.
            </Alert>
          )}
        </div>

        <form action={login} className="mt-4 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              name="password"
              required
              autoFocus
              autoComplete="current-password"
              className="mt-1 block h-11 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 outline-none focus:border-civic focus:ring-2 focus:ring-civic/30"
            />
          </label>
          <button
            type="submit"
            disabled={!configured}
            className="h-11 w-full rounded-lg bg-civic font-bold text-white transition-colors hover:bg-civic-hover disabled:opacity-50"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
