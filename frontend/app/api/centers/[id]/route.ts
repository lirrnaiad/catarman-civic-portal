import { NextRequest, NextResponse } from "next/server";
import { deleteCenter, getCenter, updateCenter } from "@/lib/centers";
import { parseCenterInput } from "@/lib/centerInput";

export const runtime = "nodejs";

async function idFrom(params: RouteContext<"/api/centers/[id]">["params"]) {
  const id = Number((await params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** MDRRMO only (proxy.ts): partial update, e.g. { currentOccupancy } or { isOpen }. */
export async function PATCH(req: NextRequest, { params }: RouteContext<"/api/centers/[id]">) {
  const id = await idFrom(params);
  if (!id || !(await getCenter(id))) return NextResponse.json({ ok: false, message: "Center not found." }, { status: 404 });
  const parsed = parseCenterInput(await req.json().catch(() => null), true);
  if ("error" in parsed) return NextResponse.json({ ok: false, message: parsed.error }, { status: 400 });
  return NextResponse.json({ ok: true, center: await updateCenter(id, parsed.input) });
}

/** MDRRMO only (proxy.ts). */
export async function DELETE(_req: NextRequest, { params }: RouteContext<"/api/centers/[id]">) {
  const id = await idFrom(params);
  if (!id || !(await deleteCenter(id))) return NextResponse.json({ ok: false, message: "Center not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
