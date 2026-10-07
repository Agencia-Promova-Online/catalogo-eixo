import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Scale, Search, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { MachineCard } from "@/components/MachineCard";
import { MachineCardSkeleton } from "@/components/MachineCardSkeleton";
import { CatalogHero } from "@/components/CatalogHero";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { MachineFinder } from "@/components/MachineFinder";
import { fetchCategories, fetchMachines, fetchSettings, matchesSearch } from "@/lib/catalog";
import { brandOptions, categoryIcon, groupByCategory } from "@/lib/catalogView";

export const Route = createFileRoute("/_authenticated/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo | Eixo-Catálogo" },
      {
        name: "description",
        content:
          "Catálogo comercial do time Eixo — SDRs e vendedores consultam especificações, valores, entradas e parcelas no atendimento.",
      },
      { property: "og:title", content: "Catálogo | Eixo-Catálogo" },
      {
        property: "og:description",
        content: "Consulta rápida de máquinas do catálogo Eixo para o time comercial.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatalogPage,
});

const ALL = "TODAS";

function CatalogPage() {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState(ALL);
  const [brand, setBrand] = useState(ALL);

  const machines = useQuery({ queryKey: ["machines"], queryFn: fetchMachines });
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const settings = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const all = machines.data ?? [];


  const visible = useMemo(
    () =>
      all.filter(
        (machine) =>
          matchesSearch(machine, term) &&
          (category === ALL || machine.category === category) &&
          (brand === ALL || machine.brand === brand),
      ),
    [all, term, category, brand],
  );

  /** Categorias ativas presentes no catálogo — usadas pelas seções visuais e pela pesquisa. */
  const categoryCards = useMemo(() => {
    const names = (categories.data ?? []).filter((row) => row.active).map((row) => row.name);
    return names
      .map((name) => ({
        name,
        count: all.filter((machine) => machine.category === name).length,
      }))
      .filter((item) => item.count > 0);
  }, [categories.data, all]);

  const grouped = useMemo(() => groupByCategory(visible), [visible]);
  const showGroups = category === ALL && !term.trim() && grouped.length > 1;
  const hasFilters = term.trim() !== "" || category !== ALL || brand !== ALL;

  function clearFilters() {
    setTerm("");
    setCategory(ALL);
    setBrand(ALL);
  }

  return (
    <div className="app-surface min-h-screen">
      <AppHeader companyName={settings.data?.company_name} />

      <div className="glass sticky top-[57px] z-20 rounded-none border-x-0 border-t-0 shadow-none sm:top-[65px]">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Pesquisar máquina, marca ou modelo..."
              aria-label="Pesquisar máquina, marca ou modelo"
              className="h-12 rounded-full border-border/80 bg-card pl-11 pr-11 text-base transition-shadow focus-visible:ring-2 focus-visible:ring-accent/60"
            />
            {term ? (
              <button
                type="button"
                onClick={() => setTerm("")}
                aria-label="Limpar pesquisa"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <CatalogHero machines={all} />

        <div className="enter-up mb-6 flex flex-wrap gap-2.5">
          <MachineFinder machines={all} />
          <Button asChild variant="secondary" size="lg" className="rounded-full">
            <Link to="/comparar">
              <Scale className="size-4" /> COMPARAR MÁQUINAS
            </Link>
          </Button>
        </div>

        <CategoryShowcase
          categories={categoryCards}
          brands={brandOptions(all)}
          category={category}
          brand={brand}
          onCategory={setCategory}
          onBrand={setBrand}
          allValue={ALL}
        />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="label-eyebrow">
            {visible.length} {visible.length === 1 ? "máquina encontrada" : "máquinas encontradas"}
          </p>
          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-4" /> LIMPAR FILTROS
            </Button>
          ) : null}
        </div>

        {machines.isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <MachineCardSkeleton key={index} index={index} />
            ))}
          </div>
        ) : machines.error ? (
          <EmptyState
            icon="⚠️"
            title="Não foi possível carregar o catálogo"
            description="Atualize a página para tentar novamente."
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title="Nenhuma máquina encontrada"
            description="Experimente pesquisar outro modelo ou marca."
            action={
              hasFilters ? (
                <Button variant="accent" size="lg" onClick={clearFilters}>
                  LIMPAR FILTROS
                </Button>
              ) : null
            }
          />
        ) : showGroups ? (
          <div className="space-y-8">
            {grouped.map((group) => {
              const Icon = categoryIcon(group.category);
              return (
                <section key={group.category} className="enter-soft">
                  <header className="mb-3 flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <h2 className="font-display text-xl font-bold uppercase tracking-wide">
                      {group.category}
                    </h2>
                    <span className="h-px flex-1 bg-border" />
                    <span className="label-eyebrow">
                      {group.items.length} {group.items.length === 1 ? "modelo" : "modelos"}
                    </span>
                  </header>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.items.map((machine, index) => (
                      <MachineCard
                        key={machine.id}
                        machine={machine}
                        index={index}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div
            key={`${category}-${brand}-${term}`}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {visible.map((machine, index) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                index={index}
              />
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
