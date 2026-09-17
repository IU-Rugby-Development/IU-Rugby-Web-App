"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validators/auth";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { getConfirmationUrl } from "@/lib/site-url";
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
      emailRedirectTo: getConfirmationUrl((await headers()).get("origin")),
    },
  });

  if (error) {
    return { error: error.code === "weak_password" ? "Choose a stronger password and try again." : "We couldn’t create your account. Try signing in if you already have an account, or try again shortly." };
  }

  redirect("/login?confirmEmail=1");
}

export async function resendConfirmation(
  _previous: { error: string | null; sent: boolean }, formData: FormData,
): Promise<{ error: string | null; sent: boolean }> {
  const email = signInSchema.shape.email.safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address.", sent: false };
  if (!hasSupabaseConfiguration()) return { error: "Account services are temporarily unavailable. Please try again later.", sent: false };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email: email.data, options: {
    emailRedirectTo: getConfirmationUrl((await headers()).get("origin")),
  } });
  if (error?.status === 429) return { error: "Please wait a minute before requesting another link.", sent: false };
  if (error && ((error.status ?? 0) >= 500 || error.name === "AuthRetryableFetchError")) return { error: "We couldn’t send a link right now. Please try again later.", sent: false };
  // The same response for unknown, confirmed, and unconfirmed addresses.
  return { error: null, sent: true };
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
