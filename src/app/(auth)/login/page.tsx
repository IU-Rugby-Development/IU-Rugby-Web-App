import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmEmail?: string; redirectTo?: string }>;
}) {
  const params = await searchParams;

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

      <LoginForm redirectTo={params.redirectTo} />

      <p className="text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-red-700 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
