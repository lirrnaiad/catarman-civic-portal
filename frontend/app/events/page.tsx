"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";

const events = [
  {
    id: 1,
    day: 22,
    title: "Barangay Assembly",
    time: "7:00 AM – 9:00 AM",
    location: "Barangay Hall",
    category: "Community",
    description:
      "Community assembly for residents to discuss local concerns and upcoming activities.",
  },
  {
    id: 2,
    day: 24,
    title: "DRRM Briefing",
    time: "9:00 AM – 11:00 AM",
    location: "Catarman Civic Center",
    category: "Safety",
    description:
      "A community briefing on disaster preparedness, emergency contacts, and what residents should do before, during, and after an emergency.",
  },
  {
    id: 3,
    day: 26,
    title: "Waste Collection Change",
    time: "Starts 6:00 AM",
    location: "All Barangays",
    category: "Environment",
    description:
      "Updated waste collection schedule for selected barangays.",
  },
];

const days = [
  null,
  null,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
];

export default function EventsPage() {
  const [selectedDay, setSelectedDay] = useState(22);

  const selectedEvent = events.find(
    (event) => event.day === selectedDay
  );

  return (
    <main className="min-h-screen bg-background text-slate-900">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        id="civic-sidebar"
        popover="auto"
        className="
          civic-sidebar
          fixed
          left-0
          top-0
          m-0
          h-screen
          w-64
          border-0
          bg-civic-strong
          px-5
          py-6
          text-white
          shadow-2xl
        "
      >

        {/* SIDEBAR HEADER */}

        <div className="relative flex items-center pr-12">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-sm">
              <Icon name="shield" className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-lg font-bold leading-tight">
                CivicConnect
              </h1>

              <p className="mt-1 text-xs leading-4 text-white/70">
                Catarman, Northern Samar
              </p>
            </div>

          </div>


          {/* CLOSE */}

          <button
            type="button"
            popoverTarget="civic-sidebar"
            popoverTargetAction="hide"
            className="
              absolute
              right-0
              top-1/2
              flex
              h-9
              w-9
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white/15
              text-lg
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:bg-white
              hover:text-civic
              active:scale-90
            "
            aria-label="Close sidebar"
          >
            <Icon name="close" />
          </button>

        </div>


        {/* MENU */}

        <nav className="mt-10 space-y-2">

          {/* HOME */}

          <Link
            href="/"
            className="
              group
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-white/90
              transition-all
              duration-300
              hover:bg-white
              hover:text-civic
              hover:shadow-md
            "
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg transition-all duration-300 group-hover:bg-civic-muted">
              <Icon name="home" />
            </span>

            <span className="font-medium">
              Home
            </span>
          </Link>


          {/* EVENTS */}

          <Link
            href="/events"
            className="
              group
              flex
              items-center
              gap-3
              rounded-xl
              bg-white/20
              px-4
              py-3
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-300
              hover:bg-white
              hover:text-civic
            "
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-lg transition-all duration-300 group-hover:bg-civic-muted">
              <Icon name="calendar" />
            </span>

            <span>
              Events
            </span>
          </Link>


          {/* SERVICES */}

          <button
            type="button"
            className="
              group
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-left
              text-white/90
              transition-all
              duration-300
              hover:bg-white
              hover:text-civic
              hover:shadow-md
            "
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg transition-all duration-300 group-hover:bg-civic-muted">
              <Icon name="grid" />
            </span>

            <span className="font-medium">
              Services
            </span>
          </button>


          {/* ALERTS */}

          <button
            type="button"
            className="
              group
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-left
              text-white/90
              transition-all
              duration-300
              hover:bg-white
              hover:text-civic
              hover:shadow-md
            "
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg transition-all duration-300 group-hover:bg-civic-muted">
              <Icon name="bell" />
            </span>

            <span className="font-medium">
              Alerts
            </span>
          </button>


          {/* ABOUT */}

          <button
            type="button"
            className="
              group
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-left
              text-white/90
              transition-all
              duration-300
              hover:bg-white
              hover:text-civic
              hover:shadow-md
            "
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg transition-all duration-300 group-hover:bg-civic-muted">
              <Icon name="info" />
            </span>

            <span className="font-medium">
              About
            </span>
          </button>

        </nav>


        {/* SLOGAN */}

        <div className="absolute bottom-8 left-0 right-0 px-5 text-center">

          <p className="text-sm font-medium italic leading-6 text-white/65">
            Stronger Communities
            <br />
            Brighter Tomorrows
          </p>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="min-h-screen">

        {/* HEADER */}

        <header
          className="
            sticky
            top-0
            z-30
            flex
            h-20
            items-center
            gap-4
            bg-civic-strong
            px-4
            text-white
            shadow-sm
            sm:px-7
          "
        >

          {/* HAMBURGER */}

          <button
            type="button"
            popoverTarget="civic-sidebar"
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-white/15
              text-2xl
              text-white
              shadow-sm
              transition-all
              duration-300
              hover:bg-white
              hover:text-civic
              hover:shadow-md
              active:scale-90
            "
            aria-label="Open sidebar"
          >
            <Icon name="menu" className="h-6 w-6" />
          </button>


          {/* SEARCH */}

          <div className="w-full max-w-md ml-auto">

            <div
              className="
                flex
                h-11
                w-full
                items-center
                gap-3
                rounded-full
                border
                border-white/20
                bg-white/15
                px-4
                text-sm
                text-white/85
                shadow-sm
                backdrop-blur-md
                transition-all
                duration-300
                hover:bg-white/20
                sm:px-5
              "
            >

              <Icon name="search" />

              <input
                type="text"
                placeholder="Search events, services, or announcements..."
                className="
                  w-full
                  bg-transparent
                  text-white
                  outline-none
                  placeholder:text-white/70
                "
              />

            </div>

          </div>

        </header>


        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-7 lg:px-8">

          {/* TITLE */}

          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Events Calendar
              </h2>

              <p className="mt-2 max-w-xl text-slate-500">
                Stay informed about what's happening in your community.
              </p>

              <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-civic">
                <Icon name="mapPin" className="h-4 w-4" />
                Catarman, Northern Samar
              </p>

            </div>


            <button
              type="button"
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-civic-muted
                px-6
                py-3
                text-sm
                font-bold
                text-civic
                shadow-sm
                transition-all
                duration-300
                hover:bg-civic-line
                hover:-translate-y-0.5
                hover:shadow-md
                active:scale-95
              "
            >
              All Events
              <Icon name="arrowRight" className="h-4 w-4" />
            </button>

          </div>


          {/* MAIN GRID */}

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">

            {/* LEFT */}

            <div>

              {/* CALENDAR */}

              <section
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  transition-shadow
                  duration-300
                  hover:shadow-md
                  sm:p-7
                "
              >

                {/* CALENDAR HEADER */}

                <div className="mb-6 flex items-center justify-between">

                  <div>

                    <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      September 2026
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Select a date to view events
                    </p>

                  </div>


                  {/* MONTH BUTTONS */}

                  <div className="flex gap-2">

                    <button
                      type="button"
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                        text-lg
                        text-slate-600
                        transition-all
                        duration-200
                        hover:bg-slate-200
                        active:scale-90
                      "
                      aria-label="Previous month"
                    >
                      <Icon name="chevronLeft" />
                    </button>

                    <button
                      type="button"
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                        text-lg
                        text-slate-600
                        transition-all
                        duration-200
                        hover:bg-slate-200
                        active:scale-90
                      "
                      aria-label="Next month"
                    >
                      <Icon name="chevronRight" />
                    </button>

                  </div>

                </div>


                {/* WEEKDAYS */}

                <div className="mb-3 grid grid-cols-7 text-center text-xs font-semibold text-slate-500">

                  <span className="text-red-500">
                    Sun
                  </span>

                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>

                </div>


                {/* CALENDAR */}

                <div className="grid grid-cols-7 gap-1 sm:gap-2">

                  {days.map((day, index) => {

                    if (day === null) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="h-11 sm:h-14"
                        />
                      );
                    }

                    const event = events.find(
                      (item) => item.day === day
                    );

                    const selected =
                      selectedDay === day;

                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() =>
                          setSelectedDay(day)
                        }
                        className={`
                          relative
                          flex h-11
                          flex-col
                          items-center
                          justify-center
                          rounded-full
                          text-sm
                          font-medium
                          transition-all
                          duration-200
                          sm:h-14

                          ${
                            selected
                              ? "scale-105 bg-civic text-white shadow-md shadow-blue-200"
                              : "text-slate-700 hover:scale-105 hover:bg-slate-100"
                          }
                        `}
                      >

                        <span>
                          {day}
                        </span>


                        {event && !selected && (
                          <span
                            className={`
                              absolute
                              bottom-2
                              h-1.5
                              w-1.5
                              rounded-full

                              ${
                                event.category === "Safety"
                                  ? "bg-civic"
                                  : event.category === "Environment"
                                  ? "bg-orange-400"
                                  : "bg-violet-600"
                              }
                            `}
                          />
                        )}

                      </button>
                    );

                  })}

                </div>


                {/* LEGEND */}

                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-t border-slate-100 pt-5 text-xs text-slate-500">

                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
                    Community
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-civic" />
                    Safety
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                    Environment
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    Notice
                  </span>

                </div>

              </section>


              {/* UPCOMING EVENTS */}

              <section className="mt-7">

                <div className="mb-4 flex items-center justify-between">

                  <h3 className="text-2xl font-bold text-slate-900">
                    Upcoming Events
                  </h3>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 font-semibold text-civic transition-colors duration-200 hover:text-civic-hover"
                  >
                    See All
                    <Icon name="arrowRight" className="h-4 w-4" />
                  </button>

                </div>


                <div className="space-y-3">

                  {events.map((event) => (

                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="
                        group
                        flex
                        items-center
                        gap-4
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:border-civic-line
                        hover:shadow-lg
                      "
                    >

                      <div
                        className={`
                          flex
                          h-14
                          w-14
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl

                          ${
                            event.category === "Safety"
                              ? "bg-civic-muted text-civic"
                              : event.category === "Environment"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-violet-100 text-violet-700"
                          }
                        `}
                      >
                        <Icon
                          name={
                            event.category === "Safety"
                              ? "shield"
                              : event.category === "Environment"
                              ? "leaf"
                              : "users"
                          }
                          className="h-6 w-6"
                        />
                      </div>


                      <div className="min-w-0 flex-1">

                        <h4 className="font-bold text-slate-900 transition-colors duration-200 group-hover:text-civic">
                          {event.title}
                        </h4>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Icon name="clock" className="h-3.5 w-3.5" />
                          {event.time}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Icon name="mapPin" className="h-3.5 w-3.5" />
                          {event.location}
                        </p>

                      </div>


                      <div className="hidden rounded-xl bg-slate-100 px-4 py-2 text-center transition-colors duration-200 group-hover:bg-civic-soft sm:block">

                        <p className="text-[10px] font-bold text-civic">
                          SEP
                        </p>

                        <p className="text-xl font-bold text-slate-900">
                          {event.day}
                        </p>

                      </div>

                    </Link>

                  ))}

                </div>

              </section>

            </div>


            {/* EVENT DETAILS */}

            <section
              className="
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                transition-shadow
                duration-300
                hover:shadow-md
                sm:p-7
              "
            >

              {selectedEvent && (

                <div>

                  <div className="mb-6 flex items-center justify-between">

                    <span className="text-sm font-semibold text-civic">
                      Event Details
                    </span>

                    <Icon name="arrowUpRight" className="h-5 w-5 text-slate-500" />

                  </div>


                  <div className="rounded-2xl bg-civic-soft p-6">

                    <p className="text-xs font-bold uppercase tracking-wide text-civic">
                      {selectedEvent.category}
                    </p>

                    <h3 className="mt-3 text-2xl font-bold text-slate-900">
                      {selectedEvent.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      September {selectedEvent.day}, 2026
                    </p>

                  </div>


                  {/* WHEN */}

                  <div className="mt-7">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      When
                    </p>

                    <p className="mt-2 flex items-center gap-2 font-bold text-slate-800">
                      <Icon name="clock" className="h-4 w-4 text-civic" />
                      {selectedEvent.time}
                    </p>

                  </div>


                  {/* WHERE */}

                  <div className="mt-6">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Where
                    </p>

                    <p className="mt-2 flex items-center gap-2 font-bold text-slate-800">
                      <Icon name="mapPin" className="h-4 w-4 text-civic" />
                      {selectedEvent.location} • Catarman
                    </p>

                  </div>


                  {/* ABOUT */}

                  <div className="mt-6">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      About this event
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {selectedEvent.description}
                    </p>

                  </div>


                  {/* CALENDAR BUTTON */}

                  <button
                    type="button"
                    className="
                      mt-8
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      bg-civic
                      py-4
                      font-bold
                      text-white
                      shadow-sm
                      transition-all
                      duration-300
                      hover:bg-civic-hover
                      hover:-translate-y-0.5
                      hover:shadow-lg
                      active:scale-[0.98]
                    "
                  >
                    <Icon name="calendar" />
                    Add to my calendar
                  </button>


                  {/* PUBLISHED */}

                  <div className="mt-7 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
                    Published by Municipal DRRM Office
                  </div>

                </div>

              )}

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}