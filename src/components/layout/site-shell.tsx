"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Code2,
  Store,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useApi } from "@/providers/api-provider";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Hello Cliente — início">
      <span className="brand-symbol">
        h<span>.</span>
      </span>
      <span>
        hello<span className="font-normal">cliente</span>
        <span className="brand-period">.</span>
      </span>
    </Link>
  );
}
export function SiteShell({ children }: { children: ReactNode }) {
  const { user, logout } = useApi();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const dashboard =
    user?.role === "DEVELOPER"
      ? "/dev/projetos/"
      : user?.role === "ADMIN"
        ? "/admin/moderacao/"
        : "/lojista/sistemas/";
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav
            className={menu ? "nav nav-open" : "nav"}
            aria-label="Navegação principal"
          >
            <Link
              href="/"
              className={pathname === "/" ? "nav-active" : ""}
              onClick={() => setMenu(false)}
            >
              Explorar sistemas
            </Link>
            <Link href="/dev/projetos/" onClick={() => setMenu(false)}>
              Para desenvolvedores <ArrowUpRight size={14} />
            </Link>
            {user && (
              <Link href={dashboard} onClick={() => setMenu(false)}>
                Meu painel
              </Link>
            )}
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <span className="user-chip">
                  <span>{user.name.charAt(0)}</span>
                  <span className="hidden sm:inline">
                    {user.name.split(" ")[0]}
                  </span>
                </span>
                <button
                  className="icon-button"
                  onClick={() => void logout()}
                  aria-label="Sair"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link className="button button-primary" href="/entrar/">
                Entrar <ArrowUpRight size={16} />
              </Link>
            )}
            <button
              className="icon-button mobile-toggle"
              aria-expanded={menu}
              aria-label="Abrir menu"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="conteudo">{children}</main>
      <footer className="site-footer">
        <div>
          <Brand />
          <p>Pequenos negócios. Grandes possibilidades.</p>
        </div>
        <div className="footer-links">
          <Link href="/termos/">Termos e privacidade</Link>
          <Link href="/entrar/?perfil=admin">
            <ShieldCheck size={15} /> Administração
          </Link>
          <span>© {new Date().getFullYear()} Hello Cliente</span>
        </div>
      </footer>
    </>
  );
}
export function WorkspaceNav({
  role,
}: {
  role: "MERCHANT" | "DEVELOPER" | "ADMIN";
}) {
  const path = usePathname();
  const items =
    role === "DEVELOPER"
      ? [
          ["/dev/projetos/", "Meus projetos"],
          ["/dev/exclusoes/", "Solicitações de exclusão"],
          ["/dev/completar-cadastro/", "Perfil e acessos"],
        ]
      : role === "ADMIN"
        ? [["/admin/moderacao/", "Moderação de projetos"]]
        : [["/lojista/sistemas/", "Meus sistemas"]];
  return (
    <div className="workspace-nav">
      <span>
        {role === "DEVELOPER" ? (
          <Code2 size={18} />
        ) : role === "ADMIN" ? (
          <ShieldCheck size={18} />
        ) : (
          <Store size={18} />
        )}{" "}
        {role === "DEVELOPER"
          ? "Espaço do desenvolvedor"
          : role === "ADMIN"
            ? "Administração"
            : "Meu negócio"}
      </span>
      <nav aria-label="Navegação do painel">
        {items.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={path === href ? "selected" : ""}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
