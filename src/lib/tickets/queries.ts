import { createClient } from "@/lib/supabase/server";

export interface OwnLinkStats {
  code: string;
  active: boolean;
  clicks: number;
}

/**
 * Returns the caller's own ticket link and click count, or null if they
 * don't have one yet. RLS (ticket_links_select_own /
 * ticket_activity_select_own) means this can only ever return the
 * caller's own data, never another player's.
 */
export async function getOwnTicketLinkStats(userId: string): Promise<OwnLinkStats | null> {
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("ticket_links")
    .select("id, code, active")
    .eq("player_id", userId)
    .order("active", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!link) return null;

  const { count } = await supabase
    .from("ticket_activity")
    .select("id", { count: "exact", head: true })
    .eq("ticket_link_id", link.id)
    .eq("activity_type", "CLICK");

  return { code: link.code, active: link.active, clicks: count ?? 0 };
}

export interface LeaderboardEntry {
  ticketLinkId: string;
  playerId: string;
  name: string;
  referralClicks: number;
}

/**
 * Reads the referral_leaderboard view. Because the view is defined with
 * security_invoker = true, RLS on the underlying tables still applies:
 * a plain MEMBER gets only their own row back; EXECUTIVE/ADMIN get
 * everyone's, which is what the public-facing leaderboard needs.
 */
export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("referral_leaderboard")
    .select("*")
    .order("referral_clicks", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to load leaderboard:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ticketLinkId: row.ticket_link_id,
    playerId: row.player_id,
    name: `${row.first_name} ${row.last_name}`.trim(),
    referralClicks: row.referral_clicks,
  }));
}
