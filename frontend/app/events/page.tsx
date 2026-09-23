"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";
import { events } from "@/lib/events";

/* =========================================================
   CALENDAR HELPER
========================================================= */

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return days;
}


/* =========================================================
   GET EVENT DATE
========================================================= */

function getEventDate(event: (typeof events)[number]) {
  return new Date(event.event_datetime);
}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function EventsPage() {
  /* =======================================================
     SELECTED DATE
  ======================================================= */

  const [selectedDay, setSelectedDay] = useState(22);

  /* =======================================================
     SIDEBAR
  ======================================================= */

  /* =======================================================
     CURRENT CALENDAR MONTH
     8 = September
  ======================================================= */

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8);


  /* =======================================================
     CALENDAR DAYS
  ======================================================= */

  const days = getCalendarDays(
    currentYear,
    currentMonth
  );


  /* =======================================================
     MONTH NAME
  ======================================================= */

  const currentMonthName = new Date(
    currentYear,
    currentMonth,
    1
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });


  /* =======================================================
     FIND EVENT FOR SELECTED DAY
  ======================================================= */

  const selectedEvent = events.find((event) => {
    const date = getEventDate(event);

    return (
      date.getFullYear() === currentYear &&
      date.getMonth() === currentMonth &&
      date.getDate() === selectedDay
    );
  });


  /* =======================================================
     PREVIOUS MONTH
  ======================================================= */

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }

    setSelectedDay(1);
  };


  /* =======================================================
     NEXT MONTH
  ======================================================= */

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }

    setSelectedDay(1);
  };


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

              <Icon
                name="shield"
                className="h-6 w-6"
              />

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


          {/* CLOSE BUTTON */}

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

            <Icon
              name="close"
              className="h-5 w-5"
            />

          </button>

        </div>


        {/* =================================================
            SIDEBAR MENU
        ================================================= */}

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

            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-all duration-300 group-hover:bg-civic-muted">

              <Icon
                name="home"
                className="h-5 w-5"
              />

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

            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 transition-all duration-300 group-hover:bg-civic-muted">

              <Icon
                name="calendar"
                className="h-5 w-5"
              />

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

            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-all duration-300 group-hover:bg-civic-muted">

              <Icon
                name="grid"
                className="h-5 w-5"
              />

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

            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-all duration-300 group-hover:bg-civic-muted">

              <Icon
                name="bell"
                className="h-5 w-5"
              />

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

            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-all duration-300 group-hover:bg-civic-muted">

              <Icon
                name="info"
                className="h-5 w-5"
              />

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
          MAIN CONTENT
      ===================================================== */}

      <div className="min-h-screen">


        {/* =================================================
            HEADER
        ================================================= */}

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

            <Icon
              name="menu"
              className="h-6 w-6"
            />

          </button>


          {/* SEARCH */}

          <div className="ml-auto w-full max-w-md">

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

              <Icon
                name="search"
                className="h-5 w-5"
              />

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


        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-7 lg:px-8">


          {/* PAGE TITLE */}

          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Events Calendar
              </h2>

              <p className="mt-2 max-w-xl text-slate-500">
                Stay informed about what's happening in your community.
              </p>

              <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-civic">

                <Icon
                  name="mapPin"
                  className="h-4 w-4"
                />

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

              <Icon
                name="arrowRight"
                className="h-4 w-4"
              />

            </button>

          </div>


          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">


            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div>


              {/* =================================================
                  CALENDAR
              ================================================= */}

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
                      {currentMonthName}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Select a date to view events
                    </p>

                  </div>


                  {/* MONTH BUTTONS */}

                  <div className="flex gap-2">

                    {/* PREVIOUS */}

                    <button
                      type="button"
                      onClick={goToPreviousMonth}
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-civic-muted
                        text-civic
                        transition-all
                        duration-200
                        hover:bg-civic
                        hover:text-white
                        active:scale-90
                      "
                      aria-label="Previous month"
                    >

                      <Icon
                        name="chevronLeft"
                        className="h-5 w-5"
                      />

                    </button>


                    {/* NEXT */}

                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-civic-muted
                        text-civic
                        transition-all
                        duration-200
                        hover:bg-civic
                        hover:text-white
                        active:scale-90
                      "
                      aria-label="Next month"
                    >

                      <Icon
                        name="chevronRight"
                        className="h-5 w-5"
                      />

                    </button>

                  </div>

                </div>


                {/* WEEKDAYS */}

                <div className="mb-3 grid grid-cols-7 text-center text-xs font-semibold text-slate-500">

                  <span className="text-red-500">
                    Sun
                  </span>

                  <span>
                    Mon
                  </span>

                  <span>
                    Tue
                  </span>

                  <span>
                    Wed
                  </span>

                  <span>
                    Thu
                  </span>

                  <span>
                    Fri
                  </span>

                  <span>
                    Sat
                  </span>

                </div>


                {/* CALENDAR DAYS */}

                <div className="grid grid-cols-7 gap-1 sm:gap-2">

                  {days.map((day, index) => {

                    /* EMPTY DAYS */

                    if (day === null) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="h-11 sm:h-14"
                        />
                      );
                    }


                    /* EVENT ON THIS DATE */

                    const event = events.find((item) => {

                      const date = getEventDate(item);

                      return (
                        date.getFullYear() === currentYear &&
                        date.getMonth() === currentMonth &&
                        date.getDate() === day
                      );

                    });


                    /* SELECTED */

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
                          flex
                          h-11
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


                        {/* EVENT DOT */}

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


                        {/* SELECTED EVENT DOT */}

                        {event && selected && (

                          <span
                            className="
                              absolute
                              bottom-2
                              h-1.5
                              w-1.5
                              rounded-full
                              bg-white
                            "
                          />

                        )}

                      </button>

                    );

                  })}

                </div>


                {/* LEGEND */}

                <div
                  className="
                    mt-6
                    flex
                    flex-wrap
                    gap-x-5
                    gap-y-3
                    border-t
                    border-slate-100
                    pt-5
                    text-xs
                    text-slate-500
                  "
                >

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


              {/* =================================================
                  UPCOMING EVENTS
              ================================================= */}

              <section className="mt-8">

                {/* HEADER */}

                <div className="mb-5 flex items-end justify-between gap-4">

                  <div>

                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                      Upcoming Events
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Stay updated with activities happening in your community.
                    </p>

                  </div>


                  <Link
                    href="/events"
                    className="
                      flex
                      shrink-0
                      items-center
                      gap-2
                      rounded-full
                      px-3
                      py-2
                      text-sm
                      font-semibold
                      text-civic
                      transition-all
                      duration-200
                      hover:bg-civic-muted
                    "
                  >

                    See All

                    <Icon
                      name="arrowRight"
                      className="h-4 w-4"
                    />

                  </Link>

                </div>


                {/* CARDS */}

                <div className="space-y-4">

                  {events.map((event) => {

                    const date =
                      getEventDate(event);

                    const month =
                      date
                        .toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                          }
                        )
                        .toUpperCase();

                    const day =
                      date.toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                        }
                      );

                    const time =
                      date.toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      );


                    const categoryIcon =
                      event.category === "Safety"
                        ? "shield"
                        : event.category === "Environment"
                        ? "leaf"
                        : "users";


                    const categoryStyle =
                      event.category === "Safety"
                        ? "bg-civic-muted text-civic"
                        : event.category === "Environment"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-violet-50 text-violet-700";


                    return (

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
                          border-civic-line
                          bg-white
                          p-4
                          shadow-sm
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:shadow-md
                        "
                      >

                        {/* DATE */}

                        <div
                          className="
                            flex
                            h-16
                            w-16
                            shrink-0
                            flex-col
                            items-center
                            justify-center
                            rounded-2xl
                            bg-civic-muted
                            text-civic
                          "
                        >

                          <span className="text-[10px] font-bold tracking-wider">
                            {month}
                          </span>

                          <span className="mt-0.5 text-2xl font-bold leading-none">
                            {day}
                          </span>

                        </div>


                        {/* CATEGORY ICON */}

                        <div
                          className={`
                            hidden
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            sm:flex
                            ${categoryStyle}
                          `}
                        >

                          <Icon
                            name={categoryIcon}
                            className="h-6 w-6"
                          />

                        </div>


                        {/* INFO */}

                        <div className="min-w-0 flex-1">

                          {/* CATEGORY */}

                          <div className="mb-1">

                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-2.5
                                py-1
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wide
                                ${categoryStyle}
                              `}
                            >
                              {event.category}
                            </span>

                          </div>


                          {/* TITLE */}

                          <h4
                            className="
                              truncate
                              text-base
                              font-bold
                              text-slate-900
                              transition-colors
                              duration-200
                              group-hover:text-civic
                              sm:text-lg
                            "
                          >
                            {event.title}
                          </h4>


                          {/* AGENCY */}

                          <p className="mt-1 text-sm font-medium text-civic">
                            {event.agency}
                          </p>


                          {/* TIME + LOCATION */}

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">

                            <span className="flex items-center gap-1.5">

                              <Icon
                                name="clock"
                                className="h-3.5 w-3.5"
                              />

                              {time}

                            </span>


                            <span className="flex items-center gap-1.5">

                              <Icon
                                name="mapPin"
                                className="h-3.5 w-3.5"
                              />

                              {event.location}

                            </span>

                          </div>

                        </div>


                        {/* ARROW */}

                        <div
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-slate-100
                            text-slate-500
                            transition-all
                            duration-300
                            group-hover:bg-civic-muted
                            group-hover:text-civic
                            group-hover:translate-x-1
                          "
                        >

                          <Icon
                            name="arrowRight"
                            className="h-5 w-5"
                          />

                        </div>

                      </Link>

                    );

                  })}

                </div>

              </section>

            </div>


            {/* =================================================
                EVENT DETAILS
            ================================================= */}

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

              {selectedEvent ? (

                <div>


                  {/* HEADER */}

                  <div className="mb-6 flex items-center justify-between">

                    <span className="text-sm font-semibold text-civic">
                      Event Details
                    </span>

                    <Icon
                      name="arrowUpRight"
                      className="h-5 w-5 text-slate-500"
                    />

                  </div>


                  {/* TITLE */}

                  <div className="rounded-2xl bg-civic-soft p-6">

                    <p className="text-xs font-bold uppercase tracking-wide text-civic">
                      {selectedEvent.category}
                    </p>

                    <h3 className="mt-3 text-2xl font-bold text-slate-900">
                      {selectedEvent.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">

                      {getEventDate(
                        selectedEvent
                      ).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}

                    </p>

                  </div>


                  {/* WHEN */}

                  <div className="mt-7">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      When
                    </p>

                    <p className="mt-2 flex items-center gap-2 font-bold text-slate-800">

                      <Icon
                        name="clock"
                        className="h-4 w-4 text-civic"
                      />

                      {getEventDate(
                        selectedEvent
                      ).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      )}

                    </p>

                  </div>


                  {/* WHERE */}

                  <div className="mt-6">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Where
                    </p>

                    <p className="mt-2 flex items-center gap-2 font-bold text-slate-800">

                      <Icon
                        name="mapPin"
                        className="h-4 w-4 text-civic"
                      />

                      {selectedEvent.location}

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

                    <Icon
                      name="calendar"
                      className="h-5 w-5"
                    />

                    Add to my calendar

                  </button>


                  {/* PUBLISHED */}

                  <div className="mt-7 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
                    Published by Municipal DRRM Office
                  </div>

                </div>

              ) : (

                <div className="flex min-h-[400px] items-center justify-center text-center text-slate-500">

                  <div>

                    <Icon
                      name="calendar"
                      className="mx-auto h-10 w-10 text-slate-300"
                    />

                    <p className="mt-3">
                      Select a date with an event.
                    </p>

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