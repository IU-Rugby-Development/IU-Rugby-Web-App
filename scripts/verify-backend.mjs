import { pathToFileURL } from "node:url";

/** Read-only checks. Report object names and status codes, never keys or rows. */
export async function verifyBackend(env = process.env, fetcher = fetch, report = console.log) {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SITE_URL"];
  const unavailable = required.filter((key) => !env[key] || env[key] === "[SENSITIVE]");
  if (unavailable.length) {
    report("BACKEND FAIL: unavailable configuration: " + unavailable.join(", "));
    return false;
  }
  let passed = true;
  const check = (name, ok, status) => {
    if (!ok) passed = false;
    report(`BACKEND ${name}: ${ok ? "PASS" : "FAIL"}${status ? ` (HTTP ${status})` : ""}`);
  };
  try {
    const site = new URL(env.NEXT_PUBLIC_SITE_URL);
    check("site URL", site.protocol === "https:" && !site.username && !site.password && !["localhost", "127.0.0.1", "iurugby.com", "www.iurugby.com"].includes(site.hostname));
    const base = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
    if (base.protocol !== "https:" || base.username || base.password) throw new Error("Invalid backend URL");
    const request = async (path, key, accept = "application/json") => {
      const response = await fetcher(new URL(path, base), {
        headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: accept },
        signal: AbortSignal.timeout(12000),
      });
      const body = await response.json().catch(() => null);
      return { response, body };
    };
    const objects = ["profiles", "groups", "group_memberships", "events", "event_groups", "ticket_links", "ticket_activity", "referral_leaderboard"];
    await Promise.all(objects.map(async (table) => {
      // GET limit=0 checks HTTP status AND the PostgREST result shape. Unlike a
      // HEAD query, missing-table errors cannot disappear with an empty body.
      const { response, body } = await request(`/rest/v1/${table}?select=*&limit=0`, env.SUPABASE_SERVICE_ROLE_KEY);
      check(`schema ${table}`, response.ok && Array.isArray(body), response.status);
    }));
    // Introspect the RPC without executing a mutation merely to test existence.
    const { response: api, body: schema } = await request("/rest/v1/", env.SUPABASE_SERVICE_ROLE_KEY, "application/openapi+json");
    check("function save_event", api.ok && !!schema?.paths?.["/rpc/save_event"]?.post, api.status);
    const { response: events, body: publicEvents } = await request("/rest/v1/events?select=id&visibility=eq.PUBLIC&limit=0", env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    check("anonymous public events", events.ok && Array.isArray(publicEvents), events.status);
    const { response: auth, body: settings } = await request("/auth/v1/settings", env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    check("Auth with email confirmation", auth.ok && settings?.mailer_autoconfirm === false && settings?.external?.email === true, auth.status);
  } catch {
    check("connection or configuration", false);
  }
  return passed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv.includes("--if-preview") || process.env.VERCEL_ENV === "preview") {
    verifyBackend().then((passed) => { process.exitCode = passed ? 0 : 1; });
  }
}
