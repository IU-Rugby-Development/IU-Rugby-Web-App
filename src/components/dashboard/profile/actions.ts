"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
});

export interface UpdateProfileState {
  error: string | null;
  success: boolean;
}

export async function updateProfile(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in.", success: false };

  const parsed = updateProfileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid first and last name.", success: false };
  }

  const supabase = await createClient();
  // Note: no "role" field here. Even if a client tampered with the
  // request to include one, the profiles_update_own_non_role_fields RLS
  // policy rejects any update that changes the caller's own role.
  const { error, data } = await supabase
    .from("profiles")
    .update({ first_name: parsed.data.firstName, last_name: parsed.data.lastName })
    .eq("id", user.id).select("id");

  if (error || !data?.length) {
    return { error: "Your profile could not be saved. Please try again.", success: false };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}
