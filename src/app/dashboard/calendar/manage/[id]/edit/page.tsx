import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageEvents } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/calendar/event-form";
import { updateEvent } from "../../actions";
import type { EventRow } from "@/types/domain";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirectTo=/dashboard/calendar/manage/${id}/edit`);
  if (!canManageEvents(user)) redirect("/dashboard");

  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();

  if (!event) notFound();

  const boundUpdate = updateEvent.bind(null, id);

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Event</h1>
      <EventForm event={event as EventRow} action={boundUpdate} />
    </div>
  );
}
