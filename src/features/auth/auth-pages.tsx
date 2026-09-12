"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Store, Code2, BriefcaseBusiness } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/providers/api-provider";
import { normalizePhone } from "@/services/api";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Role } from "@/domain/types";
const phone = z.string().transform(normalizePhone).pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Informe o WhatsApp com DDD ou código internacional."));
const password = z.string().min(12, "Use ao menos 12 caracteres.").refine(v => new TextEncoder().encode(v).length <= 72, "Use no máximo 72 bytes na senha.");
const registerSchema = z.object({
  name: z.string().trim().min(3).max(150), whatsapp: phone, password,
  businessName: z.string().trim().min(2).max(180), businessSector: z.string().trim().min(2).max(100),
  terms: z.literal(true, { errorMap: () => ({ message: "Aceite os termos para continuar." }) }),
});
function AuthFrame({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="container auth-grid"><aside className="auth-story">
    <p className="eyebrow">CONEXÕES QUE CONSTROEM</p><h2>Bom para o<br />seu negócio.<br /><span>Bom para quem<br />desenvolve.</span></h2>
    <p>Uma comunidade onde necessidades reais encontram novas possibilidades.</p>
    <div className="auth-story-bottom"><span>&lt;/&gt;</span><span>+</span><Store size={32} /></div>
  </aside><section className="auth-form"><h1 className="page-title">{title}</h1><p className="text-muted mt-3 mb-7">{description}</p>{children}</section></div>;
}
function dashboard(role: Role) { return role === "ADMIN" ? "/admin/moderacao/" : role === "DEVELOPER" ? "/dev/projetos/" : "/lojista/sistemas/"; }
export function LoginPage() {
  const params = useSearchParams(), router = useRouter();
  const [role, setRole] = useState<Role>(params.get("perfil") === "admin" ? "ADMIN" : params.get("perfil") === "developer" ? "DEVELOPER" : "MERCHANT");
  const { login, oauth, user, loading } = useApi();
  const [identifier, setIdentifier] = useState(""), [secret, setSecret] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    if (!loading && user && params.get("oauth")) {
      if (params.get("oauth") === "linked") toast.success("Provedor conectado à sua conta.");
      router.replace(dashboard(user.role));
    }
  }, [loading, user, params, router]);
  async function enter(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const me = await login(role === "ADMIN" ? "ADMIN" : "MERCHANT", role === "ADMIN"
        ? { email: identifier.trim(), password: secret } : { whatsapp: phone.parse(identifier), password: secret });
      const next = params.get("next");
      const safeNext = next && /^\/(lojista\/sistemas|dev\/(projetos|exclusoes)|admin\/moderacao|sistemas\/detalhes)\/?(\?[^\\]*)?$/.test(next) ? next : null;
      router.replace(safeNext ?? dashboard(me.role));
    } catch (e) { setError(e instanceof z.ZodError ? e.issues[0].message : (e as Error).message); }
    finally { setBusy(false); }
  }
  return <AuthFrame title="Que bom ter você aqui." description="Entre para gerenciar suas conexões.">
    <div className="profile-tabs"><button aria-pressed={role === "MERCHANT"} onClick={() => { setRole("MERCHANT"); setIdentifier(""); setError(""); }}><Store size={18} />Sou lojista</button>
      <button aria-pressed={role === "DEVELOPER"} onClick={() => { setRole("DEVELOPER"); setError(""); }}><Code2 size={18} />Sou dev</button></div>
    {role === "DEVELOPER" ? <div className="form-stack">
      <Button variant="secondary" onClick={() => oauth("github")}><Code2 size={19} />Continuar com GitHub</Button>
      <Button variant="secondary" onClick={() => oauth("linkedin")}><BriefcaseBusiness size={19} />Continuar com LinkedIn</Button>
      <p className="text-sm text-muted">Já usa outro provedor? Entre por ele e conecte o novo acesso no seu perfil.</p>
    </div> : <form className="form-stack" onSubmit={enter}>
      {role === "ADMIN" && <p>Acesso administrativo</p>}
      <Field id="identifier" label={role === "ADMIN" ? "E-mail" : "WhatsApp"} type={role === "ADMIN" ? "email" : "tel"} required autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} />
      <Field id="password" label="Senha" type="password" required autoComplete="current-password" value={secret} onChange={e => setSecret(e.target.value)} />
      {error && <p role="alert" className="field-error">{error}</p>}
      <Button disabled={busy} type="submit">{busy ? "Entrando…" : "Entrar"}<ArrowRight size={17} /></Button>
      {role === "MERCHANT" && <p className="text-sm">Ainda não tem conta? <Link className="text-link" href="/cadastro/">Cadastre seu negócio</Link></p>}
    </form>}
    <Link className="text-link block mt-6" href="/entrar/?perfil=admin" onClick={() => { setRole("ADMIN"); setIdentifier(""); setError(""); }}>Acesso administrativo</Link>
  </AuthFrame>;
}
export function RegisterPage() {
  const { register } = useApi(), router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema) });
  return <AuthFrame title="Vamos conhecer seu negócio." description="Crie sua conta para encontrar a ferramenta certa.">
    <form className="form-stack" onSubmit={form.handleSubmit(async ({ terms, ...body }) => {
      setError(""); try { await register({ ...body, termsVersion: "1.0" }); router.replace("/lojista/sistemas/"); }
      catch(e) { setError((e as Error).message); }
    })}>
      <Field id="name" label="Seu nome" autoComplete="name" {...form.register("name")} error={form.formState.errors.name?.message} />
      <Field id="businessName" label="Nome do negócio" {...form.register("businessName")} error={form.formState.errors.businessName?.message} />
      <Field id="businessSector" label="Ramo de atuação" {...form.register("businessSector")} error={form.formState.errors.businessSector?.message} />
      <Field id="whatsapp" label="WhatsApp com DDD" type="tel" placeholder="(11) 99999-9999" {...form.register("whatsapp")} error={form.formState.errors.whatsapp?.message} />
      <Field id="password" label="Senha (mínimo de 12 caracteres)" type="password" autoComplete="new-password" {...form.register("password")} error={form.formState.errors.password?.message} />
      <label className="check-label"><input type="checkbox" {...form.register("terms")} /><span>Li e aceito os <Link className="text-link" href="/termos/">termos e a política de privacidade</Link> (versão 1.0).</span></label>
      {form.formState.errors.terms && <p className="field-error">{form.formState.errors.terms.message}</p>}
      {error && <p role="alert" className="field-error">{error}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Criando conta…" : "Criar conta"}</Button>
    </form>
  </AuthFrame>;
}
export function RecoveryPage() { return <AuthFrame title="Recuperação de senha indisponível" description="A recuperação de senha está temporariamente desativada."><Link href="/entrar/" className="text-link">Voltar para entrar</Link></AuthFrame>; }
export function CompleteProfilePage() {
  const { user, updateUser, linkProvider } = useApi();
  const [name, setName] = useState(user?.name ?? ""), [busy, setBusy] = useState(false);
  useEffect(() => setName(user?.name ?? ""), [user?.name]);
  async function link(provider: "github" | "linkedin") { setBusy(true); try { await linkProvider(provider); } catch(e) { toast.error((e as Error).message); } finally { setBusy(false); } }
  return <AuthFrame title="Seu perfil de desenvolvedor" description="Atualize seu nome e conecte suas formas de acesso.">
    <form className="form-stack" onSubmit={async e => { e.preventDefault(); setBusy(true); try { await updateUser({ name }); toast.success("Perfil atualizado."); } catch(e) { toast.error((e as Error).message); } finally { setBusy(false); } }}>
      <Field id="name" label="Nome" minLength={3} maxLength={150} required value={name} onChange={e => setName(e.target.value)} />
      <Field id="email" label="E-mail confirmado pelo provedor" value={user?.email ?? ""} readOnly />
      <Button disabled={busy}>Salvar perfil</Button>
    </form>
    <div className="form-stack mt-8"><h2>Formas de acesso</h2><Button disabled={busy} variant="secondary" onClick={() => link("github")}>Conectar GitHub</Button><Button disabled={busy} variant="secondary" onClick={() => link("linkedin")}>Conectar LinkedIn</Button></div>
    <Link href="/dev/projetos/" className="text-link block mt-6">Voltar aos projetos</Link>
  </AuthFrame>;
}
