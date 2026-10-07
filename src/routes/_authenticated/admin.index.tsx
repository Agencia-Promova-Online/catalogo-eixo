import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  FolderTree,
  ImageOff,
  Plus,
  Sparkles,
  Tags,
  Tractor,
  Images,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { MachineMedia } from "@/components/MachineMedia";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import {
  fetchAllImages,
  fetchCategories,
  fetchMachines,
  machineTitle,
  publicImageUrl,
  type Machine,
} from "@/lib/catalog";
import { brandOptions, categoryIcon } from "@/lib/catalogView";
import { formatBRL, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo | Eixo-Catálogo" },
      {
        name: "description",
        content: "Visão geral do catálogo: máquinas cadastradas, categorias, marcas e indicadores do time comercial.",
      },
      { property: "og:title", content: "Painel Administrativo | Eixo-Catálogo" },
      { property: "og:description", content: "Resumo visual do catálogo interno Eixo." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminDashboard,
});

const SPEC_FIELDS = [
  "power",
  "operating_weight",
  "engine",
  "transmission",
  "hydraulic_system",
  "hydraulic_flow",
  "hydraulic_pressure",
  "dimensions",
  "tank_capacity",
  "bucket_capacity",
  "max_reach",
  "dump_height",
  "max_digging_depth",
  "digging_force",
] as const;

const PENDING = new Set(["", "não informado", "nao informado", "não confirmado", "nao confirmado", "n/a", "null"]);

function isFilled(value: unknown): boolean {
  if (typeof value !== "string") return value != null;
  return !PENDING.has(value.trim().toLowerCase());
}

function pendingFields(machine: Machine): number {
  return SPEC_FIELDS.filter((field) => !isFilled(machine[field])).length;
}

function AdminDashboard() {
  const machines = useQuery({ queryKey: ["machines"], queryFn: fetchMachines });
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const images = useQuery({ queryKey: ["all-images"], queryFn: fetchAllImages });

  const all = machines.data ?? [];
  const brands = brandOptions(all);
  const usedCategories = [...new Set(all.map((machine) => machine.category))];

  const withMedia = new Set((images.data ?? []).map((image) => image.machine_id));
  const withoutMedia = all.filter((machine) => !withMedia.has(machine.id));
  const complete = all.filter((machine) => pendingFields(machine) === 0);
  const pendingTotal = all.reduce((total, machine) => total + pendingFields(machine), 0);
  const totalPhotos = images.data?.length ?? 0;

  const byCategory = usedCategories
    .map((name) => ({ name, count: all.filter((machine) => machine.category === name).length }))
    .sort((a, b) => b.count - a.count);

  const recent = [...all]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const max = Math.max(1, ...byCategory.map((row) => row.count), ...brands.map((row) => row.count));

  if (machines.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="skeleton-shimmer h-64 rounded-2xl" />
          <div className="skeleton-shimmer h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="label-eyebrow text-primary">Eixo-Catálogo</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight leading-tight text-ink-900">Visão geral</h2>
          <p className="mt-1 text-sm text-ink-400">
            Indicadores em tempo real do catálogo interno de máquinas.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="primary" size="lg">
            <Link to="/admin/maquinas/$id" params={{ id: "nova" }}>
              <Plus className="size-4" /> <span className="hidden sm:inline">Nova máquina</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Tractor className="w-5 h-5" />}
          label="Total de máquinas"
          value={all.length}
          color="gold"
        />
        <StatCard
          icon={<Tags className="w-5 h-5" />}
          label="Marcas"
          value={brands.length}
          color="ink"
        />
        <StatCard
          icon={<FolderTree className="w-5 h-5" />}
          label="Categorias"
          value={usedCategories.length}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Fichas completas"
          value={complete.length}
          color="green"
        />
        <StatCard
          icon={<Images className="w-5 h-5" />}
          label="Fotos cadastradas"
          value={totalPhotos}
          color="gold"
        />
        <StatCard
          icon={<ImageOff className="w-5 h-5" />}
          label="Máquinas sem fotos"
          value={withoutMedia.length}
          color="red"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Pendências técnicas"
          value={pendingTotal}
          color="red"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarPanel
          title="Máquinas por categoria"
          rows={byCategory.map((row) => ({ ...row, icon: categoryIcon(row.name) }))}
          max={max}
        />
        <BarPanel title="Máquinas por marca" rows={brands} max={max} color="blue" />
      </div>

      {withoutMedia.length > 0 ? (
        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex w-11 h-11 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-ink-100 text-ink-500">
              <ImageOff className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-semibold text-ink-900">Máquinas sem foto real cadastrada</h3>
              <p className="mt-1 text-sm text-ink-400">
                Estas máquinas mostram um placeholder cinza no catálogo. Faça upload manual das
                fotos reais (webp comprimido) para ativar a visualização profissional.
              </p>
            </div>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {withoutMedia.map((machine) => (
              <li key={machine.id}>
                <Link
                  to="/admin/maquinas/$id"
                  params={{ id: machine.id }}
                  className="badge-base badge-active transition-transform hover:scale-[1.03]"
                >
                  <Sparkles className="size-3" aria-hidden /> {machineTitle(machine)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="card-surface p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-ink-900">Últimos cadastros</h3>
          <Link
            to="/admin/maquinas"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todas →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="Nenhuma máquina cadastrada ainda." description="Comece criando a primeira ficha de máquina." />
          </div>
        ) : (
          <ul className="mt-5 space-y-2.5">
            {recent.map((machine) => (
              <li key={machine.id}>
                <Link
                  to="/admin/maquinas/$id"
                  params={{ id: machine.id }}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-ink-100 bg-white p-3 transition-all hover:border-ink-200 hover:shadow-sm"
                >
                  <MachineMedia
                    src={publicImageUrl(machine.main_photo ?? null)}
                    alt={machineTitle(machine)}
                    className="size-14 shrink-0 rounded-xl"
                    showControl={false}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-ink-900">
                      {machineTitle(machine)}
                    </p>
                    <p className="truncate text-sm text-ink-400">
                      {machine.category} · {formatDate(machine.created_at)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-base font-semibold text-primary">{formatBRL(machine.price)}</p>
                    <StatusBadge status={machine.status} className="mt-1.5 float-right" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function BarPanel({
  title,
  rows,
  max,
  color = "gold",
}: {
  title: string;
  rows: { name: string; count: number; icon?: LucideIcon }[];
  max: number;
  color?: "gold" | "blue" | "green" | "ink";
}) {
  const barColor = color === "blue" ? "bg-blue-500" : color === "green" ? "bg-green-500" : color === "ink" ? "bg-ink-400" : "bg-gold-500";
  const iconColor = color === "blue" ? "text-blue-600" : color === "green" ? "text-green-600" : color === "ink" ? "text-ink-500" : "text-gold-600";

  return (
    <section className="card-surface p-5 sm:p-6">
      <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Dados insuficientes para exibição." />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map((row) => (
            <li key={row.name}>
              <Link
                to="/admin/maquinas"
                search={{ q: row.name }}
                className="block rounded-xl px-2 py-1 transition-colors hover:bg-ink-50"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 truncate text-sm font-medium text-ink-700">
                    {row.icon ? <row.icon className={`size-4 shrink-0 ${iconColor}`} aria-hidden /> : null}
                    <span className="truncate">{row.name}</span>
                  </span>
                  <span className="font-display text-base font-semibold text-ink-900">{row.count}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ${barColor}`}
                    style={{ width: `${Math.round((row.count / max) * 100)}%` }}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
