"use client";

import { useActionState } from "react";
import { createTicketLink, type CreateLinkState } from "../actions";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: CreateLinkState = { error: null };

export function CreateLinkForm({ players }: { players: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createTicketLink, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="playerId" className="text-sm font-medium text-gray-700">
          Player
        </label>
        <select
          id="playerId"
          name="playerId"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select a player</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <Field id="code" name="code" label="Code" placeholder="jmedina" required />
      <Field
        id="destinationUrl"
        name="destinationUrl"
        label="Destination URL"
        placeholder="https://checkout.example.com/..."
        required
        className="min-w-[16rem]"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create Link"}
      </Button>
      {state.error && <p className="w-full text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
