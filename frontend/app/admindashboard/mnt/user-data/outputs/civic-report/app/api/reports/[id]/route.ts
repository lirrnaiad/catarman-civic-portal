import { NextRequest, NextResponse } from "next/server";
import type { ReportStatus } from "@/app/lib/types";
import { updateReportStatus } from "@/app/lib/store";

export const runtime = "nodejs";

const VALID_STATUSES: ReportStatus[] = ["new", "in_progress", "resolved"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const status = body?.status;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { ok: false, message: `status must be one of ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const updated = await updateReportStatus(params.id, status);
  if (!updated) {
    return NextResponse.json({ ok: false, message: "Report not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, report: updated });
}
