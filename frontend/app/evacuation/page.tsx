import CentersView from "@/components/evacuation/CentersView";
import TabTransition from "@/components/TabTransition";
import { listCenters } from "@/lib/centers";

// Occupancy changes minute to minute during an evacuation; always fresh.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Evacuation Centers · Catarman Civic Portal",
};

export default async function EvacuationPage() {
  const centers = await listCenters();
  return (
    <TabTransition>
      <CentersView initialCenters={centers} now={Date.now()} />
    </TabTransition>
  );
}
