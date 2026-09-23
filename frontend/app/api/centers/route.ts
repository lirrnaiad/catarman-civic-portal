import { NextRequest, NextResponse } from "next/server";
import { createCenter, listCenters, type CenterFields } from "@/lib/centers";
import { parseCenterInput } from "@/lib/centerInput";

export const runtime = "nodejs";

/** Public: all centers with live occupancy. */
export async function GET() {
  return NextResponse.json({ ok: true, centers: await listCenters() });
}

/** MDRRMO only (proxy.ts): add a center. */
export async function POST(req: NextRequest) {
  const parsed = parseCenterInput(await req.json().catch(() => null), false);
  if ("error" in parsed) return NextResponse.json({ ok: false, message: parsed.error }, { status: 400 });
  const center = await createCenter(parsed.input as CenterFields);
  return NextResponse.json({ ok: true, center }, { status: 201 });
}
