"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, SESSION_MAX_AGE_S, createSessionToken, findAccount } from "@/lib/auth";

/** Only allow redirects back into this site (no `//evil.com` or absolute URLs). */
function safeNext(value: FormDataEntryValue | null): string | null {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function login(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const password = String(formData.get("password") ?? "");

  const session = findAccount(password);
  if (!session) {
    redirect(`/login?error=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

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
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/");
}
