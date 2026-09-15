import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageEvents } from "@/lib/auth/permissions";
import { getAllEventsForManagement } from "@/lib/calendar/queries";
import { Button } from "@/components/ui/button";
import { DeleteEventButton } from "./delete-button";

export default async function ManageEventsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard/calendar/manage");
  if (!canManageEvents(user)) redirect("/dashboard");

  const events = await getAllEventsForManagement();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
        <Link href="/dashboard/calendar/manage/new">
          <Button>New Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-gray-600">No events yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
            >
              <div>
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.starts_at).toLocaleString()} · {event.visibility}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/calendar/manage/${event.id}/edit`}
                  className="text-sm font-medium text-red-700 hover:underline"
                >
                  Edit
                </Link>
                <DeleteEventButton eventId={event.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
