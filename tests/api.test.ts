import { test } from "node:test";
import assert from "node:assert/strict";
import { api, refreshSession, setAccessToken, allPages, normalizePhone } from "../src/services/api";
import { projectFromDto, revocationFromDto } from "../src/services/dto";
const ok = (data: unknown) => new Response(JSON.stringify({ data }), { status: 200 });
const denied = () => new Response(JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Sessão expirada" } }), { status: 401 });
test("concurrent 401 responses share one refresh and retry with the new token", async t => {
  setAccessToken("old"); let refreshes = 0;
  t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    assert.equal(init.credentials, "include");
    if (url.endsWith("/auth/refresh")) { refreshes++; await new Promise(r => setTimeout(r, 20)); return ok({ accessToken: "new" }); }
    return new Headers(init.headers).get("Authorization") === "Bearer new" ? ok({ id: "user" }) : denied();
  });
  const results = await Promise.all([api("/users/me", { auth: true }), api("/users/me", { auth: true })]);
  assert.equal(refreshes, 1); assert.deepEqual(results, [{ id: "user" }, { id: "user" }]);
  setAccessToken(null);
});
test("failed refresh stops retrying and public login errors do not trigger refresh", async t => {
  setAccessToken("expired"); let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; return denied(); });
  await assert.rejects(api("/users/me", { auth: true }), { status: 401 });
  assert.equal(calls, 2);
  calls = 0;
  await assert.rejects(api("/auth/login", { method: "POST", body: {} }), { status: 401 });
  assert.equal(calls, 1);
});
test("a pending refresh cannot restore a token cleared by logout", async t => {
  setAccessToken("old"); let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  t.mock.method(globalThis, "fetch", async () => { await wait; return ok({ accessToken: "stale" }); });
  const refreshing = refreshSession(); setAccessToken(null); release();
  assert.equal(await refreshing, null);
});
test("pagination uses the API limit and retrieves the next page", async t => {
  t.mock.method(globalThis, "fetch", async (url: string) => {
    assert.equal(new URL(url).searchParams.get("limit"), "50");
    return ok({ items: [new URL(url).searchParams.get("page")], total: 2 });
  });
  assert.deepEqual(await allPages("/projects"), ["1", "2"]);
});
test("DTOs use server IDs and dates without manufacturing verified or delivered states", () => {
  const p = projectFromDto({ id: "uuid", title: "Projeto", category: "Vendas", status: "APPROVED", developer: { id: "dev", name: "Dev" } });
  assert.equal(p.developerId, "dev"); assert.equal(p.developer, "Dev"); assert.deepEqual(p.features, []);
  const r = revocationFromDto({ id: "r", requestedAt: "start", deletionDeadlineAt: "deadline", status: "PENDING_NOTIFICATION", match: { id: "match", project: { id: "uuid", title: "Projeto" }, merchant: { businessName: "Loja" } } });
  assert.equal(r.deadlineAt, "deadline"); assert.equal(r.notificationAcceptedAt, undefined); assert.equal(r.projectId, "uuid");
  assert.equal(normalizePhone("(11) 99999-9999"), "+5511999999999");
  assert.equal(normalizePhone("+1 202 555 0123"), "+12025550123");
});
