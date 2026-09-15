import { createClient } from "@/lib/supabase/server";
import { buildSingleEventICS } from "@/lib/calendar/ics";
import type { EventRow } from "@/types/domain";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS scopes this to whatever the caller (signed in or not) is
  // actually allowed to see — same as the calendar listing page.
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const ics = buildSingleEventICS(event as EventRow, siteUrl);

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${(event as EventRow).title.replace(/[^a-z0-9]+/gi, "-")}.ics"`,
    },
  });
}
