"use client";
import { useState } from "react";
import { Check, X, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/providers/demo-provider";
import { WorkspaceNav } from "@/components/layout/site-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectIcon } from "@/features/catalog/project-preview";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { safeExternalUrl } from "@/lib/utils";
import type { ProjectStatus } from "@/domain/types";
export function ModerationPage() {
  const { projects, moderate } = useDemo();
  const [status, setStatus] = useState<ProjectStatus | "ALL">("PENDING");
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const p = projects.find((p) => p.id === selected);
  const list = projects.filter((p) => status === "ALL" || p.status === status);
  function decide(decision: "APPROVED" | "REJECTED") {
    if (!p) return;
    setBusy(true);
    try {
      moderate(p.id, decision, reason);
      toast.success(
        decision === "APPROVED"
          ? "Projeto aprovado e disponível na vitrine."
          : "Projeto rejeitado com justificativa.",
      );
      setSelected(null);
      setReason("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <WorkspaceNav role="ADMIN" />
      <div className="container workspace">
        <div className="page-heading">
          <div>
            <p className="eyebrow">CURADORIA DA VITRINE</p>
            <h1 className="page-title">Boas conexões começam aqui.</h1>
            <p>Avalie projetos antes de disponibilizá-los aos lojistas.</p>
          </div>
          <span className="admin-chip">
            <ShieldCheck size={18} /> Administração
          </span>
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Aguardando avaliação</span>
            <strong>
              {projects
                .filter((p) => p.status === "PENDING")
                .length.toString()
                .padStart(2, "0")}
            </strong>
          </div>
          <div className="metric">
            <span>Aprovados na vitrine</span>
            <strong>
              {projects
                .filter((p) => p.status === "APPROVED")
                .length.toString()
                .padStart(2, "0")}
            </strong>
          </div>
          <div className="metric">
            <span>Projetos suspensos</span>
            <strong>
              {projects
                .filter((p) => p.status === "SUSPENDED")
                .length.toString()
                .padStart(2, "0")}
            </strong>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="section-heading">Projetos para acompanhar</h2>
          <label className="sort-control">
            <span className="sr-only">Filtrar status</span>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as ProjectStatus | "ALL")
              }
            >
              <option value="PENDING">Em análise</option>
              <option value="APPROVED">Aprovados</option>
              <option value="REJECTED">Rejeitados</option>
              <option value="SUSPENDED">Suspensos</option>
              <option value="ALL">Todos os projetos</option>
            </select>
          </label>
        </div>
        <div className="system-list">
          {list.map((p) => (
            <article className="system-row" key={p.id}>
              <ProjectIcon project={p} />
              <div className="system-info">
                <h2>{p.title}</h2>
                <p>
                  {p.category} · {p.developer}
                </p>
              </div>
              <StatusBadge status={p.status} />
              <Button
                variant="secondary"
                onClick={() => {
                  setSelected(p.id);
                  setReason("");
                }}
              >
                Revisar projeto
              </Button>
            </article>
          ))}
        </div>
        {!list.length && (
          <EmptyState
            title="Tudo em dia nesta categoria"
            description="Não há projetos com o status selecionado."
          />
        )}
        <Dialog
          open={!!p}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          title={p ? `Avaliar ${p.title}` : "Avaliar projeto"}
          description="Revise a proposta, a demonstração e o funcionamento antes de decidir."
        >
          {p && (
            <div className="form-stack">
              <StatusBadge status={p.status} />
              <p className="text-muted">{p.description}</p>
              <div className="flex gap-3 flex-wrap">
                {[
                  ["Produção", p.productionUrl],
                  ["Demonstração", p.demoUrl],
                ].map(([label, url]) => (
                  <Button
                    key={label}
                    variant="secondary"
                    onClick={() => {
                      const safe = safeExternalUrl(url);
                      if (safe)
                        window.open(safe, "_blank", "noopener,noreferrer");
                      else toast.info("Projeto fictício, sem URL externa.");
                    }}
                  >
                    {label}
                    <ExternalLink size={14} />
                  </Button>
                ))}
              </div>
              {p.reason && (
                <div className="notice">
                  <p>{p.reason}</p>
                </div>
              )}
              {p.status === "SUSPENDED" && (
                <div className="health-history">
                  <strong>Verificações de demonstração</strong>
                  <p>3 tentativas consecutivas · Timeout</p>
                  <small>Histórico ilustrativo, sem requisições reais.</small>
                </div>
              )}
              <div className="field">
                <label htmlFor="reason">
                  Justificativa{" "}
                  <span className="text-muted">
                    (obrigatória para rejeitar)
                  </span>
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="dialog-actions">
                <Button
                  variant="danger"
                  disabled={busy || !reason.trim()}
                  onClick={() => decide("REJECTED")}
                >
                  <X size={16} /> Rejeitar
                </Button>
                <Button disabled={busy} onClick={() => decide("APPROVED")}>
                  <Check size={16} /> Aprovar projeto
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </>
  );
}
