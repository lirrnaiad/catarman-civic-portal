/**
 * LGU staff login (FR6, Story 4.1). Citizens never log in.
 *
 * One password per office, set per deployment in frontend/.env.local:
 *   ADMIN_PASSWORD    MDRRMO: the reports dashboard, and events as MDRRMO
 *   AGENCY_PASSWORDS  other offices, e.g. "MHO:pw1,MENRO:pw2" (events only)
 * The password decides the office, and the office is stamped on every
 * event server-side, so an agency can only post and edit as itself.
 *
 * The session cookie is "<role>.<agency>.<expires>.<hmac>", signed with
 * ADMIN_SESSION_SECRET (or the passwords), so it can't be edited to claim
 * another office or outlive its shift. Without ADMIN_SESSION_SECRET, changing
 * or adding any password signs every office out.
 * Web Crypto only, so this runs in both proxy.ts and server code.
 */

export const ADMIN_COOKIE = "civic_admin";
export const SESSION_MAX_AGE_S = 60 * 60 * 12; // one shift

export type Role = "admin" | "agency";
export interface Session {
  role: Role;
  agency: string;
}

const encoder = new TextEncoder();

function accounts(): { password: string; session: Session }[] {
  const list: { password: string; session: Session }[] = [];
  if (process.env.ADMIN_PASSWORD) {
    list.push({ password: process.env.ADMIN_PASSWORD, session: { role: "admin", agency: "MDRRMO" } });
  }
  for (const entry of (process.env.AGENCY_PASSWORDS ?? "").split(",")) {
    const i = entry.indexOf(":");
    if (i <= 0) continue;
    const agency = entry.slice(0, i).trim().toUpperCase();
    const password = entry.slice(i + 1).trim();
    if (/^[A-Z0-9_]+$/.test(agency) && password) list.push({ password, session: { role: "agency", agency } });
  }
  return list;
}

function secret(): string | null {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    [process.env.ADMIN_PASSWORD, process.env.AGENCY_PASSWORDS].filter(Boolean).join("|") ||
    null
  );
}

export function staffLoginConfigured(): boolean {
  return accounts().length > 0;
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

/** The office a password belongs to, or null. Checks every account so timing is uniform. */
export function findAccount(password: string): Session | null {
  let found: Session | null = null;
  for (const account of accounts()) {
    if (safeEqual(password, account.password) && !found) found = account.session;
  }
  return found;
}

export async function createSessionToken(session: Session): Promise<string> {
  const key = secret();
  if (!key) throw new Error("No staff passwords are configured");
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_S;
  const body = `${session.role}.${session.agency}.${expires}`;
  return `${body}.${await hmacHex(key, body)}`;
}

export async function readSession(token: string | undefined): Promise<Session | null> {
  const key = secret();
  if (!key || !token) return null;
  const [role, agency, expires, sig] = token.split(".");
  if ((role !== "admin" && role !== "agency") || !agency || !sig) return null;
  // Enforced server-side too, so a copied cookie stops working after the shift.
  if (!(Number(expires) > Date.now() / 1000)) return null;
  const expected = await hmacHex(key, `${role}.${agency}.${expires}`);
  return safeEqual(sig, expected) ? { role, agency } : null;
}
