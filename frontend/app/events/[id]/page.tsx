import Link from "next/link";
import Icon from "@/components/Icon";

const events = [
  {
    id: 1,
    day: "25",
    month: "SEP",
    title: "Barangay Assembly",
    time: "9:00 AM",
    location: "Barangay Hall",
    agency: "Barangay XYZ",
    description:
      "Community assembly for residents to discuss local concerns and upcoming activities.",
  },
  {
    id: 2,
    day: "27",
    month: "SEP",
    title: "DRRM Briefing",
    time: "2:00 PM",
    location: "Municipal Hall",
    agency: "MDRRMO",
    description:
      "Community disaster preparedness briefing and emergency response orientation.",
  },
  {
    id: 3,
    day: "29",
    month: "SEP",
    title: "Waste Collection Schedule",
    time: "7:00 AM",
    location: "Various Barangays",
    agency: "MENRO",
    description:
      "Updated waste collection schedule for selected barangays.",
  },
];

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = events.find(
    (item) => item.id === Number(id)
  );

  if (!event) {
    return (
      <main className="min-h-screen bg-background px-5 py-8">
        <div className="mx-auto max-w-3xl">

          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-civic"
          >
            <Icon name="arrowLeft" className="h-4 w-4" />
            Back to Events
          </Link>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              Event not found
            </h1>

            <p className="mt-2 text-slate-600">
              The event you are looking for does not exist.
            </p>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-3xl">

        {/* Back button */}
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-civic hover:text-civic-hover"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Event card */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">

          {/* Date banner */}
          <div className="bg-civic-strong px-6 py-8 text-white">
            <p className="text-sm font-semibold">
              {event.month}
            </p>

            <p className="text-5xl font-bold">
              {event.day}
            </p>
          </div>

          {/* Event details */}
          <div className="p-6">

            <p className="text-sm font-semibold uppercase tracking-wide text-civic">
              {event.agency}
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {event.title}
            </h1>

            <div className="mt-8 space-y-6">

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Date
                </p>

                <p className="mt-1 text-slate-900">
                  September {event.day}, 2026
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Time
                </p>

                <p className="mt-1 text-slate-900">
                  {event.time}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Location
                </p>

                <p className="mt-1 text-slate-900">
                  {event.location}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Description
                </p>

                <p className="mt-2 leading-7 text-slate-600">
                  {event.description}
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}