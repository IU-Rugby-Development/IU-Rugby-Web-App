"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/permissions";
import { ROLES } from "@/types/domain";
import { isApprovedTicketDestination } from "@/lib/tickets/destination";

export interface MutationResult { error: string | null }

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    throw new Error("Admin access required.");
  }
  return user!;
}

const roleSchema = z.enum(ROLES);

export async function setUserRole(userId: string, formData: FormData): Promise<MutationResult> {
  const actor = await requireAdmin();
  const role = roleSchema.safeParse(formData.get("role"));
  const expectedRole = roleSchema.safeParse(formData.get("expectedRole"));
  if (!z.string().uuid().safeParse(userId).success || !role.success || !expectedRole.success) return { error: "Invalid user or role." };
  if (userId === actor.id && role.data !== "ADMIN") return { error: "Another administrator must change your administrator role." };

  const supabase = await createClient();
  // The profiles_update_admin RLS policy backstops this: only an ADMIN's
  // request will actually be permitted to change someone else's role.
  const { error, data } = await supabase.from("profiles").update({ role: role.data }).eq("id", userId).eq("role", expectedRole.data).select("id");
  if (error || !data?.length) return { error: "The role could not be updated. Refresh to check whether another administrator changed it." };

  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
  return { error: null };
}

export async function toggleUserGroup(
  userId: string,
  groupId: string,
  formData: FormData
): Promise<MutationResult> {
  await requireAdmin();
  if (!z.string().uuid().safeParse(userId).success || !z.string().uuid().safeParse(groupId).success) return { error: "Invalid user or group." };
  const isMember = formData.get("isMember") === "true";
  const supabase = await createClient();

  if (isMember) {
    const { error } = await supabase
      .from("group_memberships")
      .delete()
      .eq("user_id", userId)
      .eq("group_id", groupId);
    if (error) return { error: "The group could not be removed." };
  } else {
    const { error } = await supabase.from("group_memberships").upsert({ user_id: userId, group_id: groupId }, { onConflict: "user_id,group_id", ignoreDuplicates: true });
    if (error) return { error: "The group could not be assigned." };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/groups");
  revalidatePath("/", "layout");
  return { error: null };
}

const createLinkSchema = z.object({
  playerId: z.string().uuid(),
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_-]{3,32}$/, "3-32 lowercase letters, numbers, - or _"),
  destinationUrl: z.string().url("Enter a valid URL").refine(isApprovedTicketDestination, "Use an HTTPS URL on tickets.kuntzstadium.com"),
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
  const { data: isPlayer, error: playerError } = await supabase.rpc("is_in_group", { uid: parsed.data.playerId, group_name: "PLAYER" });
  if (playerError || !isPlayer) return { error: "Select a current member of the PLAYER group." };
  const { error } = await supabase.from("ticket_links").insert({
    player_id: parsed.data.playerId,
    code: parsed.data.code,
    destination_url: parsed.data.destinationUrl,
  });

  if (error) {
    return { error: error.code === "23505" ? "That code is already taken." : "The ticket link could not be created." };
  }

  revalidatePath("/admin/tickets");
  return { error: null };
}

export async function toggleTicketLinkActive(linkId: string, formData: FormData): Promise<MutationResult> {
  await requireAdmin();
  if (!z.string().uuid().safeParse(linkId).success) return { error: "Invalid ticket link." };
  const nextActive = formData.get("nextActive") === "true";

  const supabase = await createClient();
  if (nextActive) {
    const { data: link } = await supabase.from("ticket_links").select("destination_url").eq("id", linkId).maybeSingle();
    if (!link || !isApprovedTicketDestination(link.destination_url)) return { error: "This link does not use an approved Kuntz destination." };
  }
  const { error, data } = await supabase.from("ticket_links").update({ active: nextActive }).eq("id", linkId).select("id");
  if (error || !data?.length) return { error: "The ticket link could not be updated." };

  revalidatePath("/admin/tickets");
  return { error: null };
}
