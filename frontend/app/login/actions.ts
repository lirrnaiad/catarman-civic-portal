"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, SESSION_MAX_AGE_S, createSessionToken, passwordMatches } from "@/lib/auth";

/** Only allow redirects back into this site (no `//evil.com` or absolute URLs). */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/admindashboard";
}

export async function login(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const password = String(formData.get("password") ?? "");

  if (!passwordMatches(password)) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  (await cookies()).set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.ADMIN_COOKIE_INSECURE !== "1",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
  redirect(next);
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/");
}
