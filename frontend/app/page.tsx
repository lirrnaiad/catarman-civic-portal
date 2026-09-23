import ReportForm from "@/app/reportform/ReportForm";
import TabTransition from "@/components/TabTransition";

// Reporting is the portal's main tab and the heart of the pitch, so it's the
// landing page. The form itself lives in app/reportform/ (Reporter track).
export default function ReportPage() {
  return (
    <TabTransition>
      <main>
        <div className="mx-auto max-w-[640px] px-4 pt-6">
          <h1 className="text-2xl font-bold text-slate-900">Report an issue</h1>
          <p className="mt-1 text-sm text-slate-600">
            Two taps: what&apos;s happening, and where. Works even without signal.
          </p>
        </div>
        <ReportForm />
      </main>
    </TabTransition>
  );
}
