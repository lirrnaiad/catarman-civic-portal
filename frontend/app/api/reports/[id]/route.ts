import { NextRequest, NextResponse } from "next/server";
import type { ReportStatus } from "@/lib/types";
import { getReport, updateReportStatus } from "@/lib/store";
import { audit } from "@/lib/audit";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const VALID_STATUSES: ReportStatus[] = ["new", "in_progress", "resolved"];

/** MDRRMO only (proxy.ts): one report with its photos, for the detail panel. */
export async function GET(_req: NextRequest, { params }: RouteContext<"/api/reports/[id]">) {
  const report = await getReport((await params).id);
  if (!report) return NextResponse.json({ ok: false, message: "Report not found." }, { status: 404 });
  return NextResponse.json({ ok: true, report });
}

export async function PATCH(req: NextRequest, { params }: RouteContext<"/api/reports/[id]">) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { ok: false, message: `status must be one of ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const updated = await updateReportStatus(id, status);
  if (!updated) {
    return NextResponse.json({ ok: false, message: "Report not found." }, { status: 404 });
  }

  const session = await getSession();
  if (session) audit(session, "report.status", { id, status });
  return NextResponse.json({ ok: true, report: updated });
}
