"use client";
import Link from "next/link";
import { Plus, Pencil, Code2, ArrowUpRight } from "lucide-react";
import { useApi } from "@/providers/api-provider";
import { WorkspaceNav } from "@/components/layout/site-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProjectIcon } from "@/features/catalog/project-preview";
import { EmptyState } from "@/components/ui/empty-state";
export function ProjectsPage() {
  const { projects, user, matches } = useApi();
  const mine = projects.filter((p) => p.developerId === user?.id);
  return (
    <>
      <WorkspaceNav role="DEVELOPER" />
      <div className="container workspace">
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              OLÁ, {user?.name.split(" ")[0].toUpperCase()}
            </p>
            <h1 className="page-title">Seu código, fazendo a diferença.</h1>
            <p>Acompanhe seus projetos e as conexões que eles criam.</p>
          </div>
          <Link href="/dev/projetos/novo/" className="button button-primary">
            <Plus size={18} /> Enviar projeto
          </Link>
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Projetos publicados</span>
            <strong>
              {mine
                .filter((p) => p.status === "APPROVED")
                .length.toString()
                .padStart(2, "0")}
            </strong>
          </div>
          <div className="metric">
            <span>Projetos em análise</span>
            <strong>
              {mine
                .filter((p) => p.status === "PENDING")
                .length.toString()
                .padStart(2, "0")}
            </strong>
          </div>
          <div className="metric metric-note">
            <Code2 size={28} />
            <p>
              Seu perfil está conectado.
              <br />
              <Link
                href="/dev/completar-cadastro/"
                className="text-link text-sm"
              >
                Editar dados de contato <ArrowUpRight size={14} />
              </Link>
            </p>
          </div>
        </div>
        <h2 className="section-heading">
          Meus projetos <span>{mine.length}</span>
        </h2>
        <div className="system-list">
          {mine.map((p) => (
            <article className="system-row" key={p.id}>
              <ProjectIcon project={p} size={28} />
              <div className="system-info">
                <span className="text-sm text-muted">{p.category}</span>
                <h2>{p.title}</h2>
                <p>{p.tagline}</p>
                {p.reason && <p className="warning-line">{p.reason}</p>}
              </div>
              <div className="row-actions">
                <StatusBadge status={p.status} />
                <Link
                  className="text-link text-sm"
                  href={`/dev/projetos/novo/?id=${p.id}`}
                >
                  <Pencil size={14} /> Editar projeto
                </Link>
              </div>
            </article>
          ))}
        </div>
        {!mine.length && (
          <EmptyState
            title="Seu primeiro projeto começa aqui"
            description="Envie um sistema para a avaliação da plataforma."
          >
            <Link className="button button-primary" href="/dev/projetos/novo/">
              Enviar projeto
            </Link>
          </EmptyState>
        )}
      </div>
    </>
  );
}
