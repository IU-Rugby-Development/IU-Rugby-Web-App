import { createClient } from "@supabase/supabase-js";

// Preview build diagnostics: status codes and object names, never values or rows.
if (process.argv.includes("--if-preview") && process.env.VERCEL_ENV !== "preview") process.exit(0);
const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SITE_URL"];
const unavailable = required.filter((key) => !process.env[key] || process.env[key] === "[SENSITIVE]");
if (unavailable.length) {
  console.log("BACKEND BLOCKED: unavailable configuration: " + unavailable.join(", "));
  process.exit(0);
}
try {
  const site = new URL(process.env.NEXT_PUBLIC_SITE_URL);
  console.log("BACKEND site URL: " + (site.protocol === "https:" && !["localhost", "127.0.0.1", "iurugby.com", "www.iurugby.com"].includes(site.hostname) ? "PASS" : "REVIEW REQUIRED"));
  const options = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(12000) }) } };
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, options);
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options);
  const objects = ["profiles", "groups", "group_memberships", "events", "event_groups", "ticket_links", "ticket_activity", "referral_leaderboard"];
  await Promise.all(objects.map(async (table) => {
    const { error } = await admin.from(table).select("*", { head: true, count: "exact" }).limit(1);
    console.log("BACKEND schema " + table + ": " + (error ? "BLOCKED (" + (error.code || "connection error") + ")" : "PASS"));
  }));
  const { error } = await anon.from("events").select("id", { head: true }).eq("visibility", "PUBLIC").limit(1);
  console.log("BACKEND anonymous public events: " + (error ? "BLOCKED (" + (error.code || "connection error") + ")" : "PASS"));
  const auth = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + "/auth/v1/settings", { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }, signal: AbortSignal.timeout(12000) });
  const settings = auth.ok ? await auth.json() : null;
  console.log("BACKEND auth settings: " + auth.status + "; email confirmation: " + (settings ? (settings.mailer_autoconfirm ? "DISABLED - REVIEW REQUIRED" : "ENABLED") : "UNVERIFIED"));
} catch {
  console.log("BACKEND BLOCKED: connection or configuration error. No configuration values logged.");
}
