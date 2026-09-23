"use client";

import Link from "next/link";
import { useState } from "react";

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
    <main className="min-h-screen bg-[#F5F9F8] text-[#10233F]">

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
          bg-gradient-to-b
          from-emerald-600
          via-emerald-500
          to-teal-500
          px-5
          py-6
          text-white
          shadow-2xl
        "
      >

        {/* SIDEBAR HEADER */}

        <div className="relative flex items-center pr-12">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl shadow-sm">
              🌿
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
              hover:text-emerald-600
              active:scale-90
            "
            aria-label="Close sidebar"
          >
            ✕
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
              hover:text-emerald-600
              hover:shadow-md
            "
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg transition-all duration-300 group-hover:bg-emerald-100">
              🏠
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
              hover:text-emerald-600
            "
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-lg transition-all duration-300 group-hover:bg-emerald-100">
              📅
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
              hover:text-emerald-600
              hover:shadow-md
            "
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg transition-all duration-300 group-hover:bg-emerald-100">
              ▦
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
              hover:text-emerald-600
              hover:shadow-md
            "
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg transition-all duration-300 group-hover:bg-emerald-100">
              🔔
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
              hover:text-emerald-600
              hover:shadow-md
            "
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg transition-all duration-300 group-hover:bg-emerald-100">
              ⓘ
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
            bg-gradient-to-r
            from-emerald-600
            via-emerald-500
            to-teal-500
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
              hover:text-emerald-600
              hover:shadow-md
              active:scale-90
            "
            aria-label="Open sidebar"
          >
            ☰
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

              <span>
                🔍
              </span>

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

              <p className="mt-3 text-sm font-semibold text-emerald-600">
                📍 Catarman, Northern Samar
              </p>

            </div>


            <button
              type="button"
              className="
                rounded-full
                bg-emerald-100
                px-6
                py-3
                text-sm
                font-bold
                text-emerald-700
                shadow-sm
                transition-all
                duration-300
                hover:bg-emerald-200
                hover:-translate-y-0.5
                hover:shadow-md
                active:scale-95
              "
            >
              All Events →
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

                    <p className="mt-1 text-xs text-slate-400">
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
                    >
                      ‹
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
                    >
                      ›
                    </button>

                  </div>

                </div>


                {/* WEEKDAYS */}

                <div className="mb-3 grid grid-cols-7 text-center text-xs font-semibold text-slate-400">

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
                              ? "scale-105 bg-blue-600 text-white shadow-md shadow-blue-200"
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
                                  ? "bg-blue-600"
                                  : event.category === "Environment"
                                  ? "bg-orange-400"
                                  : "bg-emerald-500"
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
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Community
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
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
                    className="font-semibold text-emerald-600 transition-colors duration-200 hover:text-emerald-700"
                  >
                    See All →
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
                        hover:border-emerald-200
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
                          text-xl

                          ${
                            event.category === "Safety"
                              ? "bg-blue-100 text-blue-600"
                              : event.category === "Environment"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-emerald-100 text-emerald-600"
                          }
                        `}
                      >
                        {event.category === "Safety"
                          ? "🛡️"
                          : event.category === "Environment"
                          ? "🍃"
                          : "👥"}
                      </div>


                      <div className="min-w-0 flex-1">

                        <h4 className="font-bold text-slate-900 transition-colors duration-200 group-hover:text-emerald-700">
                          {event.title}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          🕐 {event.time}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          📍 {event.location}
                        </p>

                      </div>


                      <div className="hidden rounded-xl bg-slate-100 px-4 py-2 text-center transition-colors duration-200 group-hover:bg-emerald-50 sm:block">

                        <p className="text-[10px] font-bold text-emerald-600">
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

                    <span className="text-sm font-semibold text-blue-600">
                      Event Details
                    </span>

                    <span className="text-lg text-slate-400">
                      ↗
                    </span>

                  </div>


                  <div className="rounded-2xl bg-blue-50 p-6">

                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
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

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      When
                    </p>

                    <p className="mt-2 font-bold text-slate-800">
                      🕐 {selectedEvent.time}
                    </p>

                  </div>


                  {/* WHERE */}

                  <div className="mt-6">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Where
                    </p>

                    <p className="mt-2 font-bold text-slate-800">
                      📍 {selectedEvent.location} • Catarman
                    </p>

                  </div>


                  {/* ABOUT */}

                  <div className="mt-6">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
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
                      w-full
                      rounded-full
                      bg-blue-600
                      py-4
                      font-bold
                      text-white
                      shadow-sm
                      transition-all
                      duration-300
                      hover:bg-blue-700
                      hover:-translate-y-0.5
                      hover:shadow-lg
                      active:scale-[0.98]
                    "
                  >
                    📅 Add to my calendar
                  </button>


                  {/* PUBLISHED */}

                  <div className="mt-7 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
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