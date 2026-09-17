import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { CONFIRMATION_COOKIE, confirmationCookieOptions, validConfirmationToken } from "@/lib/auth/confirmation";
import { hasSupabaseConfiguration } from "@/lib/supabase/config";
import { getSiteUrl } from "@/lib/site-url";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

function destination(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, getSiteUrl(request.nextUrl.origin)), 303);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function clearToken(request: NextRequest, response: NextResponse) {
  response.cookies.set(CONFIRMATION_COOKIE, "", {
    ...confirmationCookieOptions, secure: request.nextUrl.protocol === "https:", maxAge: 0,
  });
  return response;
}

// Email scanners may follow this redirect and load the review page. Neither GET
// verifies the OTP. The credential is kept out of the review URL and page HTML.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token_hash");
  if (!validConfirmationToken(token) || request.nextUrl.searchParams.get("type") !== "email") {
    return clearToken(request, destination(request, "/confirm-signup/review?status=invalid"));
  }
  const response = destination(request, "/confirm-signup/review");
  response.cookies.set(CONFIRMATION_COOKIE, token, {
    ...confirmationCookieOptions, secure: request.nextUrl.protocol === "https:",
  });
  return response;
}

export async function HEAD() {
  return new Response(null, { status: 204, headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
}

export async function POST(request: NextRequest) {
  // A normal HTML form sends Origin. Fail closed for cross-site or missing
  // origins; SameSite alone does not protect against sibling subdomains.
  const origin = request.headers.get("origin");
  if (origin !== request.nextUrl.origin || getSiteUrl(origin) !== origin) {
    return destination(request, "/confirm-signup/review?status=retry");
  }
  const token = request.cookies.get(CONFIRMATION_COOKIE)?.value;
  if (!validConfirmationToken(token)) {
    return clearToken(request, destination(request, "/confirm-signup/review?status=invalid"));
  }
  if (!hasSupabaseConfiguration()) return destination(request, "/confirm-signup/review?status=unavailable");

  const response = destination(request, "/dashboard?confirmed=1");
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    } },
  );
  try {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: token, type: "email" });
    if (error || !data.session) {
      if (error && ((error.status ?? 0) >= 500 || error.name === "AuthRetryableFetchError")) {
        return destination(request, "/confirm-signup/review?status=unavailable");
      }
      return clearToken(request, destination(request, "/confirm-signup/review?status=expired"));
    }
  } catch {
    return destination(request, "/confirm-signup/review?status=unavailable");
  }
  return clearToken(request, response);
}
