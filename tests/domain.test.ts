import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adoptProject,
  revokeMatch,
  moderateProject,
  submitProject,
} from "../src/domain/operations";
import { createDemoState, demoUsers } from "../src/services/demo/fixtures";
const now = "2026-09-09T12:00:00.000Z";
function merchantState() {
  return { ...createDemoState(), user: demoUsers.MERCHANT };
}
test("adoção exige lojista e projeto aprovado", () => {
  assert.throws(() => adoptProject(createDemoState(), "balcao", "x", now));
  assert.throws(() => adoptProject(merchantState(), "agenda-pro", "x", now));
  const s = adoptProject(merchantState(), "prateleira", "x", now);
  assert.equal(s.matches.at(-1)?.projectId, "prateleira");
});
test("adoção repetida é idempotente", () => {
  const s = merchantState();
  assert.equal(adoptProject(s, "balcao", "x", now), s);
});
test("revogação preserva histórico e cria prazo de 48 horas", () => {
  const s = revokeMatch(merchantState(), "match-1", "revoke-1", now);
  assert.equal(s.matches[0].status, "REVOKED");
  assert.equal(s.revocations[0].deadlineAt, "2026-09-11T12:00:00.000Z");
  assert.equal(revokeMatch(s, "match-1", "duplicate", now), s);
  assert.throws(() => adoptProject(s, "balcao", "new", now));
});
test("outro lojista não pode revogar o Match", () => {
  assert.throws(() =>
    revokeMatch(
      { ...merchantState(), user: { ...demoUsers.MERCHANT, id: "other" } },
      "match-1",
      "x",
      now,
    ),
  );
});
test("readopção após declaração cria novo Match", () => {
  let s = revokeMatch(merchantState(), "match-1", "revoke-1", now);
  s = {
    ...s,
    revocations: s.revocations.map((r) => ({ ...r, declaredAt: now })),
  };
  const adopted = adoptProject(s, "balcao", "new", now);
  assert.equal(
    adopted.matches.find((m) => m.id === "match-1")?.status,
    "REVOKED",
  );
  assert.equal(adopted.matches.find((m) => m.id === "new")?.status, "ACTIVE");
});
test("moderação exige admin e justificativa para rejeitar", () => {
  assert.throws(() =>
    moderateProject(merchantState(), "balcao", "APPROVED", ""),
  );
  const s = { ...createDemoState(), user: demoUsers.ADMIN };
  assert.throws(() => moderateProject(s, "balcao", "REJECTED", " "));
  assert.equal(
    moderateProject(s, "pedidos-ja", "APPROVED", "").projects.find(
      (p) => p.id === "pedidos-ja",
    )?.status,
    "APPROVED",
  );
});
test("edição do projeto exige propriedade e retorna para análise", () => {
  const s = { ...createDemoState(), user: demoUsers.DEVELOPER };
  assert.throws(() => submitProject(s, s.projects[1]));
  assert.equal(submitProject(s, s.projects[0]).projects[0].status, "PENDING");
});
