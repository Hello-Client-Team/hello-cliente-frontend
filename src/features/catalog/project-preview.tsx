import {
  CalendarDays,
  Package,
  ShoppingBag,
  ChartNoAxesCombined,
  MessagesSquare,
} from "lucide-react";
import type { Project } from "@/domain/types";
const icons = {
  shop: ShoppingBag,
  calendar: CalendarDays,
  package: Package,
  chart: ChartNoAxesCombined,
  chat: MessagesSquare,
};
export function ProjectIcon({
  project,
  size = 24,
}: {
  project: Project;
  size?: number;
}) {
  const Icon = icons[project.icon];
  return (
    <span className={`project-icon tone-${project.color}`}>
      <Icon size={size} />
    </span>
  );
}
export function ProjectPreview({
  project,
  large = false,
}: {
  project: Project;
  large?: boolean;
}) {
  return (
    <div
      className={`project-preview tone-${project.color} ${large ? "preview-large" : ""}`}
      aria-label={`Prévia ilustrativa de ${project.title}`}
    >
      <div className="preview-window">
        <div className="preview-bar">
          <span className="preview-dots">● ● ●</span>
          <span>{project.title.toLowerCase().replaceAll(" ", "")}.app</span>
          <span>↗</span>
        </div>
        <div className="preview-body">
          <aside>
            <ProjectIcon project={project} size={16} />
            <i />
            <i />
            <i />
            <i />
          </aside>
          <div className="preview-main">
            <div className="preview-heading">
              <b>
                {project.icon === "calendar"
                  ? "Sua semana"
                  : project.icon === "package"
                    ? "Visão do estoque"
                    : project.icon === "chat"
                      ? "Atendimentos"
                      : "Visão geral"}
              </b>
              <span>Hoje⌄</span>
            </div>
            <div className="mini-stats">
              <div>
                <small>
                  {project.icon === "package" ? "Produtos" : "Total do dia"}
                </small>
                <strong>
                  {project.icon === "package"
                    ? "128"
                    : project.icon === "calendar"
                      ? "12 horários"
                      : "R$ 1.280"}
                </strong>
              </div>
              <div>
                <small>
                  {project.icon === "chat" ? "Resolvidos" : "Concluídos"}
                </small>
                <strong>
                  24 <em>↗ 12%</em>
                </strong>
              </div>
            </div>
            {project.icon === "calendar" ? (
              <div className="mini-calendar">
                {["SEG", "TER", "QUA", "QUI", "SEX"].map((d, i) => (
                  <div key={d}>
                    <small>{d}</small>
                    <b>{12 + i}</b>
                    <i />
                    <i />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mini-chart">
                {[32, 53, 43, 68, 48, 80, 64, 91, 72, 100, 81, 110].map(
                  (v, i) => (
                    <i key={i} style={{ height: `${v / 1.8}px` }} />
                  ),
                )}
              </div>
            )}
            <div className="mini-row">
              <span />
              <i />
              <b />
            </div>
            <div className="mini-row">
              <span />
              <i />
              <b />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
