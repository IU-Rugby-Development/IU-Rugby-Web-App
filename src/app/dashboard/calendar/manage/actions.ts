"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageEvents } from "@/lib/auth/permissions";
import { eventSchema } from "@/lib/validators/event";
import type { EventActionState } from "@/lib/calendar/types";

export type { EventActionState };

function parseEventForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    eventType: formData.get("eventType"),
    location: formData.get("location") ?? "",
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") ?? "",
    visibility: formData.get("visibility"),
  });
}

export async function createEvent(
  _prevState: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const user = await getCurrentUser();
  // App-level check for a fast, friendly error. The RLS "events_write_staff"
  // policy is the real backstop if this check is ever bypassed.
  if (!canManageEvents(user)) {
    return { error: "You don't have permission to create events." };
  }

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({
    title: parsed.data.title,
    description: parsed.data.description || null,
    event_type: parsed.data.eventType,
    location: parsed.data.location || null,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    ends_at: parsed.data.endsAt ? new Date(parsed.data.endsAt).toISOString() : null,
    visibility: parsed.data.visibility,
    created_by: user!.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/calendar/manage");
  revalidatePath("/calendar");
  redirect("/dashboard/calendar/manage");
}

export async function updateEvent(
  eventId: string,
  _prevState: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const user = await getCurrentUser();
  if (!canManageEvents(user)) {
    return { error: "You don't have permission to edit events." };
  }

  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      event_type: parsed.data.eventType,
      location: parsed.data.location || null,
      starts_at: new Date(parsed.data.startsAt).toISOString(),
      ends_at: parsed.data.endsAt ? new Date(parsed.data.endsAt).toISOString() : null,
      visibility: parsed.data.visibility,
    })
    .eq("id", eventId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/calendar/manage");
  revalidatePath("/calendar");
  redirect("/dashboard/calendar/manage");
}

export async function deleteEvent(eventId: string) {
  const user = await getCurrentUser();
  if (!canManageEvents(user)) {
    throw new Error("You don't have permission to delete events.");
  }

  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", eventId);

  revalidatePath("/dashboard/calendar/manage");
  revalidatePath("/calendar");
}
