import { createClient } from "@/lib/supabase/server";
import { buildSingleEventICS } from "@/lib/calendar/ics";
import type { EventRow } from "@/types/domain";
import { z } from "zod";
import { hasSupabaseConfiguration } from "@/lib/supabase/config";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return new Response("Event not found", { status: 404 });
  if (!hasSupabaseConfiguration()) return new Response("Calendar temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  const supabase = await createClient();

  // RLS scopes this to whatever the caller (signed in or not) is
  // actually allowed to see — same as the calendar listing page.
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return new Response("Calendar temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });

  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const siteUrl = new URL(request.url).origin;
  const ics = buildSingleEventICS(event as EventRow, siteUrl);

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${(event as EventRow).title.replace(/[^a-z0-9]+/gi, "-")}.ics"`,
    },
  });
}
