export type Role = "MERCHANT" | "DEVELOPER" | "ADMIN";
export type ProjectStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type Category =
  "Todos" | "Vendas" | "Agendamento" | "Estoque" | "Financeiro" | "Atendimento";
export interface User {
  id: string;
  name: string;
  role: Role;
  email?: string;
  businessName?: string;
}
export interface Project {
  id: string;
  developerId: string;
  developer: string;
  title: string;
  category: Exclude<Category, "Todos">;
  description: string;
  tagline: string;
  productionUrl: string;
  demoUrl: string;
  status: ProjectStatus;
  color: string;
  icon: "shop" | "calendar" | "package" | "chart" | "chat";
  features: string[];
  reason?: string;
}
export interface Match {
  id: string;
  merchantId: string;
  projectId: string;
  status: "ACTIVE" | "REVOKED";
  adoptedAt: string;
  revokedAt?: string;
  termsVersion: string;
}
export interface Revocation {
  id: string;
  matchId: string;
  merchantName: string;
  projectId: string;
  requestedAt: string;
  deadlineAt: string;
  declaredAt?: string;
}
export interface DemoState {
  user: User | null;
  projects: Project[];
  matches: Match[];
  revocations: Revocation[];
}
export const categories: Category[] = [
  "Todos",
  "Vendas",
  "Agendamento",
  "Estoque",
  "Financeiro",
  "Atendimento",
];
