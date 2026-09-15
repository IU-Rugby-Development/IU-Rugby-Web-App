import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Reads/writes the auth session via cookies so that
 * sessions persist across requests.
 *
 * Still uses the anon key — this is NOT an admin client. RLS still
 * applies. Use lib/supabase/admin.ts only for trusted server-only
 * operations that must bypass RLS.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from a Server Component where cookies
            // can't be mutated. Safe to ignore if middleware is also
            // refreshing the session (see middleware.ts).
          }
        },
      },
    }
  );
}
