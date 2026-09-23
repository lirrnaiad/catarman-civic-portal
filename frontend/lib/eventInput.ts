import { EVENT_CATEGORIES, type CivicEventInput, type EventCategory } from "./types";

const CATEGORY_VALUES = EVENT_CATEGORIES.map((c) => c.value) as string[];

/** Validates an event form/API body. Returns the clean input or an error message. */
export function parseEventInput(body: unknown): { input: CivicEventInput } | { error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  const title = text(b.title, 150);
  const location = text(b.location, 150);
  const description = text(b.description, 4000);
  const category = text(b.category, 20);
  const startsAt = new Date(text(b.startsAt, 40));
  const endsRaw = text(b.endsAt, 40);
  const endsAt = endsRaw ? new Date(endsRaw) : null;

  if (!title) return { error: "Add a title." };
  if (!CATEGORY_VALUES.includes(category)) return { error: "Choose a type." };
  if (Number.isNaN(startsAt.getTime())) return { error: "Set the date and start time." };
  if (endsAt && Number.isNaN(endsAt.getTime())) return { error: "The end time isn't valid." };
  if (endsAt && endsAt <= startsAt) return { error: "The end time must be after the start." };
  if (!location) return { error: "Add where it happens." };

  return {
    input: {
      title,
      category: category as EventCategory,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt ? endsAt.toISOString() : undefined,
      location,
      description,
    },
  };
}
