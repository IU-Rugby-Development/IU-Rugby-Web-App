import type { EventRow } from "@/types/domain";

function toICSDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeICSText(text: string): string {
  return text.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

function eventToICS(event: EventRow, siteUrl: string): string {
  const end = event.ends_at ?? event.starts_at;
  return [
    "BEGIN:VEVENT",
    `UID:${event.id}@iurugby`,
    `DTSTAMP:${toICSDate(event.created_at)}`,
    `DTSTART:${toICSDate(event.starts_at)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeICSText(event.description)}` : "",
    event.location ? `LOCATION:${escapeICSText(event.location)}` : "",
    `URL:${siteUrl}/calendar`,
    "END:VEVENT",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/** Builds a single-event .ics file, used by the "Add to Calendar" button. */
export function buildSingleEventICS(event: EventRow, siteUrl: string): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IU Rugby//Web App//EN",
    eventToICS(event, siteUrl),
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Builds a full feed of all provided events, used by /calendar/feed.ics. */
export function buildCalendarFeedICS(events: EventRow[], siteUrl: string): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IU Rugby//Web App//EN",
    "CALSCALE:GREGORIAN",
    ...events.map((e) => eventToICS(e, siteUrl)),
    "END:VCALENDAR",
  ].join("\r\n");
}
