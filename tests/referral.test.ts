import assert from "node:assert/strict";
import { beforeEach, afterEach, test, mock } from "node:test";
import { GET, HEAD } from "../src/app/tickets/[code]/route";

const originals = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, service: process.env.SUPABASE_SERVICE_ROLE_KEY };
beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fixture.example.invalid";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service";
});
afterEach(() => {
  mock.restoreAll();
  for (const [key, value] of Object.entries({ NEXT_PUBLIC_SUPABASE_URL: originals.url, NEXT_PUBLIC_SUPABASE_ANON_KEY: originals.anon, SUPABASE_SERVICE_ROLE_KEY: originals.service })) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
function request(code = "test-player") { return GET(new Request("https://club.example/tickets/" + code), { params: Promise.resolve({ code }) }); }
test("active referral records exactly a CLICK and redirects to approved destination", async () => {
  const calls: { url: URL; method: string; body: string | undefined }[] = [];
  mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    calls.push({ url, method: init?.method ?? "GET", body: typeof init?.body === "string" ? init.body : undefined });
    return (init?.method ?? "GET") === "POST" ? new Response(null, { status: 201 }) :
      Response.json({ id: "11111111-1111-4111-8111-111111111111", active: true, destination_url: "https://tickets.kuntzstadium.com/" });
  });
  const result = await request();
  assert.equal(result.status, 302);
  assert.equal(result.headers.get("location"), "https://tickets.kuntzstadium.com/");
  assert.match(result.headers.get("cache-control") ?? "", /no-store/);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url.searchParams.get("active"), "eq.true");
  assert.deepEqual(JSON.parse(calls[1].body!), { ticket_link_id: "11111111-1111-4111-8111-111111111111", activity_type: "CLICK" });
});
test("invalid and inactive referral responses never record clicks", async () => {
  let calls = 0;
  mock.method(globalThis, "fetch", async () => { calls++; return Response.json({ code: "PGRST116", message: "No rows" }, { status: 406 }); });
  assert.equal((await request("!bad")).headers.get("location"), "https://club.example/tickets?invalid=1");
  assert.equal(calls, 0);
  assert.equal((await request()).headers.get("location"), "https://club.example/tickets?invalid=1");
  assert.equal(calls, 1);
});
test("stored unsafe destinations cannot redirect or create activity", async () => {
  let calls = 0;
  mock.method(globalThis, "fetch", async () => { calls++; return Response.json({ id: "fixture", active: true, destination_url: "https://evil.example/" }); });
  assert.equal((await request()).headers.get("location"), "https://club.example/tickets?invalid=1");
  assert.equal(calls, 1);
});
test("analytics insertion failure does not block the ticket handoff", async () => {
  mock.method(console, "error", () => undefined);
  mock.method(globalThis, "fetch", async (_input: unknown, init?: RequestInit) =>
    init?.method === "POST" ? Response.json({ code: "42501" }, { status: 403 }) :
      Response.json({ id: "fixture", active: true, destination_url: "https://tickets.kuntzstadium.com/" }));
  assert.equal((await request()).headers.get("location"), "https://tickets.kuntzstadium.com/");
});
test("HEAD never generates clicks and missing configuration falls back to direct ticket page", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected fetch"); });
  assert.equal((await HEAD()).status, 204);
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.equal((await request()).headers.get("location"), "https://club.example/tickets?unavailable=1");
  assert.equal(fetchMock.mock.callCount(), 0);
});
