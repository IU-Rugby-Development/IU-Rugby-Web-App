"use client";

import { useState, useTransition } from "react";
import { deleteEvent } from "./actions";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span><button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this event? This cannot be undone.")) {
          startTransition(async () => { const result = await deleteEvent(eventId); setError(result.error); });
        }
      }}
      className="text-sm font-medium text-gray-500 hover:text-red-700 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>{error && <span role="alert" className="ml-2 text-sm text-red-800">{error}</span>}</span>
  );
}
