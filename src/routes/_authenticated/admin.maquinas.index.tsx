import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { PhotoFrame } from "@/components/PhotoFrame";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllImages, fetchMachines, machineTitle, matchesSearch, publicImageUrl, type Machine, type MachineImage } from "@/lib/catalog";
import { formatBRL, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/maquinas/")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" && search["q"] ? { q: search["q"] } : {},
  head: () => ({
    meta: [
      { title: "Máquinas | Eixo-Catálogo" },
      {
        name: "description",
        content: "Cadastro, edição e exclusão das máquinas do catálogo comercial Eixo.",
      },
      { property: "og:title", content: "Máquinas | Eixo-Catálogo" },
      { property: "og:description", content: "Gestão completa do catálogo de máquinas do time comercial." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminMachines,
});

function AdminMachines() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const machines = useQuery({ queryKey: ["machines"], queryFn: fetchMachines });
  const allImages = useQuery({ queryKey: ["all-images"], queryFn: fetchAllImages, staleTime: 30_000 });
  const search = Route.useSearch();
  const [term, setTerm] = useState(search.q ?? "");
  const [target, setTarget] = useState<Machine | null>(null);

  // Lookup rápido de imagem por máquina, garante SEMPRE usar a FOTO REAL PRINCIPAL,
  // mesmo se o join do fetchMachines tiver vindo desatualizado.
  const photoByMachine = useMemo(() => {
    const byId = new Map<string, MachineImage[]>();
    for (const img of allImages.data ?? []) {
      const list = byId.get(img.machine_id) ?? [];
      list.push(img);
      byId.set(img.machine_id, list);
    }
    const bestByMachine = new Map<string, string | null>();
    for (const [machineId, list] of byId.entries()) {
      const best =
        list.find((i) => i.is_main === true && i.ai_generated === false) ??
        list.find((i) => i.is_main === true) ??
        list.find((i) => i.ai_generated === false) ??
        list[0] ??
        null;
      bestByMachine.set(machineId, best ? publicImageUrl(best) ?? null : null);
    }
    return bestByMachine;
  }, [allImages.data]);

  function thumbnailUrl(machine: Machine): string | null {
    const direct = publicImageUrl(machine.main_photo ?? null);
    if (direct) return direct;
    return photoByMachine.get(machine.id) ?? null;
  }

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("machines").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Máquina excluída.");
      queryClient.invalidateQueries({ queryKey: ["machines"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const visible = useMemo(
    () => (machines.data ?? []).filter((machine) => matchesSearch(machine, term)),
    [machines.data, term],
  );

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold uppercase">Máquinas</h2>
          <p className="text-sm text-muted-foreground">
            {machines.data?.length ?? 0} registros no catálogo
          </p>
        </div>
        <Button
          size="lg"
          variant="accent"
          onClick={() => navigate({ to: "/admin/maquinas/$id", params: { id: "nova" } })}
        >
          <Plus className="size-4" /> <span className="hidden sm:inline">NOVA MÁQUINA</span>
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Filtrar por marca, modelo ou categoria..."
          aria-label="Filtrar máquinas"
          className="h-11 rounded-full bg-card pl-10"
        />
      </div>

      {machines.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer h-24 rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title="Nenhuma máquina encontrada"
          description="Ajuste o filtro ou cadastre uma nova máquina."
        />
      ) : (
        <div className="space-y-2">
          {visible.map((machine, index) => (
            <div
              key={machine.id}
              className="enter-up grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border bg-card p-3 shadow-card transition-colors hover:border-accent/40 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
              style={{ animationDelay: `${Math.min(index, 10) * 35}ms` }}
            >
              <PhotoFrame
                src={thumbnailUrl(machine)}
                alt={machineTitle(machine)}
                className="size-16 shrink-0 rounded-lg sm:size-20"
              />

              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="label-eyebrow text-accent">{machine.brand}</p>
                  <StatusBadge status={machine.status} />
                </div>
                <h3 className="truncate font-display text-lg font-bold uppercase leading-tight">
                  {machineTitle(machine)}
                </h3>
                <p className="truncate text-xs text-muted-foreground">
                  {machine.code ? `#${machine.code} · ` : ""}
                  {machine.category} · atualizado em {formatDate(machine.updated_at)}
                </p>
                <p className="mt-1 flex flex-wrap gap-x-3 text-xs">
                  <span className="font-display text-base font-bold text-accent">
                    {formatBRL(machine.price)}
                  </span>
                  <span className="text-muted-foreground">
                    Entrada {formatBRL(machine.down_payment)}
                  </span>
                  <span className="text-muted-foreground">
                    Parcela {formatBRL(machine.installment)}
                  </span>
                </p>
              </div>

              <div className="col-span-2 flex shrink-0 gap-2 sm:col-span-1">
                <Button asChild variant="secondary" size="sm">
                  <Link to="/maquina/$id" params={{ id: machine.id }}>
                    <Eye className="size-4" />
                    <span className="hidden sm:inline">VER</span>
                  </Link>
                </Button>
                <Button asChild variant="accent" size="sm">
                  <Link to="/admin/maquinas/$id" params={{ id: machine.id }}>
                    <Pencil className="size-4" />
                    <span className="hidden sm:inline">EDITAR</span>
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setTarget(machine)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir máquina?</AlertDialogTitle>
            <AlertDialogDescription>
              {target ? machineTitle(target) : ""} será removida do catálogo. Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>CANCELAR</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (target) remove.mutate(target.id);
                setTarget(null);
              }}
            >
              EXCLUIR
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
