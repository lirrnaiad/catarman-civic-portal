import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, readSession } from "@/lib/auth";

/**
 * Staff-only routes.
 * - Public: submitting reports (live + offline flush) and reading events.
 * - MDRRMO admin only: the reports dashboard and report list/status APIs.
 * - Any office: the events manager (/agency) and event writes. Which
 *   events an office may change is enforced in the route handlers.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const isApi = pathname.startsWith("/api/");

  if (pathname === "/api/reports" && method === "POST") return NextResponse.next();
  if (pathname.startsWith("/api/events") && method === "GET") return NextResponse.next();

  const session = await readSession(request.cookies.get(ADMIN_COOKIE)?.value);
  const adminOnly = pathname.startsWith("/admindashboard") || pathname.startsWith("/api/reports");

  if (session && (!adminOnly || session.role === "admin")) return NextResponse.next();

  if (session) {
    // Signed in as an agency, but this is MDRRMO-only.
    if (isApi) return NextResponse.json({ ok: false, message: "MDRRMO only." }, { status: 403 });
    return NextResponse.redirect(new URL("/agency", request.url));
  }

  if (isApi) {
    return NextResponse.json({ ok: false, message: "Staff login required." }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admindashboard/:path*", "/api/reports/:path*", "/agency/:path*", "/api/events/:path*"],
};
