"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { ADMIN_COOKIE, SESSION_MAX_AGE_S, createSessionToken, findAccount, readSession } from "@/lib/auth";
import { clearLoginFailures, loginLocked, recordLoginFailure } from "@/lib/loginLimiter";

/**
 * Only allow redirects back into this site (no `//evil.com` or absolute URLs).
 * Backslashes are refused too: browsers read `/\evil.com` as `//evil.com`.
 */
function safeNext(value: FormDataEntryValue | null): string | null {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : null;
}

export async function login(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const password = String(formData.get("password") ?? "");

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const back = (error: string) => `/login?error=${error}${next ? `&next=${encodeURIComponent(next)}` : ""}`;

  // Checked before the password, so a locked-out guesser learns nothing.
  if (loginLocked(ip)) {
    audit("anonymous", "login.locked", { ip });
    redirect(back("locked"));
  }

  const session = findAccount(password);
  if (!session) {
    recordLoginFailure(ip);
    audit("anonymous", "login.failed", { ip });
    redirect(back("1"));
  }
  clearLoginFailures(ip);
  audit(session, "login.ok", { ip });

  (await cookies()).set(ADMIN_COOKIE, await createSessionToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.ADMIN_COOKIE_INSECURE !== "1",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
  // MDRRMO lands on the reports dashboard, other offices on their events.
  const home = session.role === "admin" ? "/admindashboard" : "/agency";
  redirect(next && (session.role === "admin" || !next.startsWith("/admindashboard")) ? next : home);
}

export async function logout() {
  const jar = await cookies();
  const session = await readSession(jar.get(ADMIN_COOKIE)?.value);
  if (session) audit(session, "logout");
  jar.delete(ADMIN_COOKIE);
  redirect("/");
}
