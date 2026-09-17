/** Only accept local paths, including after decoding URL separators. */
export function safeRedirectPath(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  try {
    let decoded = value;
    for (let pass = 0; pass < 3; pass++) {
      if (!decoded.startsWith("/") || decoded.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(decoded)) return fallback;
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
    if (!decoded.startsWith("/") || decoded.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(decoded)) return fallback;
    return new URL(value, "https://app.invalid").origin === "https://app.invalid" ? value : fallback;
  } catch {
    return fallback;
  }
}
