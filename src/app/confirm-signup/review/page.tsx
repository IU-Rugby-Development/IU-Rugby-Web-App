import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CONFIRMATION_COOKIE, validConfirmationToken } from "@/lib/auth/confirmation";
import { ResendConfirmationForm } from "./resend-form";

export const metadata: Metadata = { title: "Confirm account | IU Rugby", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const ready = validConfirmationToken((await cookies()).get(CONFIRMATION_COOKIE)?.value);
  const expired = status === "expired" || status === "invalid" || !ready;
  const unavailable = status === "unavailable";
  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:py-20">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">IU Rugby · Your account</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{expired ? "Let’s get you signed in" : "Confirm your account"}</h1>
        <p className="mt-4 leading-7 text-gray-600">
          {expired ? "This confirmation link may have already been used or expired. If you have confirmed your email, you can sign in with your password. Otherwise, request a fresh link below." : "You’re one step away. Confirm the email address this link was sent to and sign in to your IU Rugby account."}
        </p>
        {unavailable && <p role="alert" className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900">We couldn’t reach account services. Please try the button again in a moment.</p>}
        {status === "retry" && <p role="alert" className="mt-4 text-sm text-red-800">Please confirm using the button on this page.</p>}
        {!expired && <form action="/confirm-signup" method="post" className="mt-6">
          <button className="w-full rounded-lg bg-red-800 px-5 py-3 font-semibold text-white hover:bg-red-900" type="submit">Confirm account</button>
          <p className="mt-3 text-xs leading-5 text-gray-500">Opening this page does not confirm your account. Select the button when you’re ready.</p>
        </form>}
        <div className="mt-6 flex gap-5 text-sm font-semibold text-red-800">
          <Link href="/login" className="hover:underline">Sign in</Link>
          <Link href="/" className="hover:underline">Return home</Link>
        </div>
        {expired && <ResendConfirmationForm />}
      </div>
    </div>
  );
}
