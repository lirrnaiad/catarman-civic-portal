import { cookies } from "next/headers";
import { ADMIN_COOKIE, readSession, type Session } from "./auth";

/** The signed-in staff session in a Server Component / Route Handler, or null. */
export async function getSession(): Promise<Session | null> {
  return readSession((await cookies()).get(ADMIN_COOKIE)?.value);
}
