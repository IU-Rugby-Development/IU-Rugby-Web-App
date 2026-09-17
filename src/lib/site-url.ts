/** Use the deployment's own origin so Preview auth and referrals stay in Preview. */
export function getSiteUrl(): string {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && configured !== "[SENSITIVE]") return new URL(configured).origin;
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  throw new Error("Site URL is not configured.");
}
