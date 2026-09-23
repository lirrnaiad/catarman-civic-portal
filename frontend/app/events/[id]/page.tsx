import Link from "next/link";
import Icon from "@/components/Icon";
import { events } from "@/lib/events";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = events.find(
    (item) => item.id === Number(id)
  );

  /* =====================================================
     EVENT NOT FOUND
  ===================================================== */

  if (!event) {
    return (
      <main className="min-h-screen bg-background px-5 py-8">
        <div className="mx-auto max-w-3xl">

          <Link
            href="/events"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-civic
              transition-colors
              hover:text-civic-hover
            "
          >
            <Icon
              name="arrowLeft"
              className="h-4 w-4"
            />

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


  /* =====================================================
     DATE
  ===================================================== */

  const eventDate = new Date(event.event_datetime);

  const month = eventDate
    .toLocaleDateString("en-US", {
      month: "short",
    })
    .toUpperCase();

  const day = eventDate.toLocaleDateString("en-US", {
    day: "numeric",
  });

  const fullDate = eventDate.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  const time = eventDate.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );


  return (
    <main className="min-h-screen bg-background px-5 py-8 sm:px-6">

      <div className="mx-auto max-w-4xl">

        {/* =================================================
            BACK
        ================================================== */}

        <Link
          href="/events"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-civic
            transition-colors
            hover:text-civic-hover
          "
        >
          <Icon
            name="arrowLeft"
            className="h-4 w-4"
          />

          Back to Events
        </Link>


        {/* =================================================
            EVENT CARD
        ================================================== */}

        <article
          className="
            mt-6
            overflow-hidden
            rounded-3xl
            border
            border-civic-line
            bg-white
            shadow-sm
          "
        >

          {/* =================================================
              DATE HEADER
          ================================================= */}

          <div className="bg-civic-strong px-6 py-8 text-white sm:px-8">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Event
                </p>

                <p className="mt-2 text-sm font-semibold text-white/80">
                  {month}
                </p>

                <p className="text-5xl font-bold leading-none">
                  {day}
                </p>

              </div>


              {/* CALENDAR ICON */}

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">

                <Icon
                  name="calendar"
                  className="h-8 w-8"
                />

              </div>

            </div>

          </div>


          {/* =================================================
              DETAILS
          ================================================== */}

          <div className="p-6 sm:p-8">

            {/* AGENCY */}

            <p className="text-sm font-semibold uppercase tracking-wide text-civic">
              {event.agency}
            </p>


            {/* TITLE */}

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {event.title}
            </h1>


            {/* =================================================
                INFORMATION
            ================================================== */}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              {/* DATE */}

              <div className="rounded-2xl bg-civic-muted p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-civic">

                    <Icon
                      name="calendar"
                      className="h-5 w-5"
                    />

                  </div>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {fullDate}
                    </p>

                  </div>

                </div>

              </div>


              {/* TIME */}

              <div className="rounded-2xl bg-civic-muted p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-civic">

                    <Icon
                      name="clock"
                      className="h-5 w-5"
                    />

                  </div>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Time
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {time}
                    </p>

                  </div>

                </div>

              </div>


              {/* LOCATION */}

              <div className="rounded-2xl bg-civic-muted p-5 sm:col-span-2">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-civic">

                    <Icon
                      name="mapPin"
                      className="h-5 w-5"
                    />

                  </div>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Location
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {event.location}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <div className="mt-8">

              <div className="flex items-center gap-2">

                <Icon
                  name="info"
                  className="h-5 w-5 text-civic"
                />

                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                  About This Event
                </h2>

              </div>


              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                {event.description}
              </p>

            </div>


            {/* =================================================
                BACK BUTTON
            ================================================== */}

            <div className="mt-8">

              <Link
                href="/events"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-civic
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:bg-civic-hover
                  hover:-translate-y-0.5
                  hover:shadow-md
                "
              >

                <Icon
                  name="arrowLeft"
                  className="h-4 w-4"
                />

                Back to Events

              </Link>

            </div>


            {/* =================================================
                PUBLISHED
            ================================================== */}

            <div className="mt-8 border-t border-slate-100 pt-5">

              <p className="text-xs text-slate-500">
                Published by the appropriate municipal agency.
              </p>

            </div>

          </div>

        </article>

      </div>

    </main>
  );
}