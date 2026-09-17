import { getUpcomingEvents } from "@/lib/calendar/queries";
import { EventCard } from "@/lib/calendar/event-card";
import { CalendarEmptyState } from "@/components/calendar/empty-state";

export default async function PublicCalendarPage() {
  const { events, error } = await getUpcomingEvents(50, true);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        <a
          href="/calendar/feed.ics"
          className="text-sm font-medium text-red-700 hover:underline"
        >
          Subscribe (.ics)
        </a>
      </div>

      {error ? <p role="status" className="rounded-md bg-amber-50 p-4 text-sm text-amber-900">{error} You can also visit <a className="underline" href="https://www.iurugby.com/">the current IU Rugby website</a>.</p> : events.length === 0 ? (
        <CalendarEmptyState />
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ul>
      )}
    </div>
  );
}
