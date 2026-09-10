"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  Store,
  Code2,
  BriefcaseBusiness,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/providers/demo-provider";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Role } from "@/domain/types";
const phone = z
  .string()
  .regex(/^\+?[\d\s()-]{10,20}$/, "Informe um WhatsApp com DDD válido.");
const loginSchema = z.object({
  whatsapp: phone,
  password: z.string().min(8, "Use ao menos 8 caracteres."),
});
const registerSchema = loginSchema.extend({
  name: z.string().min(3, "Informe seu nome."),
  businessName: z.string().min(2, "Informe o nome do negócio."),
  sector: z.string().min(2, "Informe o ramo."),
  terms: z.literal(true, {
    errorMap: () => ({ message: "Aceite os termos para continuar." }),
  }),
});
const profileSchema = z.object({
  name: z.string().min(3, "Informe seu nome."),
  email: z.string().email("Informe um e-mail válido."),
});
function AuthFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="container auth-grid">
      <aside className="auth-story">
        <p className="eyebrow">CONEXÕES QUE CONSTROEM</p>
        <h2>
          Bom para o<br />
          seu negócio.
          <br />
          <span>
            Bom para quem
            <br />
            desenvolve.
          </span>
        </h2>
        <p>
          Uma comunidade onde necessidades reais encontram novas possibilidades.
        </p>
        <div className="auth-story-bottom">
          <span>&lt;/&gt;</span>
          <span>+</span>
          <Store size={32} />
        </div>
      </aside>
      <section className="auth-form">
        <h1 className="page-title">{title}</h1>
        <p className="text-muted mt-3 mb-7">{description}</p>
        {children}
      </section>
    </div>
  );
}
export function LoginPage() {
  const params = useSearchParams();
  const requested = params.get("perfil");
  const [role, setRole] = useState<Role>(
    requested === "admin"
      ? "ADMIN"
      : requested === "developer"
        ? "DEVELOPER"
        : "MERCHANT",
  );
  const { login } = useDemo();
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });
  function enter(r: Role) {
    login(r);
    const next = params.get("next");
    const target =
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : r === "DEVELOPER"
          ? "/dev/projetos/"
          : r === "ADMIN"
            ? "/admin/moderacao/"
            : "/lojista/sistemas/";
    router.push(target);
  }
  return (
    <AuthFrame
      title="Que bom ter você aqui."
      description="Escolha como você quer fazer parte dessa conexão."
    >
      <div className="profile-tabs">
        <button
          aria-pressed={role === "MERCHANT"}
          onClick={() => setRole("MERCHANT")}
        >
          <Store size={18} /> Sou lojista
        </button>
        <button
          aria-pressed={role === "DEVELOPER"}
          onClick={() => setRole("DEVELOPER")}
        >
          <Code2 size={18} /> Sou dev
        </button>
      </div>
      {role === "MERCHANT" ? (
        <>
          <form
            onSubmit={form.handleSubmit(() =>
              toast.info(
                "Login real depende da API. Use o acesso de demonstração abaixo.",
              ),
            )}
            className="form-stack"
          >
            <Field
              label="WhatsApp"
              id="whatsapp"
              type="tel"
              placeholder="(11) 99999-9999"
              autoComplete="tel"
              error={form.formState.errors.whatsapp?.message}
              {...form.register("whatsapp")}
            />
            <Field
              label="Senha"
              id="password"
              type="password"
              autoComplete="current-password"
              error={form.formState.errors.password?.message}
              {...form.register("password")}
            />
            <Link
              className="text-link text-sm self-end"
              href="/recuperar-senha/"
            >
              Esqueci minha senha
            </Link>
            <Button type="submit">
              Entrar <ArrowRight size={17} />
            </Button>
          </form>
          <p className="text-center text-muted text-sm mt-5">
            Ainda não tem conta?{" "}
            <Link className="text-link" href="/cadastro/">
              Cadastre seu negócio
            </Link>
          </p>
        </>
      ) : role === "DEVELOPER" ? (
        <div className="form-stack">
          <Button
            variant="secondary"
            onClick={() =>
              toast.info(
                "GitHub OAuth será habilitado com a API. Use o acesso de demonstração.",
              )
            }
          >
            <Code2 size={19} /> Continuar com GitHub
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.info(
                "LinkedIn OAuth será habilitado com a API. Use o acesso de demonstração.",
              )
            }
          >
            <BriefcaseBusiness size={19} /> Continuar com LinkedIn
          </Button>
          <p className="text-sm text-muted">
            Seu perfil conecta seus projetos às pessoas que precisam deles.
          </p>
        </div>
      ) : (
        <div className="notice">
          <ShieldCheck size={20} />
          <p>
            A administração real exige uma conta previamente autorizada no
            backend.
          </p>
        </div>
      )}
      <div className="demo-access">
        <span>EXPLORE O PROTÓTIPO</span>
        <p>Nenhuma senha ou conta externa é necessária.</p>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => enter(role)}
        >
          Acessar demonstração de{" "}
          {role === "DEVELOPER"
            ? "dev"
            : role === "ADMIN"
              ? "admin"
              : "lojista"}{" "}
          <ArrowRight size={16} />
        </Button>
      </div>
    </AuthFrame>
  );
}
export function RegisterPage() {
  const { login, updateUser } = useDemo();
  const router = useRouter();
  const [verification, setVerification] = useState(false);
  const [draft, setDraft] = useState<z.infer<typeof registerSchema> | null>(
    null,
  );
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });
  return (
    <AuthFrame
      title={
        verification ? "Verifique seu WhatsApp" : "Vamos conhecer seu negócio."
      }
      description={
        verification
          ? "A verificação de posse do número será feita por código no WhatsApp."
          : "Um primeiro passo para encontrar a ferramenta certa."
      }
    >
      {verification ? (
        <div className="form-stack">
          <div className="notice">
            <p>
              O envio de código ainda não está conectado. Você pode simular a
              conclusão sem informar um código real.
            </p>
          </div>
          <Button
            onClick={() => {
              login("MERCHANT");
              updateUser({
                name: draft!.name,
                businessName: draft!.businessName,
              });
              toast.success("Cadastro de demonstração concluído.");
              router.push("/lojista/sistemas/");
            }}
          >
            Simular verificação e continuar
          </Button>
          <Button variant="ghost" onClick={() => setVerification(false)}>
            Voltar aos dados
          </Button>
        </div>
      ) : (
        <form
          className="form-stack"
          onSubmit={form.handleSubmit((data) => {
            setDraft(data);
            setVerification(true);
          })}
        >
          <Field
            label="Seu nome"
            id="name"
            autoComplete="name"
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <Field
            label="Nome do negócio"
            id="businessName"
            autoComplete="organization"
            error={form.formState.errors.businessName?.message}
            {...form.register("businessName")}
          />
          <Field
            label="Ramo de atuação"
            id="sector"
            placeholder="Ex.: cafeteria, salão, minimercado"
            error={form.formState.errors.sector?.message}
            {...form.register("sector")}
          />
          <Field
            label="WhatsApp com DDD"
            id="whatsapp"
            type="tel"
            autoComplete="tel"
            error={form.formState.errors.whatsapp?.message}
            {...form.register("whatsapp")}
          />
          <Field
            label="Crie uma senha"
            id="password"
            type="password"
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
          <label className="check-label">
            <input type="checkbox" {...form.register("terms")} />
            <span>
              Li e aceito os{" "}
              <Link className="text-link" href="/termos/">
                termos e a política de privacidade
              </Link>
              .
            </span>
          </label>
          {form.formState.errors.terms && (
            <p className="field-error">{form.formState.errors.terms.message}</p>
          )}
          <Button type="submit">
            Continuar <ArrowRight size={16} />
          </Button>
          <p className="text-sm text-muted">
            Use dados fictícios nesta demonstração. Nada é enviado a um
            servidor.
          </p>
        </form>
      )}
    </AuthFrame>
  );
}
export function RecoveryPage() {
  const [step, setStep] = useState(0);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });
  return (
    <AuthFrame
      title="Recupere seu acesso."
      description="Você poderá redefinir sua senha após verificar a posse do WhatsApp."
    >
      {step === 0 ? (
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            const result = phone.safeParse(form.getValues("whatsapp"));
            if (!result.success) {
              form.setError("whatsapp", {
                message: "Informe um WhatsApp válido.",
              });
              return;
            }
            setStep(1);
          }}
        >
          <Field
            label="WhatsApp com DDD"
            id="phone"
            type="tel"
            error={form.formState.errors.whatsapp?.message}
            {...form.register("whatsapp")}
          />
          <Button>Continuar</Button>
        </form>
      ) : step === 1 ? (
        <div className="form-stack">
          <div className="notice">
            <p>
              Não há envio de código nesta demonstração. Na aplicação integrada,
              o backend verificará o código antes de permitir redefinir a senha.
            </p>
          </div>
          <Button onClick={() => setStep(2)}>
            Simular verificação do número
          </Button>
        </div>
      ) : step === 2 ? (
        <form
          className="form-stack"
          onSubmit={form.handleSubmit(() => setStep(3))}
        >
          <Field
            label="Nova senha"
            id="new-password"
            type="password"
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
          <Button>Simular redefinição</Button>
        </form>
      ) : (
        <div className="notice">
          <Check size={22} />
          <p>
            Fluxo de redefinição concluído na demonstração. Nenhuma senha foi
            armazenada ou alterada.
          </p>
        </div>
      )}
      <Link href="/entrar/" className="text-link block mt-6">
        Voltar para entrar
      </Link>
    </AuthFrame>
  );
}
export function CompleteProfilePage() {
  const { user, updateUser } = useDemo();
  const router = useRouter();
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });
  return (
    <AuthFrame
      title="Complete seu perfil de dev."
      description="Seu e-mail será usado para notificações sobre os projetos e solicitações de exclusão."
    >
      <form
        className="form-stack"
        onSubmit={form.handleSubmit((data) => {
          updateUser(data);
          toast.success(
            "Perfil atualizado na demonstração. Verificação de e-mail depende da API.",
          );
          router.push("/dev/projetos/");
        })}
      >
        <Field
          id="name"
          label="Nome"
          {...form.register("name")}
          error={form.formState.errors.name?.message}
        />
        <Field
          id="email"
          label="E-mail de contato"
          type="email"
          {...form.register("email")}
          error={form.formState.errors.email?.message}
        />
        <Button>Salvar perfil</Button>
      </form>
    </AuthFrame>
  );
}
