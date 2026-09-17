/** Missing credentials must fail closed while public information remains usable. */
export function hasSupabaseConfiguration(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "[SENSITIVE]" || key === "[SENSITIVE]") return false;
  try { return ["http:", "https:"].includes(new URL(url).protocol); } catch { return false; }
}
export function hasSupabaseAdminConfiguration(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return hasSupabaseConfiguration() && !!key && key !== "[SENSITIVE]";
}
