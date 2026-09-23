import { NextRequest, NextResponse } from "next/server";
import { createEvent, listEvents } from "@/lib/events";
import { parseEventInput } from "@/lib/eventInput";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

/** Public: upcoming events, soonest first. `?agency=MHO` narrows to one office. */
export async function GET(req: NextRequest) {
  const agency = req.nextUrl.searchParams.get("agency") ?? undefined;
  return NextResponse.json({ ok: true, events: await listEvents({ agency }) });
}

/** Staff: publish an event as the signed-in office (never as the office in the body). */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, message: "Staff login required." }, { status: 401 });

  const parsed = parseEventInput(await req.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ ok: false, message: parsed.error }, { status: 400 });

  const event = await createEvent(session.agency, parsed.input);
  return NextResponse.json({ ok: true, event }, { status: 201 });
}
