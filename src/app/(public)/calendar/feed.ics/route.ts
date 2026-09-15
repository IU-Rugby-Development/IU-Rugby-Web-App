import { getUpcomingEvents } from "@/lib/calendar/queries";
import { buildCalendarFeedICS } from "@/lib/calendar/ics";

export async function GET() {
  const events = await getUpcomingEvents(500);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const ics = buildCalendarFeedICS(events, siteUrl);

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="iu-rugby.ics"',
    },
  });
}
