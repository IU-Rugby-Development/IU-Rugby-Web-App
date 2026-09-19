import { createClient } from "@/lib/supabase/server";
import { UserRow } from "./user-row";
import type { GroupName, Role } from "@/types/domain";
import { getAdminEmails } from "@/lib/admin/users";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) redirect("/dashboard");
  const supabase = await createClient();

  const [{ data: profiles, error: profileError }, { data: groups, error: groupError }, { data: memberships, error: membershipError }, emails] = await Promise.all([
    supabase.from("profiles").select("*").order("last_name"),
    supabase.from("groups").select("*").order("name"),
    supabase.from("group_memberships").select("user_id, group_id"),
    getAdminEmails().catch(() => null),
  ]);
  if (profileError || groupError || membershipError || !emails) return <p role="alert" className="rounded-lg bg-amber-50 p-4 text-amber-900">User management is temporarily unavailable. Refresh the page before making changes.</p>;

  const membershipsByUser = new Map<string, Set<string>>();
  for (const m of memberships ?? []) {
    if (!membershipsByUser.has(m.user_id)) membershipsByUser.set(m.user_id, new Set());
    membershipsByUser.get(m.user_id)!.add(m.group_id);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Users</h2>
      <p className="mt-2 mb-6 max-w-2xl text-sm leading-6 text-gray-600">Roles control access. Groups identify a person’s connection to the club. Save role changes explicitly; group buttons add or remove membership immediately.</p>
      <ul className="space-y-4">
          {(profiles ?? []).map((profile) => (
            <UserRow
              key={`${profile.id}:${profile.role}`}
              userId={profile.id}
              email={emails.get(profile.id) ?? "Email unavailable"}
              isSelf={profile.id === actor!.id}
              name={`${profile.first_name} ${profile.last_name}`.trim() || "(no name)"}
              role={profile.role as Role}
              allGroups={(groups ?? []).map((g) => ({ id: g.id, name: g.name as GroupName }))}
              memberGroupIds={membershipsByUser.get(profile.id) ?? new Set()}
            />
          ))}
      </ul>
    </div>
  );
}
