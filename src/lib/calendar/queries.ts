import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfiguration } from "@/lib/supabase/config";
import type { EventRow } from "@/types/domain";

export interface EventResult { events: EventRow[]; error: string | null }
const unavailable = { events: [], error: "The schedule is temporarily unavailable. Please try again later." };

export async function getUpcomingEvents(limit = 50, publicOnly = false): Promise<EventResult> {
  if (!hasSupabaseConfiguration()) return unavailable;
  const supabase = await createClient();
  let query = supabase.from("events").select("*")
    .gte("starts_at", new Date(Date.now() - 86400000).toISOString())
    .order("starts_at", { ascending: true }).limit(limit);
  if (publicOnly) query = query.eq("visibility", "PUBLIC");
  const { data, error } = await query;
  if (error) { console.error("Calendar lookup failed:", error.code); return unavailable; }
  return { events: data ?? [], error: null };
}
export async function getAllEventsForManagement(): Promise<EventResult> {
  if (!hasSupabaseConfiguration()) return unavailable;
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select("*").order("starts_at", { ascending: true });
  if (error) { console.error("Event management lookup failed:", error.code); return unavailable; }
  return { events: data ?? [], error: null };
}
