import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageEvents } from "@/lib/auth/permissions";
import { getUpcomingEvents } from "@/lib/calendar/queries";
import { EventCard } from "@/lib/calendar/event-card";
import { CalendarEmptyState } from "@/components/calendar/empty-state";

export default async function DashboardCalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard/calendar");

  const { events, error } = await getUpcomingEvents();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Calendar</h1>
        {canManageEvents(user) && (
          <Link
            href="/dashboard/calendar/manage"
            className="text-sm font-medium text-red-700 hover:underline"
          >
            Manage Events
          </Link>
        )}
      </div>

      {error ? <p role="alert" className="text-sm text-red-800">{error}</p> : events.length === 0 ? (
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
