import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/types/domain";

/**
 * Returns events visible to the current caller. RLS on the events table
 * already filters by visibility (PUBLIC / MEMBERS / GROUPS) and by
 * staff status, so this is safe to call from any context — an
 * anonymous visitor and a signed-in EXECUTIVE will simply get different
 * result sets from the same query.
 */
export async function getUpcomingEvents(limit = 50): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("starts_at", new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to load events:", error.message);
    return [];
  }

  return (data ?? []) as EventRow[];
}

export async function getAllEventsForManagement(): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("Failed to load events:", error.message);
    return [];
  }

  return (data ?? []) as EventRow[];
}
