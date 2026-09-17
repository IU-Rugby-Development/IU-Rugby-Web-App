import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isApprovedTicketDestination, TICKET_CODE_PATTERN } from "@/lib/tickets/destination";

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
  const invalid = () => NextResponse.redirect(new URL("/tickets?invalid=1", request.url), {
    status: 302, headers: { "Cache-Control": "private, no-store" },
  });
  if (!TICKET_CODE_PATTERN.test(code)) return invalid();
  const supabase = createAdminClient();

  const { data: link } = await supabase
    .from("ticket_links")
    .select("id, destination_url, active")
    .eq("code", code)
    .eq("active", true)
    .single();

  // Invalid or inactive codes fail safely — no information disclosure
  // about which codes exist, just a normal 404.
  if (!link || !isApprovedTicketDestination(link.destination_url)) return invalid();

  const { error } = await supabase.from("ticket_activity").insert({
    ticket_link_id: link.id,
    activity_type: "CLICK",
  });
  if (error) console.error("Referral click could not be recorded:", error.code);

  return NextResponse.redirect(link.destination_url, {
    status: 302, headers: { "Cache-Control": "private, no-store" },
  });
}

// Link previews and health checks must not create click activity.
export async function HEAD() {
  return new Response(null, { status: 204, headers: { "Cache-Control": "private, no-store" } });
}
