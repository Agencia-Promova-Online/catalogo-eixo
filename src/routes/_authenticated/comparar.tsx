import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Scale, X } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { PhotoFrame } from "@/components/PhotoFrame";
import { FactoryNewBadge } from "@/components/FactoryNewBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchMachines, fetchSettings, machineTitle, matchesSearch, publicImageUrl, type Machine } from "@/lib/catalog";
import { machineApplications, machineSpecs } from "@/lib/machineSpecs";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/comparar")({
  head: () => ({
    meta: [
      { title: "Comparar Máquinas | Eixo-Catálogo" },
      {
        name: "description",
        content:
          "Compare até três máquinas do catálogo lado a lado: valor, entrada, parcela, especificações e aplicações.",
      },
      { property: "og:title", content: "Comparar Máquinas | Eixo-Catálogo" },
      {
        property: "og:description",
        content: "Comparação visual de valores e especificações das máquinas do catálogo Eixo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComparePage,
});

const NA = "Não informado";
const MAX = 3;

function ComparePage() {
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const machines = useQuery({ queryKey: ["machines"], queryFn: fetchMachines });
  const settings = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  const all = machines.data ?? [];
  const options = useMemo(() => all.filter((machine) => matchesSearch(machine, term)), [all, term]);
  const chosen = useMemo(
    () => selected.map((id) => all.find((machine) => machine.id === id)).filter(Boolean) as Machine[],
    [selected, all],
  );

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= MAX
          ? current
          : [...current, id],
    );
  }

  const specLabels = useMemo(() => {
    const labels: string[] = [];
    for (const machine of chosen) {
      for (const spec of machineSpecs(machine, true)) {
        if (!labels.includes(spec.label)) labels.push(spec.label);
      }
    }
    return labels;
  }, [chosen]);

  const money: { label: string; read: (machine: Machine) => number | null; accent?: boolean }[] = [
    { label: "Valor", read: (machine) => machine.price, accent: true },
    { label: "Entrada", read: (machine) => machine.down_payment },
    { label: "Parcela", read: (machine) => machine.installment },
  ];

  return (
    <div className="app-surface min-h-screen">
      <AppHeader companyName={settings.data?.company_name} />

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5">
        <header className="enter-up">
          <p className="label-eyebrow text-primary">Eixo-Catálogo</p>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            <Scale className="size-7 text-accent" aria-hidden /> Comparar máquinas
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Selecione de 2 a 3 máquinas para comparar valores, especificações e aplicações. Todos os
            dados vêm do catálogo cadastrado.
          </p>
        </header>

        <section className="panel space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="label-eyebrow">
              {selected.length} de {MAX} selecionadas
            </p>
            {selected.length ? (
              <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                <X className="size-4" /> LIMPAR SELEÇÃO
              </Button>
            ) : null}
          </div>

          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Pesquisar marca, modelo ou categoria..."
            aria-label="Pesquisar máquinas para comparar"
            className="h-11 rounded-full bg-background/60"
          />

          <div className="scroll-x-clean -mx-1 max-h-64 overflow-y-auto px-1">
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {options.map((machine) => {
                const active = selected.includes(machine.id);
                const blocked = !active && selected.length >= MAX;
                return (
                  <li key={machine.id}>
                    <button
                      type="button"
                      onClick={() => toggle(machine.id)}
                      disabled={blocked}
                      aria-pressed={active}
                      className={cn(
                        "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-2 text-left transition-all",
                        active
                          ? "border-accent bg-accent/10"
                          : "border-border/70 bg-secondary/30 hover:border-accent/40",
                        blocked && "cursor-not-allowed opacity-45",
                      )}
                    >
                      <PhotoFrame
                        src={publicImageUrl(machine.main_photo ?? null)}
                        alt={machineTitle(machine)}
                        className="size-11 shrink-0 rounded-lg"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-display text-sm font-bold uppercase">
                          {machineTitle(machine)}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {machine.category}
                        </span>
                      </span>
                      {active ? <Check className="size-4 shrink-0 text-accent" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {chosen.length < 2 ? (
          <EmptyState
            icon="⚖️"
            title="Selecione pelo menos duas máquinas"
            description="A comparação aparece automaticamente após a segunda seleção."
          />
        ) : (
          <section className="-mx-4 mt-6 w-[calc(100%+2rem)] px-4 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 lg:-mx-8 lg:w-[calc(100%+4rem)] lg:px-8">
            {/* Mobile: scroll horizontal entre os cards */}
            {/* Desktop ≥ md: grid 2/3 colunas lado-a-lado, 100% largura, altura DINÂMICA */}
            <div
              className={cn(
                "scroll-x-clean grid grid-flow-col auto-cols-[85vw] gap-4 overflow-x-auto snap-x snap-mandatory pb-3",
                "md:grid-flow-row md:gap-5 md:overflow-visible md:pb-0",
                chosen.length === 2
                  ? "md:grid-cols-2 md:auto-cols-fr"
                  : "md:grid-cols-3 md:auto-cols-fr",
              )}
            >
              {chosen.map((machine, index) => (
                <article
                  key={machine.id}
                  className="glass enter-up snap-start flex w-full flex-col overflow-hidden rounded-[1.4rem]"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <PhotoFrame
                    src={publicImageUrl(machine.main_photo ?? null)}
                    alt={machineTitle(machine)}
                    className="aspect-[16/11] w-full rounded-none"
                  />

                  {/* Altura 100% DINÂMICA: o conteúdo decide o tamanho */}
                  <div className="flex flex-col gap-3 p-4">
                    <div className="min-w-0">
                      <p className="label-eyebrow text-accent">{machine.brand}</p>
                      <h2 className="truncate font-display text-xl font-extrabold uppercase">
                        {machineTitle(machine)}
                      </h2>
                      <p className="mt-0.5 truncate text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {machine.category}
                      </p>
                      <FactoryNewBadge className="mt-2" />
                    </div>

                    <dl className="space-y-2">
                      {money.map((row) => (
                        <div
                          key={row.label}
                          className={cn(
                            "rounded-xl px-3 py-2",
                            row.accent ? "money-strip" : "border border-border/70 bg-secondary/35",
                          )}
                        >
                          <dt className="label-eyebrow">{row.label}</dt>
                          <dd
                            className={cn(
                              "font-display font-extrabold leading-none",
                              row.accent ? "text-3xl text-accent" : "text-lg",
                            )}
                          >
                            {row.read(machine) === null ? NA : formatBRL(row.read(machine))}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div>
                      <p className="label-eyebrow mb-1">Especificações</p>
                      <dl className="space-y-1.5">
                        {specLabels.map((label) => {
                          const spec = machineSpecs(machine, true).find((item) => item.label === label);
                          return (
                            <div
                              key={label}
                              className="flex items-baseline justify-between gap-2 border-b border-border/50 pb-1"
                            >
                              <dt className="truncate text-xs text-muted-foreground">{label}</dt>
                              <dd className={cn(
                                "shrink-0 text-xs font-semibold",
                                spec?.value === "Informação técnica em atualização." && "text-amber-500 italic font-medium"
                              )}>
                                {spec?.value?.trim() ? (spec.value === "Informação técnica em atualização." ? "Em validação" : spec.value) : NA}
                              </dd>
                            </div>
                          );
                        })}
                      </dl>
                    </div>

                    <div>
                      <p className="label-eyebrow mb-1.5">Principais aplicações</p>
                      <ul className="flex flex-wrap gap-1.5">
                        {machineApplications(machine).map((item) => (
                          <li
                            key={item}
                            className="rounded-full border border-border/70 bg-secondary/40 px-2.5 py-1 text-[0.68rem] text-muted-foreground"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-1">
                      <Button asChild variant="secondary" size="lg" className="w-full rounded-xl">
                        <Link to="/maquina/$id" params={{ id: machine.id }}>
                          VER DETALHES <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

    </div>
  );
}
