"use client";

import { useTransition } from "react";
import { toggleTicketLinkActive } from "../actions";

export function ToggleLinkButton({ linkId, active }: { linkId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const fd = new FormData();
        fd.set("nextActive", String(!active));
        startTransition(() => toggleTicketLinkActive(linkId, fd));
      }}
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}
