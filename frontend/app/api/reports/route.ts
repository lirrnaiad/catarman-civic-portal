import { NextRequest, NextResponse } from "next/server";
import type { AdminReport, ReportCategory, ReportPayload, ReportPhoto } from "@/lib/types";
import { insertReport, listReports } from "@/lib/store";

// Talks to MySQL via lib/store (mysql2 needs Node) — must not run on the Edge runtime.
export const runtime = "nodejs";

const VALID_CATEGORIES: ReportCategory[] = [
  "flood_landslide",
  "garbage",
  "crime",
  "infrastructure",
];

/**
 * Default receiving endpoint for <ReportForm />, used when the component is
 * NOT given an `onSubmit` prop. Also the endpoint the offline sync flush
 * (lib/offlineSync.ts) posts queued reports back to once connectivity
 * returns, and the endpoint the admin dashboard reads from.
 *
 * This is the integration point: swap the body of the try block to write to
 * your own database, push to a queue, or forward to an external system's
 * API. `EXTERNAL_REPORTS_WEBHOOK_URL` shows one common pattern — server-side
 * forwarding avoids CORS issues that would come from calling a third-party
 * API directly from the browser.
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let payload: ReportPayload;

    if (contentType.includes("application/json")) {
      // Comes from the offline queue flush (lib/offlineSync.ts) — photos are
      // already base64 data URLs from when the report was first queued.
      payload = (await req.json()) as ReportPayload;
    } else {
      // Comes from a live submission from <ReportForm />.
      const formData = await req.formData();
      const files = formData.getAll("photos").filter((f): f is File => f instanceof File);
      const photos: ReportPhoto[] = await Promise.all(
        files.map(async (file) => ({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          dataUrl: `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString(
            "base64"
          )}`,
        }))
      );
      const accuracyRaw = formData.get("accuracy");
      payload = {
        id: String(formData.get("id") ?? ""),
        category: String(formData.get("category") ?? "") as ReportCategory,
        description: String(formData.get("description") ?? ""),
        location: {
          lat: Number(formData.get("lat")),
          lng: Number(formData.get("lng")),
          accuracy: accuracyRaw ? Number(accuracyRaw) : undefined,
        },
        photos,
        reporterContact: formData.get("reporterContact")?.toString() || undefined,
        barangay: formData.get("barangay")?.toString() || undefined,
        createdAt: String(formData.get("createdAt") ?? new Date().toISOString()),
      };
    }

    if (!payload.id || !VALID_CATEGORIES.includes(payload.category)) {
      return NextResponse.json(
        { ok: false, id: payload.id, message: "Invalid category." },
        { status: 400 }
      );
    }
    // Only category and location are required; everything else is optional
    // so a report takes two taps under stress. (isFinite also rejects a
    // missing lat/lng, which isNaN(undefined) would let through.)
    if (!Number.isFinite(payload.location?.lat) || !Number.isFinite(payload.location?.lng)) {
      return NextResponse.json(
        { ok: false, id: payload.id, message: "Missing location." },
        { status: 400 }
      );
    }
    payload.description = (payload.description ?? "").trim();

    const stored: AdminReport = {
      ...payload,
      status: "new",
      receivedAt: new Date().toISOString(),
    };
    await insertReport(stored);

    // --- Further integration point ------------------------------------------
    // Forward to another system's API/webhook in addition to local storage.
    const webhookUrl = process.env.EXTERNAL_REPORTS_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    // --------------------------------------------------------------------------

    return NextResponse.json({ ok: true, id: payload.id });
  } catch (err) {
    console.error("Failed to process report submission", err);
    return NextResponse.json({ ok: false, message: "Server error." }, { status: 500 });
  }
}

/** Read side for the admin dashboard. Supports ?category=&barangay=&status= */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reports = await listReports({
    category: searchParams.get("category") ?? undefined,
    barangay: searchParams.get("barangay") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });
  return NextResponse.json({ ok: true, reports });
}
