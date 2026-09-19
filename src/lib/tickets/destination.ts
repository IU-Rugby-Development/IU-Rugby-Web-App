export const TICKET_STOREFRONT = "https://tickets.kuntzstadium.com/section/rugby-luu0";
export const TICKET_CODE_PATTERN = /^[a-z0-9_-]{3,32}$/;

export function isApprovedTicketDestination(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "tickets.kuntzstadium.com" &&
      !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}
