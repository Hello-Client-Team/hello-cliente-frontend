"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import type { Role } from "@/domain/types";
import { useApi } from "@/providers/api-provider";
export function AccessGate({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { user, loading, error, reload } = useApi();
  const path = usePathname();
  if (loading) return <p className="container py-20" role="status">Carregando seu painel…</p>;
  if (error) return <div className="container py-20" role="alert"><p>{error}</p><button className="button button-secondary" onClick={() => void reload()}>Tentar novamente</button></div>;
  if (user?.role === role) return children;
  return (
    <section className="container narrow py-20 text-center">
      <LockKeyhole size={38} className="mx-auto mb-5 text-brand" />
      <h1 className="page-title">
        {user ? "Este espaço pertence a outro perfil" : "Entre para continuar"}
      </h1>
      <p className="text-muted my-5">
        Acesse como{" "}
        {role === "DEVELOPER"
          ? "desenvolvedor"
          : role === "ADMIN"
            ? "administrador"
            : "lojista"}{" "}
        para usar este painel.
      </p>
      <Link
        className="button button-primary"
        href={`/entrar/?perfil=${role.toLowerCase()}&next=${encodeURIComponent(path)}`}
      >
        Entrar na minha conta
      </Link>
    </section>
  );
}
