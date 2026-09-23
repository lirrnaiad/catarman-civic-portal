import CentersManager from "@/components/evacuation/CentersManager";
import { listCenters } from "@/lib/centers";

// MDRRMO only: covered by proxy.ts's /admindashboard rule.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage evacuation centers · Catarman Civic Portal",
};

export default async function ManageCentersPage() {
  return <CentersManager initialCenters={await listCenters()} />;
}
