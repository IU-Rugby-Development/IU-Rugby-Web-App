import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely.
 *
 * The `server-only` import above makes it a build error to import this
 * file from any Client Component. Even so: only use this client for
 * operations that genuinely cannot be expressed as an RLS policy
 * (e.g. the profile-creation trigger's server-side equivalent, or
 * cross-user admin actions after the caller's role has already been
 * checked in the calling code with lib/auth/permissions.ts).
 *
 * NEVER pass this client's results back to the browser without
 * re-checking authorization yourself — RLS is not protecting you here.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
