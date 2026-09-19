"use client";

import { useActionState } from "react";
import { resendConfirmation } from "@/lib/auth/actions";

export function ResendConfirmationForm() {
  const [state, action, pending] = useActionState(resendConfirmation, { error: null, sent: false });
  return <form action={action} className="mt-8 border-t border-gray-200 pt-6">
    <h2 className="font-semibold text-gray-900">Need another confirmation link?</h2>
    <label className="mt-4 block text-sm font-medium" htmlFor="resend-email">Email address</label>
    <input id="resend-email" name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" />
    {state.error && <p role="alert" className="mt-3 text-sm text-red-800">{state.error}</p>}
    {state.sent && <p role="status" className="mt-3 text-sm text-green-800">If this address needs confirmation, a new link is on its way. Check your inbox and spam folder. Already confirmed? Sign in above.</p>}
    <button type="submit" disabled={pending} className="mt-4 rounded-lg border border-red-800 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-50">{pending ? "Requesting…" : "Resend confirmation"}</button>
  </form>;
}
