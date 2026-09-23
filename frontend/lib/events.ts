export type CivicEvent = {
  id: number;
  title: string;
  agency: string;
  event_datetime: string;
  location: string;
  description: string;
};

export const events: CivicEvent[] = [
  {
    id: 1,
    title: "Barangay Assembly",
    agency: "Barangay XYZ",
    event_datetime: "2026-09-22T07:00:00",
    location: "Barangay Hall",
    description:
      "Community assembly for residents to discuss local concerns and upcoming activities.",
  },

  {
    id: 2,
    title: "DRRM Briefing",
    agency: "MDRRMO",
    event_datetime: "2026-09-24T09:00:00",
    location: "Catarman Civic Center",
    description:
      "A community briefing on disaster preparedness, emergency contacts, and what residents should do before, during, and after an emergency.",
  },

  {
    id: 3,
    title: "Waste Collection Change",
    agency: "MENRO",
    event_datetime: "2026-09-26T06:00:00",
    location: "All Barangays",
    description:
      "Updated waste collection schedule for selected barangays.",
  },
];