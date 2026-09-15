"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES, EVENT_VISIBILITY, type EventRow } from "@/types/domain";
import type { EventActionState } from "@/lib/calendar/types";

const initialState: EventActionState = { error: null };

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({
  event,
  action,
}: {
  event?: EventRow;
  action: (state: EventActionState, formData: FormData) => Promise<EventActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <Field id="title" name="title" label="Title" required defaultValue={event?.title} />
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={event?.description ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="eventType" className="text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="eventType"
            name="eventType"
            defaultValue={event?.event_type ?? "GAME"}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="visibility" className="text-sm font-medium text-gray-700">
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            defaultValue={event?.visibility ?? "PUBLIC"}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {EVENT_VISIBILITY.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Field id="location" name="location" label="Location" defaultValue={event?.location ?? ""} />
      <div className="grid grid-cols-2 gap-3">
        <Field
          id="startsAt"
          name="startsAt"
          label="Starts at"
          type="datetime-local"
          required
          defaultValue={toLocalInputValue(event?.starts_at ?? null)}
        />
        <Field
          id="endsAt"
          name="endsAt"
          label="Ends at"
          type="datetime-local"
          defaultValue={toLocalInputValue(event?.ends_at ?? null)}
        />
      </div>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : event ? "Save changes" : "Create event"}
      </Button>
    </form>
  );
}
