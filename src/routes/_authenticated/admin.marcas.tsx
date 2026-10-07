import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchMachines } from "@/lib/catalog";
import { brandOptions } from "@/lib/catalogView";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_authenticated/admin/marcas")({
  head: () => ({
    meta: [
      { title: "Marcas | Eixo-Catálogo" },
      {
        name: "description",
        content: "Marcas presentes no catálogo Eixo e quantidade de máquinas de cada fabricante.",
      },
      { property: "og:title", content: "Marcas | Eixo-Catálogo" },
      { property: "og:description", content: "Visão das marcas cadastradas no catálogo." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminBrands,
});

function AdminBrands() {
  const machines = useQuery({ queryKey: ["machines"], queryFn: fetchMachines });
  const brands = brandOptions(machines.data ?? []);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase">Marcas</h2>
        <p className="text-sm text-muted-foreground">
          Marcas identificadas a partir das máquinas cadastradas. A marca é definida no cadastro de cada
          máquina.
        </p>
      </div>

      {machines.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer h-28 rounded-xl" />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="Nenhuma marca cadastrada"
          description="Cadastre máquinas para que as marcas apareçam aqui."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand, index) => {
            const models = (machines.data ?? [])
              .filter((machine) => machine.brand === brand.name)
              .map((machine) => machine.model);
            return (
              <div
                key={brand.name}
                className="enter-up panel p-4 transition-colors hover:border-accent/40"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="truncate font-display text-xl font-bold uppercase">{brand.name}</h3>
                  <span className="font-display text-2xl font-extrabold text-accent">{brand.count}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {models.join(" · ")}
                </p>
                <Link
                  to="/admin/maquinas"
                  className="mt-3 inline-block font-display text-xs font-semibold uppercase tracking-[0.16em] text-accent hover:underline"
                >
                  Ver máquinas
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
