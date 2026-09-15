import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageEvents } from "@/lib/auth/permissions";
import { EventForm } from "@/components/calendar/event-form";
import { createEvent } from "../actions";

export default async function NewEventPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard/calendar/manage/new");
  if (!canManageEvents(user)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Event</h1>
      <EventForm action={createEvent} />
    </div>
  );
}
