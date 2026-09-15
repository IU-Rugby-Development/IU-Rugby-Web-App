"use client";

import { useActionState } from "react";
import { updateProfile, type UpdateProfileState } from "./actions";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: UpdateProfileState = { error: null, success: false };

export function ProfileForm({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <Field id="firstName" name="firstName" label="First name" defaultValue={firstName} required />
      <Field id="lastName" name="lastName" label="Last name" defaultValue={lastName} required />
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Saved.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
