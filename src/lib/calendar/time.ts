export const EVENT_TIME_ZONE = "America/Indiana/Indianapolis";

export function toEventLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return get("year") + "-" + get("month") + "-" + get("day") + "T" + get("hour") + ":" + get("minute");
}

/** Convert the explicitly labelled Indianapolis wall clock to UTC, rejecting DST gaps. */
export function eventLocalToISO(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const wall = new Date(value + ":00Z");
  if (!Number.isFinite(wall.getTime()) || wall.toISOString().slice(0, 16) !== value) return null;
  let instant = wall.getTime();
  for (let pass = 0; pass < 4; pass++) {
    const represented = new Date(toEventLocalInput(new Date(instant).toISOString()) + ":00Z").getTime();
    instant += wall.getTime() - represented;
  }
  const iso = new Date(instant).toISOString();
  return toEventLocalInput(iso) === value ? iso : null;
}

export function formatEventTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE, weekday: "short", month: "short", day: "numeric",
    year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(new Date(iso));
}
