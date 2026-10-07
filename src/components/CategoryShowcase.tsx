import { categoryIcon, type CountedOption } from "@/lib/catalogView";
import { cn } from "@/lib/utils";

export function CategoryShowcase({
  categories,
  brands,
  category,
  brand,
  onCategory,
  onBrand,
  allValue,
}: {
  categories: CountedOption[];
  brands: CountedOption[];
  category: string;
  brand: string;
  onCategory: (value: string) => void;
  onBrand: (value: string) => void;
  allValue: string;
}) {
  if (categories.length === 0 && brands.length === 0) return null;

  return (
    <div className="mb-6 space-y-5">
      {categories.length ? (
        <section>
          <header className="mb-2.5 flex items-center gap-3">
            <h2 className="label-eyebrow text-ink-600">Categorias</h2>
            <span className="h-px flex-1 bg-ink-100" />
          </header>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {categories.filter(c => !c.name.toUpperCase().includes("4X4") && !c.name.toUpperCase().includes("4 X 4")).map((item, index) => {
              const Icon = categoryIcon(item.name);
              const active = category === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => onCategory(active ? allValue : item.name)}
                  aria-pressed={active}
                  className={cn(
                    "card-surface enter-up group flex cursor-pointer items-center gap-3 p-3 text-left transition-all duration-200 hover:shadow-md",
                    active ? "border-gold-300 ring-1 ring-gold-200" : "hover:border-ink-200",
                  )}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                      active
                        ? "border-gold-300 bg-gold-50 text-gold-600"
                        : "border-ink-200 bg-white text-ink-400 hover:text-gold-500 hover:border-gold-200",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-sm font-semibold leading-tight text-ink-900">
                      {item.name}
                    </span>
                    <span className="block text-xs text-ink-400">
                      {item.count} {item.count === 1 ? "modelo" : "modelos"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {brands.length ? (
        <section>
          <header className="mb-2.5 flex items-center gap-3">
            <h2 className="label-eyebrow text-ink-600">Marcas</h2>
            <span className="h-px flex-1 bg-ink-100" />
          </header>
          <div className="scroll-x-clean -mx-4 px-4">
            <div className="flex w-max gap-2.5 pb-1">
              {brands.filter(b => !b.name.toUpperCase().includes("4X4") && !b.name.toUpperCase().includes("4 X 4")).map((item) => {
                const active = brand === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => onBrand(active ? allValue : item.name)}
                    aria-pressed={active}
                    className={cn(
                      "shrink-0 cursor-pointer rounded-xl px-4 py-2.5 text-center transition-all duration-200 border",
                      active
                        ? "bg-gold-500 text-white border-gold-500 shadow-sm"
                        : "bg-white border-ink-200 text-ink-700 hover:border-gold-300 hover:text-gold-600",
                    )}
                  >
                    <span className="block font-display text-sm font-semibold tracking-wide">
                      {item.name}
                    </span>
                    <span className={cn(
                      "block text-[0.68rem] uppercase tracking-[0.16em]",
                      active ? "text-white/80" : "text-ink-400",
                    )}>
                      {item.count} {item.count === 1 ? "máquina" : "máquinas"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
