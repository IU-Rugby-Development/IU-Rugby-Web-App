export const CONFIRMATION_COOKIE = "iu-signup-token";
export const CONFIRMATION_PATH = "/confirm-signup";

// TokenHash is an opaque credential, not a URL. Bound its size and characters
// before storing it; never place it in rendered markup or diagnostics.
export function validConfirmationToken(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{32,256}$/.test(value);
}

export const confirmationCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: CONFIRMATION_PATH,
  maxAge: 10 * 60,
};
