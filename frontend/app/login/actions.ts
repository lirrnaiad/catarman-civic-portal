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

/**
 * The client address for rate limiting. Proxies (e.g. Azure App Service)
 * append the address they saw, so the LAST X-Forwarded-For entry is the
 * trustworthy one; earlier entries can be forged by the client. Azure also
 * adds the source port ("1.2.3.4:5678"), which changes per connection, so
 * it's stripped.
 */
function clientIp(forwardedFor: string | null): string {
  const last = forwardedFor?.split(",").pop()?.trim() ?? "";
  const bracketed = last.match(/^\[(.+)\]:\d+$/); // [IPv6]:port
  if (bracketed) return bracketed[1];
  const v4WithPort = last.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  return v4WithPort ? v4WithPort[1] : last;
}

export async function login(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const password = String(formData.get("password") ?? "");

  const h = await headers();
  const ip = clientIp(h.get("x-forwarded-for")) || h.get("x-real-ip") || "unknown";
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
