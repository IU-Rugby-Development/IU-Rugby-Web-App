import type { EventRow } from "@/types/domain";

function toICSDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}
function escapeICSText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/([,;])/g, "\\$1");
}
// RFC 5545: fold at 75 octets, never split a UTF-8 code point.
function foldLine(line: string): string {
  let folded = "", bytes = 0;
  for (const char of line) {
    const width = new TextEncoder().encode(char).length;
    if (bytes + width > 75) { folded += "\r\n "; bytes = 1; }
    folded += char; bytes += width;
  }
  return folded;
}
function eventLines(event: EventRow, siteUrl: string): string[] {
  return [
    "BEGIN:VEVENT", "UID:" + event.id + "@iurugby",
    "DTSTAMP:" + toICSDate(event.updated_at),
    "DTSTART:" + toICSDate(event.starts_at),
    ...(event.ends_at ? ["DTEND:" + toICSDate(event.ends_at)] : []),
    "SUMMARY:" + escapeICSText(event.title),
    ...(event.description ? ["DESCRIPTION:" + escapeICSText(event.description)] : []),
    ...(event.location ? ["LOCATION:" + escapeICSText(event.location)] : []),
    "URL:" + new URL("/calendar", siteUrl).href, "END:VEVENT",
  ];
}
export function buildCalendarFeedICS(events: EventRow[], siteUrl: string): string {
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//IU Rugby//Web App//EN",
    "CALSCALE:GREGORIAN", ...events.flatMap((event) => eventLines(event, siteUrl)),
    "END:VCALENDAR"].map(foldLine).join("\r\n") + "\r\n";
}
export function buildSingleEventICS(event: EventRow, siteUrl: string): string {
  return buildCalendarFeedICS([event], siteUrl);
}
