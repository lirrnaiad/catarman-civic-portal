import EvacuationView from "@/components/EvacuationView";
import TabTransition from "@/components/TabTransition";

export const metadata = {
  title: "Evacuation Centers · Catarman Civic Portal",
};

export default function EvacuationPage() {
  return (
    <TabTransition>
      <EvacuationView />
    </TabTransition>
  );
}
