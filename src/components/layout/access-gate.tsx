"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import type { Role } from "@/domain/types";
import { useDemo } from "@/providers/demo-provider";
export function AccessGate({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { user } = useDemo();
  const path = usePathname();
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
        Escolher acesso de demonstração
      </Link>
    </section>
  );
}
