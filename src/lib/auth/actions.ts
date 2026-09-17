"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validators/auth";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { getSiteUrl } from "@/lib/site-url";
import { hasSupabaseConfiguration } from "@/lib/supabase/config";

export interface AuthActionState {
  error: string | null;
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseConfiguration()) return { error: "Account services are temporarily unavailable. Please try again later." };
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { firstName, lastName, email, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Consumed by the handle_new_user() trigger (0001_profiles.sql)
      // to populate the profile row created on signup.
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo: `${getSiteUrl((await headers()).get("origin"))}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?confirmEmail=1");
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseConfiguration()) return { error: "Account services are temporarily unavailable. Please try again later." };
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Incorrect email or password." };
  }

  revalidatePath("/", "layout");

  redirect(safeRedirectPath(formData.get("redirectTo")));
}

export async function signOut() {
  if (!hasSupabaseConfiguration()) redirect("/");
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
