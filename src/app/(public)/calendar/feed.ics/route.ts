import { getUpcomingEvents } from "@/lib/calendar/queries";
import { buildCalendarFeedICS } from "@/lib/calendar/ics";

export async function GET(request: Request) {
  // Subscriptions are public-only even when requested by a signed-in staff user.
  const { events, error } = await getUpcomingEvents(500, true);
  if (error) return new Response("Calendar temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "300" } });
  return new Response(buildCalendarFeedICS(events, new URL(request.url).origin), {
    headers: { "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="iu-rugby.ics"', "Cache-Control": "private, no-store" },
  });
}
