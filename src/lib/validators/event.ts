import { z } from "zod";
import { EVENT_TYPES, EVENT_VISIBILITY } from "@/types/domain";

export const eventSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
    eventType: z.enum(EVENT_TYPES),
    location: z.string().trim().max(200).optional().or(z.literal("")),
    startsAt: z.string().min(1, "Start date/time is required"),
    endsAt: z.string().optional().or(z.literal("")),
    visibility: z.enum(EVENT_VISIBILITY),
  })
  .refine(
    (data) => !data.endsAt || new Date(data.endsAt) >= new Date(data.startsAt),
    { message: "End time must be after start time", path: ["endsAt"] }
  );

export type EventInput = z.infer<typeof eventSchema>;
