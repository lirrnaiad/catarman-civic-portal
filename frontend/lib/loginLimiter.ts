/**
 * Slows password guessing on the staff login (OWASP A07).
 *
 * Two layers, both in memory (one server process; a restart clears them):
 * - Per client IP: 5 wrong passwords, then that IP waits 15 minutes.
 * - Site-wide: 20 wrong passwords in a minute from anywhere pauses all
 *   logins for that minute. This catches guessers who fake a new IP per try
 *   (Next trusts a client-sent X-Forwarded-For when not behind a proxy).
 *   The cost: a sustained attack can keep staff out, one minute at a time.
 */
const PER_IP_MAX = 5;
const PER_IP_WINDOW_MS = 15 * 60_000;
const GLOBAL_MAX = 20;
const GLOBAL_WINDOW_MS = 60_000;

const failuresByIp = new Map<string, number[]>();
let globalFailures: number[] = [];

const recent = (times: number[], windowMs: number, now: number) => times.filter((t) => now - t < windowMs);

/** True when this IP (or the whole site) must wait before trying again. */
export function loginLocked(ip: string): boolean {
  const now = Date.now();
  globalFailures = recent(globalFailures, GLOBAL_WINDOW_MS, now);
  const mine = recent(failuresByIp.get(ip) ?? [], PER_IP_WINDOW_MS, now);
  return globalFailures.length >= GLOBAL_MAX || mine.length >= PER_IP_MAX;
}

export function recordLoginFailure(ip: string): void {
  const now = Date.now();
  globalFailures.push(now);
  failuresByIp.set(ip, [...recent(failuresByIp.get(ip) ?? [], PER_IP_WINDOW_MS, now), now]);
  // Keep the map from growing without bound under a spray of fake IPs.
  if (failuresByIp.size > 5000) {
    for (const [key, times] of failuresByIp) {
      if (!recent(times, PER_IP_WINDOW_MS, now).length) failuresByIp.delete(key);
    }
  }
}

export function clearLoginFailures(ip: string): void {
  failuresByIp.delete(ip);
}
