import { createClient } from "@/lib/supabase/server";
import { UserRow } from "./user-row";
import type { GroupName, Role } from "@/types/domain";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const [{ data: profiles }, { data: groups }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("*").order("last_name"),
    supabase.from("groups").select("*").order("name"),
    supabase.from("group_memberships").select("user_id, group_id"),
  ]);

  const membershipsByUser = new Map<string, Set<string>>();
  for (const m of memberships ?? []) {
    if (!membershipsByUser.has(m.user_id)) membershipsByUser.set(m.user_id, new Set());
    membershipsByUser.get(m.user_id)!.add(m.group_id);
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Users</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Role</th>
            <th className="py-2">Groups</th>
          </tr>
        </thead>
        <tbody>
          {(profiles ?? []).map((profile) => (
            <UserRow
              key={profile.id}
              userId={profile.id}
              name={`${profile.first_name} ${profile.last_name}`.trim() || "(no name)"}
              role={profile.role as Role}
              allGroups={(groups ?? []).map((g) => ({ id: g.id, name: g.name as GroupName }))}
              memberGroupIds={membershipsByUser.get(profile.id) ?? new Set()}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
