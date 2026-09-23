import type { Session } from "./auth";

/**
 * One line per staff action (OWASP A09), so "who closed that center?" has an
 * answer. Goes to the server log (stdout); ship that somewhere durable in
 * production. Never pass passwords or tokens in `detail`.
 */
export function audit(who: Session | string, action: string, detail: Record<string, unknown> = {}): void {
  const actor = typeof who === "string" ? who : `${who.role}:${who.agency}`;
  console.info(`[audit] ${new Date().toISOString()} ${actor} ${action} ${JSON.stringify(detail)}`);
}
