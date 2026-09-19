import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

// Authorize before reading Auth emails; they never enter public profiles.
export async function getAdminEmails() {
  if (!isAdmin(await getCurrentUser())) throw new Error("Admin access required.");
  const admin = createAdminClient();
  const emails = new Map<string, string>();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error("The account directory is temporarily unavailable.");
    for (const user of data.users) emails.set(user.id, user.email ?? "Email unavailable");
    if (data.users.length < 200) break;
  }
  return emails;
}
