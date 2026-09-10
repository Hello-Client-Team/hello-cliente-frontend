import type { DemoState, Project } from "./types";
export function adoptProject(
  state: DemoState,
  projectId: string,
  id: string,
  now: string,
): DemoState {
  if (state.user?.role !== "MERCHANT")
    throw new Error("Entre como lojista para adotar um sistema.");
  if (state.projects.find((p) => p.id === projectId)?.status !== "APPROVED")
    throw new Error("Este sistema não está disponível para adoção.");
  if (
    state.matches.some(
      (m) =>
        m.merchantId === state.user!.id &&
        m.projectId === projectId &&
        m.status === "ACTIVE",
    )
  )
    return state;
  if (
    state.revocations.some(
      (r) =>
        r.projectId === projectId &&
        !r.declaredAt &&
        state.matches.some(
          (m) => m.id === r.matchId && m.merchantId === state.user!.id,
        ),
    )
  )
    throw new Error(
      "Aguarde a declaração de exclusão anterior antes de readotar.",
    );
  return {
    ...state,
    matches: [
      ...state.matches,
      {
        id,
        merchantId: state.user.id,
        projectId,
        status: "ACTIVE",
        adoptedAt: now,
        termsVersion: "1.0",
      },
    ],
  };
}
export function revokeMatch(
  state: DemoState,
  matchId: string,
  id: string,
  now: string,
): DemoState {
  const match = state.matches.find((m) => m.id === matchId);
  if (state.user?.role !== "MERCHANT" || match?.merchantId !== state.user.id)
    throw new Error("Você não tem acesso a esta adoção.");
  if (match.status === "REVOKED") return state;
  return {
    ...state,
    matches: state.matches.map((m) =>
      m.id === matchId ? { ...m, status: "REVOKED", revokedAt: now } : m,
    ),
    revocations: [
      ...state.revocations,
      {
        id,
        matchId,
        projectId: match.projectId,
        merchantName: state.user.businessName ?? state.user.name,
        requestedAt: now,
        deadlineAt: new Date(Date.parse(now) + 48 * 3600000).toISOString(),
      },
    ],
  };
}
export function moderateProject(
  state: DemoState,
  projectId: string,
  status: "APPROVED" | "REJECTED",
  reason: string,
): DemoState {
  if (state.user?.role !== "ADMIN")
    throw new Error("Acesso restrito à administração.");
  if (status === "REJECTED" && !reason.trim())
    throw new Error("Informe a justificativa da rejeição.");
  return {
    ...state,
    projects: state.projects.map((p) =>
      p.id === projectId
        ? { ...p, status, reason: status === "REJECTED" ? reason : undefined }
        : p,
    ),
  };
}
export function submitProject(state: DemoState, project: Project): DemoState {
  if (state.user?.role !== "DEVELOPER" || project.developerId !== state.user.id)
    throw new Error("Acesso restrito ao desenvolvedor responsável.");
  const existing = state.projects.find((p) => p.id === project.id);
  if (existing && existing.developerId !== state.user.id)
    throw new Error("Você não pode editar este projeto.");
  const next = { ...project, status: "PENDING" as const, reason: undefined };
  return {
    ...state,
    projects: existing
      ? state.projects.map((p) => (p.id === next.id ? next : p))
      : [...state.projects, next],
  };
}
