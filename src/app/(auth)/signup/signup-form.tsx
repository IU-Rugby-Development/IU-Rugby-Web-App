"use client";

import { useActionState } from "react";
import { signUp, type AuthActionState } from "@/lib/auth/actions";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = { error: null };

export function SignUpForm({ available = true }: { available?: boolean }) {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field id="firstName" name="firstName" label="First name" required autoComplete="given-name" />
        <Field id="lastName" name="lastName" label="Last name" required autoComplete="family-name" />
      </div>
      <Field id="email" name="email" type="email" label="Email" required autoComplete="email" />
      <Field
        id="password"
        name="password"
        type="password"
        label="Password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      {state.error && (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending || !available}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
