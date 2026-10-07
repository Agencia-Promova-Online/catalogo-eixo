import { cn } from "@/lib/utils";

export type Chip = { value: string; label: string; count?: number };

/** Chips horizontais com rolagem suave — usados para marcas e categorias. */
export function FilterChips({
  chips,
  value,
  onChange,
  ariaLabel,
}: {
  chips: Chip[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="-mx-4 scroll-x-clean px-4" role="group" aria-label={ariaLabel}>
      <div className="flex w-max gap-2 pb-1">
        {chips.map((chip) => {
          const active = chip.value === value;
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => onChange(chip.value)}
              aria-pressed={active}
              className={cn(
                "shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200 active:scale-[0.97]",
                active
                  ? "border-accent bg-accent text-accent-foreground shadow-accent"
                  : "border-border bg-secondary/50 text-muted-foreground hover:border-accent/40 hover:text-foreground",
              )}
            >
              {chip.label}
              {typeof chip.count === "number" ? (
                <span className={cn("ml-1.5", active ? "opacity-70" : "opacity-60")}>{chip.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
