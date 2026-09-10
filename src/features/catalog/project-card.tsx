import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { Project } from "@/domain/types";
import { ProjectPreview, ProjectIcon } from "./project-preview";
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <Link
        href={`/sistemas/detalhes/?id=${project.id}`}
        className="preview-link"
        aria-label={`Conhecer ${project.title}`}
      >
        <ProjectPreview project={project} />
      </Link>
      <div className="card-content">
        <div className="flex justify-between items-center gap-2">
          <span className="category-tag">{project.category}</span>
          <span className="available-label">
            <Check size={13} /> Disponível para adoção
          </span>
        </div>
        <div className="card-title">
          <ProjectIcon project={project} />
          <h2>
            <Link href={`/sistemas/detalhes/?id=${project.id}`}>
              {project.title}
            </Link>
          </h2>
        </div>
        <p>{project.tagline}</p>
        <div className="card-footer">
          <span>
            <span className={`avatar tone-${project.color}`}>
              {project.developer
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            {project.developer}
          </span>
          <Link
            href={`/sistemas/detalhes/?id=${project.id}`}
            aria-label={`Ver detalhes de ${project.title}`}
          >
            <ArrowUpRight size={21} />
          </Link>
        </div>
      </div>
    </article>
  );
}
