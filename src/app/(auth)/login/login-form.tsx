"use client";

import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/lib/auth/actions";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = { error: null };

export function LoginForm({ redirectTo, available = true }: { redirectTo?: string; available?: boolean }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}
      <Field id="email" name="email" type="email" label="Email" required autoComplete="email" />
      <Field
        id="password"
        name="password"
        type="password"
        label="Password"
        required
        autoComplete="current-password"
      />
      {state.error && (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending || !available}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
