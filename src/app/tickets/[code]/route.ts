import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * /tickets/[code]
 *
 * Public, unauthenticated route. Anyone (including bots/anon visitors)
 * can hit this. Flow: validate code -> locate active ticket_links row ->
 * record a CLICK in ticket_activity -> redirect to destination_url.
 *
 * Uses the admin client rather than the anon client: this is a Route
 * Handler with no user session, so there's no auth.uid() to rely on —
 * the admin client lets us do the code lookup + insert as one trusted
 * server-side operation without exposing inactive-code existence to
 * anonymous visitors (see ticket_links_select_public_active in RLS).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const supabase = createAdminClient();

  const { data: link } = await supabase
    .from("ticket_links")
    .select("id, destination_url, active")
    .eq("code", code)
    .eq("active", true)
    .single();

  // Invalid or inactive codes fail safely — no information disclosure
  // about which codes exist, just a normal 404.
  if (!link) {
    return NextResponse.redirect(new URL("/tickets?invalid=1", request.url), {
      status: 302,
    });
  }

  await supabase.from("ticket_activity").insert({
    ticket_link_id: link.id,
    activity_type: "CLICK",
  });

  return NextResponse.redirect(link.destination_url, { status: 302 });
}
