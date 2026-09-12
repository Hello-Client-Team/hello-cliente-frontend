"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Send, Info } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/providers/api-provider";
import { categories } from "@/domain/types";
import { WorkspaceNav } from "@/components/layout/site-shell";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
const httpUrl = z
  .string()
  .url("Informe uma URL válida.")
  .refine((v) => /^https?:\/\//i.test(v), "Use um endereço HTTP ou HTTPS.");
const projectSchema = z.object({
  title: z.string().trim().min(3, "Use pelo menos 3 caracteres.").max(160),
  category: z.enum([
    "Vendas",
    "Agendamento",
    "Estoque",
    "Financeiro",
    "Atendimento",
  ]),
  description: z
    .string()
    .trim()
    .min(30, "Descreva seu sistema em pelo menos 30 caracteres.")
    .max(5000),
  productionUrl: httpUrl,
  demoUrl: httpUrl,
});
type Values = z.infer<typeof projectSchema>;
export function ProjectForm() {
  const { projects, user, submit } = useApi();
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const existing = projects.find(
    (p) => p.id === id && p.developerId === user?.id,
  );
  const form = useForm<Values>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: existing?.title ?? "",
      category: existing?.category ?? "Vendas",
      description: existing?.description ?? "",
      productionUrl: existing?.productionUrl ?? "",
      demoUrl: existing?.demoUrl ?? "",
    },
  });
  if (id && !existing)
    return (
      <div className="container py-20">
        <h1 className="page-title">Projeto não encontrado no seu perfil.</h1>
        <Link className="text-link" href="/dev/projetos/">
          Voltar aos projetos
        </Link>
      </div>
    );
  async function onSubmit(values: Values) {
    try {
      await submit({
        ...values,
        id: existing?.id ?? crypto.randomUUID(),
        developerId: user!.id,
        developer: user!.name,
        status: "PENDING",
        tagline: values.description.slice(0, 100),
        color: existing?.color ?? "green",
        icon: existing?.icon ?? "shop",
        features: existing?.features ?? [
          "Conheça as funcionalidades na demonstração",
        ],
      }, !!existing);
      toast.success("Projeto enviado para análise.");
      router.push("/dev/projetos/");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  return (
    <>
      <WorkspaceNav role="DEVELOPER" />
      <div className="container workspace">
        <Link className="back-link" href="/dev/projetos/">
          <ArrowLeft size={16} /> Meus projetos
        </Link>
        <div className="page-heading">
          <div>
            <h1 className="page-title">
              {existing
                ? "Vamos atualizar seu projeto."
                : "Dê um próximo passo ao seu projeto."}
            </h1>
            <p>Conte o que você criou e como pode ajudar um negócio.</p>
          </div>
        </div>
        <div className="form-layout">
          <form
            className="panel form-stack"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <h2 className="section-heading">Informações do sistema</h2>
            <Field
              id="title"
              label="Nome do projeto"
              placeholder="Ex.: Balcão"
              {...form.register("title")}
              error={form.formState.errors.title?.message}
            />
            <div className="field">
              <label htmlFor="category">Categoria</label>
              <select id="category" {...form.register("category")}>
                {categories
                  .filter((c) => c !== "Todos")
                  .map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                rows={5}
                placeholder="O que seu sistema resolve? Para quem ele foi feito?"
                {...form.register("description")}
                aria-invalid={!!form.formState.errors.description}
                aria-describedby="description-error"
              />
              <p className="field-error" id="description-error">
                {form.formState.errors.description?.message}
              </p>
            </div>
            <Field
              id="productionUrl"
              label="URL de produção"
              type="url"
              placeholder="https://meusistema.com.br"
              {...form.register("productionUrl")}
              error={form.formState.errors.productionUrl?.message}
            />
            <Field
              id="demoUrl"
              label="URL de demonstração"
              type="url"
              placeholder="https://demo.meusistema.com.br"
              {...form.register("demoUrl")}
              error={form.formState.errors.demoUrl?.message}
            />
            <div className="flex flex-wrap justify-end gap-3 pt-3">
              <Link href="/dev/projetos/" className="button button-secondary">
                Cancelar
              </Link>
              <Button disabled={form.formState.isSubmitting} type="submit">
                <Send size={16} />
                {form.formState.isSubmitting
                  ? "Enviando…"
                  : "Enviar para análise"}
              </Button>
            </div>
          </form>
          <aside>
            <div className="panel guidance">
              <Info size={24} />
              <h2>Antes de enviar</h2>
              <ul>
                <li>Verifique se os dois endereços estão acessíveis.</li>
                <li>Ofereça uma demonstração sem dados pessoais reais.</li>
                <li>Descreva as limitações e os requisitos da solução.</li>
                <li>Mantenha um e-mail de contato atualizado.</li>
              </ul>
            </div>
            <p className="text-muted text-sm mt-5 leading-relaxed">
              O projeto ficará em análise até a aprovação. Editar um projeto
              publicado também o retorna para análise e o remove temporariamente
              da vitrine.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
