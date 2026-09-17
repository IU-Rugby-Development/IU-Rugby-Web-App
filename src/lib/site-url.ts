import "server-only";

function originOf(value: string | undefined | null): string | null {
  if (!value || value === "[SENSITIVE]") return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.origin : null;
  } catch {
    return null;
  }
}

/** Resolve a trusted application origin, including the branch alias. */
export function getSiteUrl(requestOrigin?: string | null): string {
  const preview = process.env.VERCEL_ENV === "preview";
  const configured = originOf(process.env.NEXT_PUBLIC_SITE_URL);
  const allowed = preview
    ? [process.env.VERCEL_BRANCH_URL, process.env.VERCEL_URL].map((host) => host ? originOf(`https://${host}`) : null)
    : [configured, ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000", "http://127.0.0.1:3000"] : [])];
  const origins = allowed.filter((value): value is string => !!value);
  const requested = originOf(requestOrigin);
  if (requested && origins.includes(requested)) return requested;
  if (origins[0]) return origins[0];
  throw new Error("Site URL is not configured.");
}

// Token-hash confirmation works across browsers. Prefer the stable Preview
// alias so the Auth allowlist need not grow with every immutable deployment.
export function getConfirmationUrl(requestOrigin?: string | null): string {
  return `${getSiteUrl(process.env.VERCEL_ENV === "preview" ? undefined : requestOrigin)}/confirm-signup`;
}
