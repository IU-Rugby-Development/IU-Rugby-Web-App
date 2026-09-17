import Link from "next/link";
import { LoginForm } from "./login-form";
import { hasSupabaseConfiguration } from "@/lib/supabase/config";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmEmail?: string; redirectTo?: string; error?: string }>;
}) {
  const params = await searchParams;
  const available = hasSupabaseConfiguration();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back to IU Rugby.
        </p>
      </div>

      {params.confirmEmail && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          Check your email to confirm your account, then sign in.
        </p>
      )}

      {params.error === "auth_callback_failed" && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">That link may have already been used or expired. Try signing in if you have already confirmed your email, or request a new link below.</p>}
      {!available && <p role="status" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">Account services are temporarily unavailable. Please try again later.</p>}
      <LoginForm redirectTo={params.redirectTo} available={available} />
      <Link href="/confirm-signup/review" className="text-sm font-medium text-red-700 hover:underline">Resend account confirmation</Link>

      <p className="text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-red-700 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
