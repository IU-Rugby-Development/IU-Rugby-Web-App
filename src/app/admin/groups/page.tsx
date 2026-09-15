import { createClient } from "@/lib/supabase/server";

export default async function AdminGroupsPage() {
  const supabase = await createClient();

  const [{ data: groups }, { data: memberships }, { data: profiles }] = await Promise.all([
    supabase.from("groups").select("*").order("name"),
    supabase.from("group_memberships").select("group_id, user_id"),
    supabase.from("profiles").select("id, first_name, last_name"),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-gray-900">Groups</h2>
      <p className="mb-4 text-sm text-gray-600">
        Assign members to groups from the Users tab. This is a read-only
        roster view.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(groups ?? []).map((group) => {
          const members = (memberships ?? []).filter((m) => m.group_id === group.id);
          return (
            <div key={group.id} className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              <p className="mb-2 text-xs text-gray-500">{group.description}</p>
              {members.length === 0 ? (
                <p className="text-sm text-gray-500">No members yet.</p>
              ) : (
                <ul className="text-sm text-gray-700">
                  {members.map((m) => {
                    const p = profileById.get(m.user_id);
                    return (
                      <li key={m.user_id}>
                        {p ? `${p.first_name} ${p.last_name}`.trim() : "Unknown"}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
