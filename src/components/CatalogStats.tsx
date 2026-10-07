import { STATUS_META, type Machine } from "@/lib/catalog";

/** Compact panel with catalog totals — kept lightweight for mobile use. */
export function CatalogStats({ machines }: { machines: Machine[] }) {
  const total = machines.length;
  const count = (status: string) => machines.filter((m) => m.status === status).length;

  const byCategory = machines.reduce<Record<string, number>>((acc, machine) => {
    acc[machine.category] = (acc[machine.category] ?? 0) + 1;
    return acc;
  }, {});

  const cards = [
    { label: "Total", value: total, dot: "bg-foreground" },
    { label: STATUS_META.disponivel.label, value: count("disponivel"), dot: STATUS_META.disponivel.color },
    { label: STATUS_META.negociacao.label, value: count("negociacao"), dot: STATUS_META.negociacao.color },
    { label: STATUS_META.vendida.label, value: count("vendida"), dot: STATUS_META.vendida.color },
  ];

  return (
    <section aria-label="Resumo do catálogo" className="mb-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-card px-3 py-2 shadow-card">
            <p className="flex items-center gap-1.5 label-eyebrow">
              <span className={`size-2 shrink-0 rounded-full ${card.dot}`} aria-hidden />
              <span className="truncate">{card.label}</span>
            </p>
            <p className="font-display text-2xl font-extrabold leading-tight">{card.value}</p>
          </div>
        ))}
      </div>

      {Object.keys(byCategory).length ? (
        <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
          {Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => (
              <span
                key={name}
                className="shrink-0 rounded-full border bg-secondary px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-wide text-secondary-foreground"
              >
                {name} · {value}
              </span>
            ))}
        </div>
      ) : null}
    </section>
  );
}
