import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { NextRequest } from "next/server";
import { GET, HEAD, POST } from "../src/app/confirm-signup/route";
import { CONFIRMATION_COOKIE } from "../src/lib/auth/confirmation";
import { signUpSchema } from "../src/lib/validators/auth";

const origin = "https://confirmation.example.invalid";
const token = "a".repeat(56);
const original = { ...process.env };
beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = origin;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fixture.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "fixture-anon";
  delete process.env.VERCEL_ENV;
});
afterEach(() => {
  mock.restoreAll();
  for (const key of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "VERCEL_ENV"]) {
    if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key];
  }
});
function post(source: string | null = origin, value = token) {
  return POST(new NextRequest(origin + "/confirm-signup", { method: "POST", headers: {
    ...(source ? { origin: source } : {}), cookie: `${CONFIRMATION_COOKIE}=${value}`,
  } }));
}
test("signup validates names, email and password and ignores authorization fields", () => {
  const input = { firstName: " Demo ", lastName: " User ", email: "demo@example.invalid", password: "long-enough", role: "ADMIN" };
  assert.deepEqual(signUpSchema.parse(input), { firstName: "Demo", lastName: "User", email: input.email, password: input.password });
  for (const change of [{ firstName: " " }, { lastName: "" }, { email: "invalid" }, { password: "short" }]) assert.equal(signUpSchema.safeParse({ ...input, ...change }).success, false);
});
test("GET and HEAD never verify, and the credential leaves the URL in an HTTP-only cookie", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => { throw new Error("GET must not verify"); });
  for (let i = 0; i < 2; i++) {
    const result = await GET(new NextRequest(`${origin}/confirm-signup?token_hash=${token}&type=email&next=https://evil.example`));
    assert.equal(result.status, 303);
    assert.equal(result.headers.get("location"), `${origin}/confirm-signup/review`);
    const cookie = result.cookies.get(CONFIRMATION_COOKIE)!;
    assert.equal(cookie.value, token);
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.secure, true);
    assert.equal(cookie.sameSite, "lax");
    assert.equal(cookie.path, "/confirm-signup");
    assert.equal(result.headers.get("referrer-policy"), "no-referrer");
    assert.match(result.headers.get("cache-control")!, /no-store/);
  }
  assert.equal((await HEAD()).status, 204);
  assert.equal(fetchMock.mock.callCount(), 0);
});
test("malformed or non-signup links fail cleanly without contacting Auth", async () => {
  for (const query of ["", "?token_hash=bad&type=email", `?token_hash=${token}&type=recovery`]) {
    const response = await GET(new NextRequest(`${origin}/confirm-signup${query}`));
    assert.equal(response.headers.get("location"), `${origin}/confirm-signup/review?status=invalid`);
  }
});
test("cross-site POST and missing Origin cannot consume a token", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => { throw new Error("Must not verify"); });
  for (const source of ["https://evil.example", null]) assert.match((await post(source)).headers.get("location")!, /status=retry$/);
  assert.match((await post(origin, "bad")).headers.get("location")!, /status=invalid$/);
  assert.equal(fetchMock.mock.callCount(), 0);
});
test("explicit POST verifies the email token and persists SSR session cookies", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(input), "https://fixture.supabase.co/auth/v1/verify");
    assert.equal(init?.method, "POST");
    const body = JSON.parse(String(init?.body));
    assert.equal(body.token_hash, token); assert.equal(body.type, "email");
    return Response.json({ access_token: "fixture-access", refresh_token: "fixture-refresh", token_type: "bearer", expires_in: 3600,
      user: { id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", email: "demo@example.invalid" } });
  });
  const result = await post();
  assert.equal(result.headers.get("location"), `${origin}/dashboard?confirmed=1`);
  assert.ok(result.cookies.getAll().some((cookie) => cookie.name.includes("auth-token") && cookie.value));
  assert.equal(result.cookies.get(CONFIRMATION_COOKIE)?.maxAge, 0);
  assert.equal(fetchMock.mock.callCount(), 1);
});
test("used or expired tokens redirect to app UI without raw provider JSON", async () => {
  mock.method(globalThis, "fetch", async () => Response.json({ code: 403, error_code: "otp_expired", msg: "Email link is invalid or has expired" }, { status: 403 }));
  const result = await post();
  assert.equal(result.headers.get("location"), `${origin}/confirm-signup/review?status=expired`);
  assert.equal(await result.text(), "");
  assert.equal(result.cookies.get(CONFIRMATION_COOKIE)?.maxAge, 0);
});
