"use client";

import { useState, useTransition } from "react";
import { toggleTicketLinkActive } from "../actions";

export function ToggleLinkButton({ linkId, active }: { linkId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span><button
      type="button"
      disabled={isPending}
      onClick={() => {
        const fd = new FormData();
        fd.set("nextActive", String(!active));
        startTransition(async () => { const result = await toggleTicketLinkActive(linkId, fd); setError(result.error); });
      }}
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </button>{error && <span role="alert" className="ml-2 text-sm text-red-800">{error}</span>}</span>
  );
}
