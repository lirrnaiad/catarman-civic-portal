import { listReports } from "@/lib/store";
import AdminDashboard from "@/app/admindashboard/AdminDashboard";

// Always read fresh data — this page must not be statically cached.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Civic Report",
};

export default async function AdminPage() {
  const reports = await listReports();
  return <AdminDashboard initialReports={reports} />;
}
