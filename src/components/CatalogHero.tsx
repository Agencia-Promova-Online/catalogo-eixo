import { Tractor } from "lucide-react";
import { publicImageUrl, type Machine } from "@/lib/catalog";

export function CatalogHero({ machines }: { machines: Machine[] }) {
  const showcase = machines
    .map((machine) => machine.main_photo)
    .filter((photo): photo is NonNullable<Machine["main_photo"]> => Boolean(photo && photo.storage_path))
    .slice(0, 3);

  return (
    <section className="enter-up mb-6 card-surface overflow-hidden">
      <div className="grid items-center gap-5 p-5 sm:p-7 lg:grid-cols-[1.1fr_1fr]">
        <div className="min-w-0">
          <p className="label-eyebrow text-primary">Eixo-Catálogo</p>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Catálogo de <span className="text-primary">Máquinas</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ink-400 sm:text-base">
            Consulta rápida para SDRs e vendedores do time Eixo — modelos, especificações, valores,
            entradas e parcelas durante o atendimento.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-1 w-24 rounded-full bg-primary opacity-80" />
            <span className="badge-base badge-active">Atualizado em tempo real</span>
          </div>
        </div>

        {showcase.length ? (
          <div className="grid grid-cols-3 gap-2">
            {showcase.map((photo, index) => {
              const src = publicImageUrl(photo);
              return (
                <div
                  key={photo.id}
                  className="enter-up overflow-hidden rounded-xl border border-ink-100 bg-ink-100"
                  style={{ animationDelay: `${120 + index * 90}ms` }}
                >
                  {src ? (
                    <img
                      src={src}
                      alt="Foto real de máquina do catálogo"
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center text-ink-300">
                      <Tractor className="size-8" aria-hidden />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="enter-up overflow-hidden rounded-xl border border-ink-100 bg-ink-100 aspect-square flex items-center justify-center text-ink-300"
                style={{ animationDelay: `${120 + i * 90}ms` }}
              >
                <Tractor className="size-10" aria-hidden strokeWidth={1.25} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
