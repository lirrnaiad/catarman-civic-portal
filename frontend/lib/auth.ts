/**
 * Shared LGU admin login (FR6, Story 4.1): one password for agency staff,
 * set per deployment in frontend/.env.local as ADMIN_PASSWORD. Citizens
 * never log in; only /admindashboard and the admin report APIs need it.
 *
 * The session cookie holds an HMAC of a fixed label, keyed by the password
 * (or ADMIN_SESSION_SECRET if set). Changing the password logs everyone out.
 * Web Crypto only, so this runs in both proxy.ts and server code.
 */

export const ADMIN_COOKIE = "civic_admin";
export const SESSION_MAX_AGE_S = 60 * 60 * 12; // one shift

const encoder = new TextEncoder();

function secret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

export function adminLoginConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

async function hmacHex(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison, so response timing doesn't leak how much matched. */
function safeEqual(a: string, b: string): boolean {
  const x = encoder.encode(a);
  const y = encoder.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD is not set");
  return hmacHex(key, "catarman-civic-admin-v1");
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  const key = secret();
  if (!key || !token) return false;
  return safeEqual(token, await createSessionToken());
}

export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(input, expected as string);
}
