import { redirect } from "next/navigation";
import AgencyEvents from "@/components/events/AgencyEvents";
import { listEvents } from "@/lib/events";
import { getSession } from "@/lib/session";
import { AGENCIES } from "@/lib/types";

// Staff-only (proxy.ts). Always fresh: this is where offices publish.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage events · Catarman Civic Portal",
};

export default async function AgencyPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/agency");
  const events = await listEvents({ agency: session.agency, includePast: true });
  return (
    <AgencyEvents
      agency={session.agency}
      agencyName={AGENCIES[session.agency] ?? session.agency}
      isAdmin={session.role === "admin"}
      initialEvents={events}
      now={Date.now()}
    />
  );
}
