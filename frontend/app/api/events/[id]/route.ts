import { NextRequest, NextResponse } from "next/server";
import { deleteEvent, getEvent, updateEvent } from "@/lib/events";
import { parseEventInput } from "@/lib/eventInput";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

async function idFrom(params: RouteContext<"/api/events/[id]">["params"]) {
  const id = Number((await params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_req: NextRequest, { params }: RouteContext<"/api/events/[id]">) {
  const id = await idFrom(params);
  const event = id ? await getEvent(id) : null;
  if (!event) return NextResponse.json({ ok: false, message: "Event not found." }, { status: 404 });
  return NextResponse.json({ ok: true, event });
}

/** Staff: edit an event. Offices can only edit their own. */
export async function PATCH(req: NextRequest, { params }: RouteContext<"/api/events/[id]">) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, message: "Staff login required." }, { status: 401 });
  const id = await idFrom(params);
  const existing = id ? await getEvent(id) : null;
  if (!id || !existing) return NextResponse.json({ ok: false, message: "Event not found." }, { status: 404 });
  if (existing.agency !== session.agency) {
    return NextResponse.json({ ok: false, message: `Only ${existing.agency} can edit this event.` }, { status: 403 });
  }

  const parsed = parseEventInput(await req.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ ok: false, message: parsed.error }, { status: 400 });

  const event = await updateEvent(id, session.agency, parsed.input);
  return NextResponse.json({ ok: true, event });
}

/** Staff: delete an event. Offices can only delete their own. */
export async function DELETE(_req: NextRequest, { params }: RouteContext<"/api/events/[id]">) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, message: "Staff login required." }, { status: 401 });
  const id = await idFrom(params);
  const existing = id ? await getEvent(id) : null;
  if (!id || !existing) return NextResponse.json({ ok: false, message: "Event not found." }, { status: 404 });
  if (existing.agency !== session.agency) {
    return NextResponse.json({ ok: false, message: `Only ${existing.agency} can delete this event.` }, { status: 403 });
  }
  await deleteEvent(id, session.agency);
  return NextResponse.json({ ok: true });
}
