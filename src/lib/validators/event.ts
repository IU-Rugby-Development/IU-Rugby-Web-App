import { z } from "zod";
import { EVENT_TYPES, EVENT_VISIBILITY } from "@/types/domain";
import { eventLocalToISO } from "@/lib/calendar/time";

export const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  eventType: z.enum(EVENT_TYPES),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  startsAt: z.string().refine((value) => !!eventLocalToISO(value), "Enter a valid Indianapolis start time"),
  endsAt: z.string().optional().refine((value) => !value || !!eventLocalToISO(value), "Enter a valid Indianapolis end time"),
  visibility: z.enum(EVENT_VISIBILITY),
  groupIds: z.array(z.string().uuid()).max(5).default([]),
}).refine((data) => !data.endsAt || (eventLocalToISO(data.endsAt) ?? "") > (eventLocalToISO(data.startsAt) ?? ""),
  { message: "End time must be after start time", path: ["endsAt"] }
).refine((data) => data.visibility !== "GROUPS" || data.groupIds.length > 0,
  { message: "Choose at least one group for a group-only event", path: ["groupIds"] }
);

export type EventInput = z.infer<typeof eventSchema>;
