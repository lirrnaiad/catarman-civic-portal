import { listReports } from "@/lib/store";
import AdminDashboard from "@/app/admindashboard/AdminDashboard";
import { logout } from "@/app/login/actions";
import Icon from "@/components/Icon";

// Always read fresh data — this page must not be statically cached.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Civic Report",
};

export default async function AdminPage() {
  const reports = await listReports();
  return (
    <>
      {/* Only reachable when signed in (proxy.ts). */}
      <div className="mx-auto flex w-full max-w-[1100px] items-center justify-end gap-3 px-4 pt-3 text-sm text-slate-600">
        <span>Signed in as LGU admin</span>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Icon name="arrowRight" className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
      <AdminDashboard initialReports={reports} />
    </>
  );
}
