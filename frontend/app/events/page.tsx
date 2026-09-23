import EventsView from "@/components/events/EventsView";
import TabTransition from "@/components/TabTransition";
import { listEvents } from "@/lib/events";

// Events change whenever an office publishes; always read fresh.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Events · Catarman Civic Portal",
};

export default async function EventsPage() {
  const events = await listEvents();
  return (
    <TabTransition>
      <EventsView events={events} now={Date.now()} />
    </TabTransition>
  );
}
