"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Code2,
  Check,
  LayoutGrid,
  Store,
  CalendarDays,
  Package,
  ChartNoAxesCombined,
  MessagesSquare,
  X,
} from "lucide-react";
import { categories, type Category } from "@/domain/types";
import { useApi } from "@/providers/api-provider";
import { ProjectCard } from "./project-card";
import { EmptyState } from "@/components/ui/empty-state";
const icons = [
  LayoutGrid,
  Store,
  CalendarDays,
  Package,
  ChartNoAxesCombined,
  MessagesSquare,
];
export function CatalogPage() {
  const { projects, loading, error, reload } = useApi();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("Todos");
  const [sort, setSort] = useState("recommended");
  const visible = useMemo(() => {
    const list = projects.filter(
      (p) =>
        p.status === "APPROVED" &&
        (category === "Todos" || p.category === category) &&
        `${p.title} ${p.description} ${p.category}`
          .toLocaleLowerCase("pt-BR")
          .includes(search.toLocaleLowerCase("pt-BR")),
    );
    return sort === "name"
      ? list.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))
      : list;
  }, [projects, category, search, sort]);
  return (
    <div className="container catalog">
      <section className="catalog-intro">
        <div>
          <p className="eyebrow">
            <span className="tiny-square" /> FEITO POR DEVS. PENSADO PARA O SEU
            NEGÓCIO.
          </p>
          <h1>
            Seu negócio merece
            <br />
            uma <span>boa ferramenta.</span>
          </h1>
          <p>
            Encontre sistemas para simplificar sua rotina.
            <br className="hidden sm:block" /> Conecte-se a quem desenvolve e
            cresçam juntos.
          </p>
        </div>
        <div className="intro-note">
          <div className="flex -space-x-2 mb-3">
            <span className="round-symbol bg-[#c5ddcc]">&lt;/&gt;</span>
            <span className="round-symbol bg-[#f1d0aa]">
              <Store size={24} />
            </span>
          </div>
          <strong>Uma troca que faz sentido.</strong>
          <p>
            Você ganha uma solução.
            <br />
            Um dev ganha experiência real.
          </p>
          <Link href="/termos/">
            Entenda a conexão <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <section aria-label="Busca de sistemas">
        <div className="search-row">
          <div className="search-input">
            <Search size={21} />
            <input
              aria-label="Buscar sistemas"
              placeholder="O que seu negócio precisa hoje?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button aria-label="Limpar busca" onClick={() => setSearch("")}>
                <X size={18} />
              </button>
            )}
            <span className="search-hint">Buscar sistemas</span>
          </div>
          <label className="sort-control">
            <SlidersHorizontal size={17} />
            <span className="sr-only">Ordenação</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recommended">Ordem da vitrine</option>
              <option value="name">Nome: A–Z</option>
            </select>
          </label>
        </div>
        <div
          className="category-tabs"
          role="group"
          aria-label="Filtrar por categoria"
        >
          {categories.map((c, i) => {
            const Icon = icons[i];
            return (
              <button
                key={c}
                aria-pressed={category === c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                <Icon size={17} />
                {c}
              </button>
            );
          })}
        </div>
      </section>
      <div className="catalog-section-title">
        <div>
          <h2>
            {category === "Todos"
              ? "Encontre seu próximo sistema"
              : `Sistemas de ${category.toLowerCase()}`}
          </h2>
          <p>
            {visible.length}{" "}
            {visible.length === 1
              ? "solução disponível"
              : "soluções disponíveis"}{" "}
            para o seu negócio
          </p>
        </div>
        <span className="curation">
          <Check size={16} /> Projetos aprovados na vitrine
        </span>
      </div>
      {loading ? <p role="status">Carregando sistemas…</p> : error ? <div role="alert"><p>{error}</p><button className="button button-secondary" onClick={() => void reload()}>Tentar novamente</button></div> : visible.length ? (
        <div className="project-grid">
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum sistema encontrado"
          description="Experimente outra palavra ou explore todas as categorias."
        >
          <button
            className="button button-secondary"
            onClick={() => {
              setSearch("");
              setCategory("Todos");
            }}
          >
            Limpar filtros
          </button>
        </EmptyState>
      )}
      <aside className="developer-callout">
        <div className="code-tile">
          <Code2 size={30} />
        </div>
        <div>
          <h2>Seu projeto pode fazer a diferença em um negócio real.</h2>
          <p>Coloque seu código no mundo. Encontre quem precisa dele.</p>
        </div>
        <Link className="button button-secondary" href="/dev/projetos/novo/">
          Quero publicar meu projeto <ArrowUpRight size={17} />
        </Link>
      </aside>
    </div>
  );
}
