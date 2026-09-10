"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Plus,
  TriangleAlert,
  Clock3,
  CheckCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/providers/demo-provider";
import { WorkspaceNav } from "@/components/layout/site-shell";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectIcon } from "@/features/catalog/project-preview";
import { formatDate, safeExternalUrl } from "@/lib/utils";
export function SystemsPage() {
  const { user, projects, matches, revocations, revoke } = useDemo();
  const [tab, setTab] = useState("active");
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const mine = matches.filter((m) => m.merchantId === user?.id);
  const active = mine.filter((m) => m.status === "ACTIVE");
  const revoked = mine.filter((m) => m.status === "REVOKED");
  function confirm() {
    if (!selected) return;
    setBusy(true);
    try {
      revoke(selected);
      setSelected(null);
      toast.success(
        "Revogação registrada na demonstração. Nenhum e-mail foi enviado.",
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <WorkspaceNav role="MERCHANT" />
      <div className="container workspace">
        <div className="page-heading">
          <div>
            <p className="eyebrow">{user?.businessName ?? "MEU NEGÓCIO"}</p>
            <h1 className="page-title">Suas ferramentas, em um só lugar.</h1>
            <p>Acesse seus sistemas e gerencie suas conexões.</p>
          </div>
          <Link className="button button-primary" href="/">
            <Plus size={18} /> Explorar sistemas
          </Link>
        </div>
        <div className="metric-grid">
          <div className="metric">
            <span>Sistemas ativos</span>
            <strong>{active.length.toString().padStart(2, "0")}</strong>
          </div>
          <div className="metric">
            <span>Solicitações de exclusão</span>
            <strong>{revoked.length.toString().padStart(2, "0")}</strong>
          </div>
          <div className="metric metric-note">
            <ShieldCheck size={27} />
            <p>
              Você tem o controle.
              <br />
              <span>Gerencie suas adoções quando precisar.</span>
            </p>
          </div>
        </div>
        <div className="section-tabs">
          <button
            aria-pressed={tab === "active"}
            onClick={() => setTab("active")}
          >
            Meus sistemas <span>{active.length}</span>
          </button>
          <button
            aria-pressed={tab === "revoked"}
            onClick={() => setTab("revoked")}
          >
            Revogações <span>{revoked.length}</span>
          </button>
        </div>
        <div className="system-list">
          {(tab === "active" ? active : revoked).map((m) => {
            const p = projects.find((p) => p.id === m.projectId);
            if (!p) return null;
            const r = revocations.find((r) => r.matchId === m.id);
            return (
              <article className="system-row" key={m.id}>
                <ProjectIcon project={p} size={27} />
                <div className="system-info">
                  <span className="text-muted text-sm">{p.category}</span>
                  <h2>{p.title}</h2>
                  <p>
                    Por {p.developer} · Adotado em {formatDate(m.adoptedAt)}
                  </p>
                  {p.status !== "APPROVED" && m.status === "ACTIVE" && (
                    <p className="warning-line">
                      <TriangleAlert size={15} /> Sistema fora da vitrine. O
                      endereço pode estar indisponível.
                    </p>
                  )}
                  {r && (
                    <p
                      className={r.declaredAt ? "success-line" : "warning-line"}
                    >
                      {r.declaredAt ? (
                        <CheckCheck size={16} />
                      ) : (
                        <Clock3 size={16} />
                      )}{" "}
                      {r.declaredAt
                        ? `Exclusão declarada em ${formatDate(r.declaredAt)}`
                        : `Exclusão solicitada · Prazo: ${formatDate(r.deadlineAt)}`}
                    </p>
                  )}
                </div>
                {m.status === "ACTIVE" && (
                  <div className="row-actions">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const url = safeExternalUrl(p.productionUrl);
                        if (url)
                          window.open(url, "_blank", "noopener,noreferrer");
                        else
                          toast.info(
                            "Este é um sistema fictício, sem endereço externo conectado.",
                          );
                      }}
                    >
                      Abrir sistema <ArrowUpRight size={16} />
                    </Button>
                    <button
                      className="danger-link"
                      onClick={() => setSelected(m.id)}
                    >
                      Revogar acesso
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        {!(tab === "active" ? active : revoked).length && (
          <EmptyState
            title={
              tab === "active"
                ? "Seu próximo sistema está na vitrine"
                : "Nenhuma revogação por aqui"
            }
            description={
              tab === "active"
                ? "Explore as soluções e adote a que combina com seu negócio."
                : "As solicitações de exclusão aparecerão aqui."
            }
          />
        )}
        <div className="notice mt-8">
          <ShieldCheck size={20} />
          <p>
            Os sistemas são mantidos pelos desenvolvedores. A revogação registra
            sua solicitação de exclusão, mas não encerra automaticamente uma
            sessão no site externo.
          </p>
        </div>
        <Dialog
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          title="Revogar acesso ao sistema?"
          description="O sistema sairá da sua lista de adoções ativas. Na aplicação integrada, o desenvolvedor será notificado para excluir seus dados externos em até 48 horas."
        >
          <div className="notice">
            <p>
              Você poderá acompanhar a solicitação na aba Revogações. Nesta
              demonstração, nenhum e-mail é enviado.
            </p>
          </div>
          <div className="dialog-actions">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Manter sistema
            </Button>
            <Button variant="danger" disabled={busy} onClick={confirm}>
              Confirmar revogação
            </Button>
          </div>
        </Dialog>
      </div>
    </>
  );
}
