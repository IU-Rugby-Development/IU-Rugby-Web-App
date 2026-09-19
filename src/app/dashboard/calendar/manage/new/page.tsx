import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageEvents } from "@/lib/auth/permissions";
import { EventForm } from "@/components/calendar/event-form";
import { createEvent } from "../actions";
import { createClient } from "@/lib/supabase/server";

export default async function NewEventPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard/calendar/manage/new");
  if (!canManageEvents(user)) redirect("/dashboard");
  const supabase = await createClient();
  const { data: groups, error } = await supabase.from("groups").select("*").order("name");
  if (error) throw new Error("Event groups are temporarily unavailable.");

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Event</h1>
      <EventForm action={createEvent} groups={groups ?? []} />
    </div>
  );
}
