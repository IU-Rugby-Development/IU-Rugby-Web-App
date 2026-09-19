"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageEvents } from "@/lib/auth/permissions";
import { eventSchema } from "@/lib/validators/event";
import { eventLocalToISO } from "@/lib/calendar/time";
import type { EventActionState } from "@/lib/calendar/types";

export type { EventActionState };

async function saveEvent(eventId: string | null, formData: FormData): Promise<EventActionState> {
  const user = await getCurrentUser();
  if (!canManageEvents(user)) return { error: "You don't have permission to manage events." };
  if (eventId && !z.string().uuid().safeParse(eventId).success) return { error: "Invalid event." };
  const parsed = eventSchema.safeParse({
    title: formData.get("title"), description: formData.get("description") ?? "",
    eventType: formData.get("eventType"), location: formData.get("location") ?? "",
    startsAt: formData.get("startsAt"), endsAt: formData.get("endsAt") ?? "",
    visibility: formData.get("visibility"), groupIds: formData.getAll("groupIds"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_event", {
    p_event_id: eventId, p_title: data.title, p_description: data.description || null,
    p_event_type: data.eventType, p_location: data.location || null,
    p_starts_at: eventLocalToISO(data.startsAt)!,
    p_ends_at: data.endsAt ? eventLocalToISO(data.endsAt) : null,
    p_visibility: data.visibility, p_group_ids: data.visibility === "GROUPS" ? data.groupIds : [],
  });
  if (error) {
    console.error("Event save failed:", error.code);
    return { error: "The event could not be saved. Please try again or contact an administrator." };
  }
  revalidatePath("/dashboard/calendar/manage");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/calendar");
  redirect("/dashboard/calendar/manage");
}

export async function createEvent(_prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  return saveEvent(null, formData);
}
export async function updateEvent(eventId: string, _prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  return saveEvent(eventId, formData);
}
export async function deleteEvent(eventId: string): Promise<{ error: string | null }> {
  const user = await getCurrentUser();
  if (!canManageEvents(user)) return { error: "You don't have permission to delete events." };
  if (!z.string().uuid().safeParse(eventId).success) return { error: "Invalid event." };
  const supabase = await createClient();
  const { error, data } = await supabase.from("events").delete().eq("id", eventId).select("id");
  if (error || !data?.length) return { error: "The event could not be deleted." };
  revalidatePath("/dashboard/calendar/manage");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/calendar");
  return { error: null };
}
