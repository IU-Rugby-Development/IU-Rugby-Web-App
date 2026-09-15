import { createClient } from "@/lib/supabase/server";
import { CreateLinkForm } from "./create-link-form";
import { ToggleLinkButton } from "./toggle-link-button";

export default async function AdminTicketsPage() {
  const supabase = await createClient();

  const [{ data: links }, { data: profiles }, { data: playerGroup }] = await Promise.all([
    supabase.from("ticket_links").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, first_name, last_name"),
    supabase.from("groups").select("id").eq("name", "PLAYER").single(),
  ]);

  let players: { id: string; name: string }[] = [];
  if (playerGroup) {
    const { data: playerMemberships } = await supabase
      .from("group_memberships")
      .select("user_id")
      .eq("group_id", playerGroup.id);

    const playerIds = new Set((playerMemberships ?? []).map((m) => m.user_id));
    players = (profiles ?? [])
      .filter((p) => playerIds.has(p.id))
      .map((p) => ({ id: p.id, name: `${p.first_name} ${p.last_name}`.trim() }));
  }

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Ticket Links</h2>
      <CreateLinkForm players={players} />

      <table className="mt-6 w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
            <th className="py-2 pr-4">Player</th>
            <th className="py-2 pr-4">Code</th>
            <th className="py-2 pr-4">Destination</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {(links ?? []).map((link) => {
            const player = profileById.get(link.player_id);
            return (
              <tr key={link.id} className="border-b border-gray-100">
                <td className="py-3 pr-4 text-sm text-gray-900">
                  {player ? `${player.first_name} ${player.last_name}`.trim() : "Unknown"}
                </td>
                <td className="py-3 pr-4 text-sm text-gray-600">/tickets/{link.code}</td>
                <td className="max-w-xs truncate py-3 pr-4 text-sm text-gray-600">
                  {link.destination_url}
                </td>
                <td className="py-3">
                  <ToggleLinkButton linkId={link.id} active={link.active} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
