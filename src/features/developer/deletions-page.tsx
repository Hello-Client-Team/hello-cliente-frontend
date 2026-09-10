"use client";
import { useState } from "react";
import { Clock3, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/providers/demo-provider";
import { WorkspaceNav } from "@/components/layout/site-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
export function DeletionsPage() {
  const { revocations, projects, user, declareDeletion } = useDemo();
  const [selected, setSelected] = useState<string | null>(null);
  const mine = revocations.filter((r) =>
    projects.some((p) => p.id === r.projectId && p.developerId === user?.id),
  );
  return (
    <>
      <WorkspaceNav role="DEVELOPER" />
      <div className="container workspace">
        <div className="page-heading">
          <div>
            <p className="eyebrow">RESPONSABILIDADE COM OS DADOS</p>
            <h1 className="page-title">Solicitações de exclusão</h1>
            <p>
              Acompanhe os prazos e registre a conclusão no seu sistema externo.
            </p>
          </div>
        </div>
        <div className="notice mb-8">
          <Clock3 size={22} />
          <p>
            O prazo configurado é de 48 horas a partir da solicitação. Declare a
            conclusão somente após excluir os dados correspondentes no seu
            sistema.
          </p>
        </div>
        {mine.length ? (
          <div className="system-list">
            {mine.map((r) => (
              <article className="system-row" key={r.id}>
                <span className="project-icon tone-green">
                  {r.declaredAt ? <CheckCheck /> : <Clock3 />}
                </span>
                <div className="system-info">
                  <h2>{r.merchantName}</h2>
                  <p>
                    {projects.find((p) => p.id === r.projectId)?.title} · Match{" "}
                    {r.matchId}
                  </p>
                  <p>Solicitado: {formatDate(r.requestedAt)}</p>
                  <p className={r.declaredAt ? "success-line" : "warning-line"}>
                    {r.declaredAt
                      ? `Exclusão declarada em ${formatDate(r.declaredAt)}`
                      : `Prazo: ${formatDate(r.deadlineAt)}`}
                  </p>
                </div>
                {!r.declaredAt && (
                  <Button variant="secondary" onClick={() => setSelected(r.id)}>
                    Declarar exclusão
                  </Button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma solicitação pendente"
            description="Quando um lojista revogar uma adoção dos seus projetos, a solicitação aparecerá aqui."
          />
        )}
        <Dialog
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          title="Declarar exclusão concluída?"
          description="Esta declaração registra que você concluiu a exclusão dos dados correspondentes ao Match no seu banco externo. A plataforma não verifica esse banco diretamente."
        >
          <div className="dialog-actions">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                try {
                  declareDeletion(selected!);
                  setSelected(null);
                  toast.success("Declaração registrada na demonstração.");
                } catch (e) {
                  toast.error((e as Error).message);
                }
              }}
            >
              Confirmar declaração
            </Button>
          </div>
        </Dialog>
      </div>
    </>
  );
}
