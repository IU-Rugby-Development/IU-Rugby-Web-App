import assert from "node:assert/strict";
import test from "node:test";
import { safeRedirectPath } from "../src/lib/auth/redirect";
import { isApprovedTicketDestination } from "../src/lib/tickets/destination";
import { buildSingleEventICS } from "../src/lib/calendar/ics";
import { eventLocalToISO, toEventLocalInput } from "../src/lib/calendar/time";
import { eventSchema } from "../src/lib/validators/event";
import { canManageEvents, canViewAdmin, hasPlayerLink } from "../src/lib/auth/permissions";
import type { CurrentUser } from "../src/lib/auth/session";
import type { EventRow } from "../src/types/domain";

test("auth redirects stay local for hostile and encoded inputs", () => {
  for (const value of ["https://evil.example", "//evil.example", "/\\evil.example", "/%5cevil.example", "/%2f%2fevil.example", "/%252f%252fevil.example", "/\nevil.example", "", null, "%", "/%zz"]) {
    assert.equal(safeRedirectPath(value), "/dashboard", String(value));
  }
  assert.equal(safeRedirectPath("/dashboard/calendar?view=week"), "/dashboard/calendar?view=week");
});
test("ticket destinations require the exact HTTPS Kuntz host", () => {
  assert.equal(isApprovedTicketDestination("https://tickets.kuntzstadium.com/"), true);
  assert.equal(isApprovedTicketDestination("https://tickets.kuntzstadium.com/event/match?ref=player"), true);
  for (const value of ["http://tickets.kuntzstadium.com/", "https://tickets.kuntzstadium.com.evil.example", "https://tickets.kuntzstadium.com@evil.example", "https://evil.example@tickets.kuntzstadium.com", "javascript:alert(1)", "https://tickets.kuntzstadium.com:444", "/relative"]) {
    assert.equal(isApprovedTicketDestination(value), false, value);
  }
});
test("Indianapolis event times round-trip across summer and winter", () => {
  assert.equal(eventLocalToISO("2026-09-23T18:30"), "2026-09-23T22:30:00.000Z");
  assert.equal(eventLocalToISO("2026-01-23T18:30"), "2026-01-23T23:30:00.000Z");
  assert.equal(toEventLocalInput("2026-09-23T22:30:00Z"), "2026-09-23T18:30");
  for (const value of ["2026-03-08T02:30", "2026-02-30T12:00", "invalid", "2026-09-23T25:00"]) assert.equal(eventLocalToISO(value), null);
});
const sample: EventRow = {
  id: "11111111-1111-4111-8111-111111111111", title: "Club, event; \\ title\r\nInjected: text",
  description: "é".repeat(100), location: "Field", event_type: "EVENT", visibility: "PUBLIC",
  starts_at: "2026-09-23T22:30:00Z", ends_at: null, created_by: "user",
  created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-02T00:00:00Z",
};
test("ICS escapes text, folds UTF-8 lines, uses stable UID and valid UTC dates", () => {
  const ics = buildSingleEventICS(sample, "https://club.example");
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.ok(ics.includes("UID:" + sample.id + "@iurugby"));
  assert.ok(ics.includes("DTSTART:20260923T223000Z"));
  assert.ok(!ics.includes("DTEND:"));
  assert.ok(ics.includes("Club\\, event\\; \\\\ title\\nInjected: text"));
  assert.ok(!ics.includes("\r\nInjected:"));
  for (const line of ics.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75);
  assert.ok(ics.replace(/\r\n /g, "").includes("DESCRIPTION:" + sample.description));
});
test("event validation rejects invalid dates, reversed times and missing audiences", () => {
  const valid = { title: "Club meeting", eventType: "MEETING", startsAt: "2026-09-23T18:00", endsAt: "2026-09-23T19:00", visibility: "PUBLIC", groupIds: [] };
  assert.equal(eventSchema.safeParse(valid).success, true);
  assert.equal(eventSchema.safeParse({ ...valid, visibility: "GROUPS" }).success, false);
  assert.equal(eventSchema.safeParse({ ...valid, startsAt: "invalid" }).success, false);
  assert.equal(eventSchema.safeParse({ ...valid, endsAt: valid.startsAt }).success, false);
});
test("roles and stakeholder groups remain separate permission axes", () => {
  const user = { id: "user", groups: ["PLAYER"], profile: { role: "MEMBER" } } as CurrentUser;
  assert.equal(hasPlayerLink(user), true);
  assert.equal(canManageEvents(user), false);
  assert.equal(canViewAdmin(user), false);
  assert.equal(canManageEvents({ ...user, profile: { ...user.profile, role: "EXECUTIVE" } }), true);
  assert.equal(canViewAdmin({ ...user, profile: { ...user.profile, role: "EXECUTIVE" } }), false);
  assert.equal(canViewAdmin({ ...user, profile: { ...user.profile, role: "ADMIN" } }), true);
  assert.equal(canManageEvents(null), false);
});
