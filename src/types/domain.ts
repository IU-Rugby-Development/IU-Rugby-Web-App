/**
 * Roles control WHAT a user is allowed to do (application authorization).
 * Never confuse this with Groups, which describe WHO a user is.
 */
export const ROLES = ["MEMBER", "EXECUTIVE", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

/**
 * Groups describe WHO a person is within the IU Rugby community.
 * A user can belong to many groups at once.
 */
export const GROUPS = [
  "PLAYER",
  "PARENT",
  "ALUMNI",
  "SUPPORTER",
  "SPONSOR",
] as const;
export type GroupName = (typeof GROUPS)[number];

export const EVENT_TYPES = [
  "GAME",
  "PRACTICE",
  "EVENT",
  "FUNDRAISER",
  "MEETING",
  "OTHER",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_VISIBILITY = ["PUBLIC", "MEMBERS", "GROUPS"] as const;
export type EventVisibility = (typeof EVENT_VISIBILITY)[number];

export const TICKET_ACTIVITY_TYPES = ["CLICK", "PURCHASE"] as const;
export type TicketActivityType = (typeof TICKET_ACTIVITY_TYPES)[number];

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: GroupName;
  description: string | null;
}

export interface GroupMembership {
  id: string;
  user_id: string;
  group_id: string;
  created_at: string;
}

export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  visibility: EventVisibility;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TicketLink {
  id: string;
  player_id: string;
  code: string;
  destination_url: string;
  active: boolean;
  created_at: string;
}

export interface TicketActivityRow {
  id: string;
  ticket_link_id: string;
  event_id: string | null;
  activity_type: TicketActivityType;
  created_at: string;
}
