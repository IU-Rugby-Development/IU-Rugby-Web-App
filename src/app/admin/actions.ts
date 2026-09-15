"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/permissions";
import { ROLES } from "@/types/domain";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    throw new Error("Admin access required.");
  }
  return user!;
}

const roleSchema = z.enum(ROLES);

export async function setUserRole(userId: string, formData: FormData) {
  await requireAdmin();
  const role = roleSchema.parse(formData.get("role"));

  const supabase = await createClient();
  // The profiles_update_admin RLS policy backstops this: only an ADMIN's
  // request will actually be permitted to change someone else's role.
  await supabase.from("profiles").update({ role }).eq("id", userId);

  revalidatePath("/admin/users");
}

export async function toggleUserGroup(
  userId: string,
  groupId: string,
  formData: FormData
) {
  await requireAdmin();
  const isMember = formData.get("isMember") === "true";
  const supabase = await createClient();

  if (isMember) {
    await supabase
      .from("group_memberships")
      .delete()
      .eq("user_id", userId)
      .eq("group_id", groupId);
  } else {
    await supabase.from("group_memberships").insert({ user_id: userId, group_id: groupId });
  }

  revalidatePath("/admin/users");
}

const createLinkSchema = z.object({
  playerId: z.string().uuid(),
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_-]{3,32}$/, "3-32 lowercase letters, numbers, - or _"),
  destinationUrl: z.string().url("Enter a valid URL"),
});

export interface CreateLinkState {
  error: string | null;
}

export async function createTicketLink(
  _prevState: CreateLinkState,
  formData: FormData
): Promise<CreateLinkState> {
  await requireAdmin();

  const parsed = createLinkSchema.safeParse({
    playerId: formData.get("playerId"),
    code: formData.get("code"),
    destinationUrl: formData.get("destinationUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ticket_links").insert({
    player_id: parsed.data.playerId,
    code: parsed.data.code,
    destination_url: parsed.data.destinationUrl,
  });

  if (error) {
    return { error: error.code === "23505" ? "That code is already taken." : error.message };
  }

  revalidatePath("/admin/tickets");
  return { error: null };
}

export async function toggleTicketLinkActive(linkId: string, formData: FormData) {
  await requireAdmin();
  const nextActive = formData.get("nextActive") === "true";

  const supabase = await createClient();
  await supabase.from("ticket_links").update({ active: nextActive }).eq("id", linkId);

  revalidatePath("/admin/tickets");
}
