"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES, EVENT_VISIBILITY, type EventRow, type Group } from "@/types/domain";
import { toEventLocalInput } from "@/lib/calendar/time";
import type { EventActionState } from "@/lib/calendar/types";

const initialState: EventActionState = { error: null };

export function EventForm({
  event,
  action,
  groups,
  groupIds = [],
}: {
  event?: EventRow;
  groups: Group[];
  groupIds?: string[];
  action: (state: EventActionState, formData: FormData) => Promise<EventActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  // React resets uncontrolled form fields when an action resolves, including
  // a returned validation error. Keep the draft so staff can correct one field
  // without losing the rest of an event.
  const [draft, setDraft] = useState({
    title: event?.title ?? "", description: event?.description ?? "",
    eventType: event?.event_type ?? "GAME", visibility: event?.visibility ?? "PUBLIC",
    location: event?.location ?? "", startsAt: toEventLocalInput(event?.starts_at ?? null),
    endsAt: toEventLocalInput(event?.ends_at ?? null), groupIds,
  });
  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.currentTarget;
    setDraft((current) => ({ ...current, [name]: value }));
  }

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <Field id="title" name="title" label="Title" required value={draft.title} onChange={updateField} />
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={draft.description}
          onChange={updateField}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="eventType" className="text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="eventType"
            name="eventType"
            value={draft.eventType}
            onChange={updateField}
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
            value={draft.visibility}
            onChange={updateField}
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
      <fieldset className="rounded-md border border-gray-200 p-3">
        <legend className="px-1 text-sm font-medium text-gray-700">Audience for group-only events</legend>
        <p className="mb-2 text-xs text-gray-600">Choose at least one when visibility is GROUPS. Ignored for public and members-only events.</p>
        <div className="flex flex-wrap gap-3">{groups.map((group) => <label key={group.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="groupIds" value={group.id} checked={draft.groupIds.includes(group.id)} onChange={(event) => {
          const checked = event.currentTarget.checked;
          setDraft((current) => ({ ...current, groupIds: checked ? [...current.groupIds, group.id] : current.groupIds.filter((id) => id !== group.id) }));
        }} />{group.name}</label>)}</div>
      </fieldset>
      <Field id="location" name="location" label="Location" value={draft.location} onChange={updateField} />
      <p className="text-sm text-gray-600">All event times use Indianapolis time (Eastern), including daylight saving time.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          id="startsAt"
          name="startsAt"
          label="Starts at"
          type="datetime-local"
          required
          value={draft.startsAt}
          onChange={updateField}
        />
        <Field
          id="endsAt"
          name="endsAt"
          label="Ends at"
          type="datetime-local"
          value={draft.endsAt}
          onChange={updateField}
        />
      </div>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : event ? "Save changes" : "Create event"}
      </Button>
    </form>
  );
}
