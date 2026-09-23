import { notFound } from "next/navigation";
import EventDetail from "@/components/events/EventDetail";
import { getEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/events/[id]">) {
  const event = await getEvent(Number((await params).id));
  return { title: event ? `${event.title} · Catarman Civic Portal` : "Event not found" };
}

export default async function EventDetailPage({ params }: PageProps<"/events/[id]">) {
  const id = Number((await params).id);
  const event = Number.isInteger(id) ? await getEvent(id) : null;
  if (!event) notFound();
  return <EventDetail event={event} now={Date.now()} />;
}
