"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/providers/demo-provider";
import { ProjectPreview, ProjectIcon } from "./project-preview";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { safeExternalUrl } from "@/lib/utils";
export function DetailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { projects, user, adopt, matches } = useDemo();
  const p = projects.find((p) => p.id === params.get("id"));
  const [confirm, setConfirm] = useState(false);
  const [preview, setPreview] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!p || p.status !== "APPROVED")
    return (
      <div className="container py-16">
        <EmptyState
          title="Sistema indisponível"
          description="Este projeto não está disponível na vitrine neste momento."
        >
          <Link className="button button-primary" href="/">
            Voltar à vitrine
          </Link>
        </EmptyState>
      </div>
    );
  const active = matches.some(
    (m) =>
      m.projectId === p.id &&
      m.merchantId === user?.id &&
      m.status === "ACTIVE",
  );
  const url = safeExternalUrl(p.productionUrl);
  function start() {
    if (!user) {
      router.push(
        `/entrar/?next=${encodeURIComponent(`/sistemas/detalhes/?id=${p!.id}`)}`,
      );
      return;
    }
    if (user.role !== "MERCHANT") {
      toast.error("Use o perfil de lojista para adotar um sistema.");
      return;
    }
    setConfirm(true);
  }
  function finish() {
    setBusy(true);
    try {
      adopt(p!.id);
      setConfirm(false);
      toast.success("Sistema adicionado ao seu painel.");
      if (url) window.location.assign(url);
      else router.push("/lojista/sistemas/");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container detail-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={16} /> Voltar à vitrine
      </Link>
      <div className="detail-grid">
        <div>
          <ProjectPreview project={p} large />
          <p className="preview-caption">
            Prévia ilustrativa · Projeto fictício na demonstração
          </p>
          <section className="detail-description">
            <h2>Sobre o sistema</h2>
            <p>{p.description}</p>
            <h2>O que você pode fazer</h2>
            <ul className="feature-list">
              {p.features.map((f) => (
                <li key={f}>
                  <Check size={18} />
                  {f}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="detail-sidebar">
          <span className="category-tag">{p.category}</span>
          <div className="flex items-center gap-3 my-5">
            <ProjectIcon project={p} size={30} />
            <h1 className="page-title">{p.title}</h1>
          </div>
          <p className="text-muted leading-relaxed">{p.tagline}</p>
          <div className="dev-credit">
            <span className={`avatar tone-${p.color}`}>{p.developer[0]}</span>
            <div>
              <small>Desenvolvido por</small>
              <strong>{p.developer}</strong>
            </div>
          </div>
          <div className="detail-benefit">
            <ShieldCheck size={21} />
            <span>
              Projeto aprovado para a vitrine
              <br />
              <small>Avalie a solução antes de adotá-la.</small>
            </span>
          </div>
          {active ? (
            <Link
              href="/lojista/sistemas/"
              className="button button-primary w-full"
            >
              Ver nos meus sistemas <ArrowUpRight size={17} />
            </Link>
          ) : (
            <Button className="w-full" onClick={start}>
              Adotar sistema <ArrowUpRight size={17} />
            </Button>
          )}
          <Button
            variant="secondary"
            className="w-full mt-3"
            onClick={() => {
              const demo = safeExternalUrl(p.demoUrl);
              if (demo) window.open(demo, "_blank", "noopener,noreferrer");
              else setPreview(true);
            }}
          >
            Ver demonstração <ExternalLink size={16} />
          </Button>
          <p className="text-sm text-muted mt-5 leading-relaxed">
            Você será direcionado ao site do desenvolvedor. O Hello Cliente
            registra a conexão e não hospeda o sistema.
          </p>
        </aside>
      </div>
      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Adotar ${p.title}`}
        description="Esta conexão será registrada no seu painel. Confira os termos antes de continuar."
      >
        <label className="check-label">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>
            Li e aceito os{" "}
            <Link href="/termos/" className="text-link">
              termos de adoção
            </Link>{" "}
            (versão 1.0). Entendo que o sistema é mantido pelo desenvolvedor.
          </span>
        </label>
        <div className="dialog-actions">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Cancelar
          </Button>
          <Button disabled={!accepted || busy} onClick={finish}>
            {busy ? "Registrando…" : "Confirmar adoção"}
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={preview}
        onOpenChange={setPreview}
        title={`Conheça ${p.title}`}
        description="Este projeto é fictício. A imagem abaixo ilustra a proposta do sistema; não há um aplicativo externo conectado."
      >
        <ProjectPreview project={p} />
      </Dialog>
    </div>
  );
}
