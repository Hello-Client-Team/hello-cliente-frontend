import type { ProjectStatus } from "@/domain/types";
const labels = {
  PENDING: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  SUSPENDED: "Suspenso",
};
export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      {labels[status]}
    </span>
  );
}
