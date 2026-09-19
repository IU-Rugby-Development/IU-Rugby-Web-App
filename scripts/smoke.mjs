// Safe HTTP smoke checks. Backend-dependent checks remain explicit failures when unavailable.
const base = process.env.BASE_URL ?? process.argv[2] ?? "http://localhost:3000";
let failed = false;
for (const path of ["/", "/login", "/signup", "/calendar", "/tickets", "/dashboard", "/dashboard/calendar", "/dashboard/profile", "/dashboard/tickets", "/admin", "/calendar/feed.ics"]) {
  try {
    const headers = {};
    if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) headers["x-vercel-protection-bypass"] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    const response = await fetch(new URL(path, base), { redirect: "manual", headers, signal: AbortSignal.timeout(20000) });
    const text = await response.text();
    const protectedRoute = path.startsWith("/dashboard") || path.startsWith("/admin");
    const passes = protectedRoute ? [302, 303, 307].includes(response.status) && new URL(response.headers.get("location"), base).pathname === "/login"
      : path.endsWith(".ics") ? response.status === 200 && response.headers.get("content-type")?.includes("text/calendar") && text.includes("BEGIN:VCALENDAR")
      : response.status === 200 && text.includes("<h1") && !text.includes("Application error");
    const blocked = response.status === 503 || (!protectedRoute && /schedule is temporarily unavailable|Account services are temporarily unavailable/.test(text));
    const status = blocked ? "BLOCKED" : passes ? (protectedRoute ? "REDIRECTS AS EXPECTED" : "PASS") : "FAIL";
    console.log(status + " " + path + " HTTP " + response.status);
    if (!passes || blocked) failed = true;
  } catch { console.log("FAIL " + path + " connection error"); failed = true; }
}
process.exitCode = failed ? 1 : 0;
