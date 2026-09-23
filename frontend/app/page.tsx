import ReportForm from "@/app/reportform/ReportForm";

// Reporting is the portal's main tab and the heart of the pitch, so it's the
// landing page. The form itself lives in app/reportform/ (Reporter track).
export default function ReportPage() {
  return (
    <main>
      <div className="mx-auto max-w-[640px] px-4 pt-6">
        <h1 className="text-2xl font-bold text-slate-900">Report an issue</h1>
        <p className="mt-1 text-sm text-slate-600">
          Works offline: if you have no signal, your report is saved and sent later.
        </p>
      </div>
      <ReportForm />
    </main>
  );
}
