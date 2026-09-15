"use client";

import { useTransition } from "react";
import { deleteEvent } from "./actions";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this event? This cannot be undone.")) {
          startTransition(() => deleteEvent(eventId));
        }
      }}
      className="text-sm font-medium text-gray-500 hover:text-red-700 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
