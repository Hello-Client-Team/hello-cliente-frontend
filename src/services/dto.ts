import type { Project, User, Match, Revocation } from "../domain/types";
export interface UserDto { id: string; name: string; role: User["role"]; email?: string | null; merchant?: { businessName: string } | null }
export interface ProjectDto {
  id: string; developerId?: string; developer?: { id: string; name: string };
  title: string; category: Project["category"]; description?: string; productionUrl?: string;
  demoUrl?: string; status: Project["status"]; suspensionReason?: string | null;
}
export interface RevocationDto {
  id: string; matchId?: string; requestedAt: string; deletionDeadlineAt: string;
  deletionDeclaredAt?: string | null; notificationAcceptedAt?: string | null; status: string;
  match?: { id: string; merchant: { businessName: string }; project: { id: string; title: string } };
}
export interface MatchDto extends Match { productionUrlSnapshot: string; project: ProjectDto; revocation?: RevocationDto | null }
export function userFromDto(dto: UserDto): User { return { id: dto.id, name: dto.name, role: dto.role, email: dto.email ?? undefined, businessName: dto.merchant?.businessName }; }
export function projectFromDto(dto: ProjectDto, owner?: User): Project {
  const icons: Record<string, Project["icon"]> = { Vendas: "shop", Agendamento: "calendar", Estoque: "package", Financeiro: "chart", Atendimento: "chat" };
  return { id: dto.id, developerId: dto.developerId ?? dto.developer?.id ?? owner?.id ?? "",
    developer: dto.developer?.name ?? owner?.name ?? "Desenvolvedor",
    title: dto.title, category: dto.category, description: dto.description ?? "",
    tagline: dto.description?.slice(0, 100) ?? "", productionUrl: dto.productionUrl ?? "",
    demoUrl: dto.demoUrl ?? "", status: dto.status, color: "green", icon: icons[dto.category] ?? "shop",
    features: [], reason: dto.suspensionReason ?? undefined };
}
export function revocationFromDto(dto: RevocationDto, match?: MatchDto): Revocation {
  return { id: dto.id, matchId: dto.matchId ?? dto.match?.id ?? match?.id ?? "",
    merchantName: dto.match?.merchant.businessName ?? "Meu negócio", projectId: dto.match?.project.id ?? match?.projectId ?? "",
    requestedAt: dto.requestedAt, deadlineAt: dto.deletionDeadlineAt, declaredAt: dto.deletionDeclaredAt ?? undefined,
    notificationAcceptedAt: dto.notificationAcceptedAt ?? undefined, status: dto.status };
}
