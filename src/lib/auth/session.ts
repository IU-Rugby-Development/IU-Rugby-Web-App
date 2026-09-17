import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { GroupName, Profile } from "@/types/domain";

export interface CurrentUser {
  id: string;
  email: string | undefined;
  profile: Profile;
  groups: GroupName[];
}

/**
 * Loads the signed-in user's auth record, profile, and group memberships
 * in one round trip. Returns null if nobody is signed in.
 *
 * Every protected page/Server Action should call this and re-check
 * authorization with lib/auth/permissions.ts — do not rely solely on
 * middleware.ts, which only prevents a UI flash, not a real bypass.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("group_memberships")
      .select("groups(name)")
      .eq("user_id", user.id),
  ]);

  if (!profile) return null;

  const groups = (memberships ?? [])
    .map((m) => (m as unknown as { groups: { name: GroupName } | null }).groups?.name)
    .filter((g): g is GroupName => Boolean(g));

  return {
    id: user.id,
    email: user.email,
    profile: profile as Profile,
    groups,
  };
});
