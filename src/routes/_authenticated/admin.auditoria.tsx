import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  Pencil,
  FileSearch,
  CheckCircle,
  HelpCircle,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { fetchMachines, VALIDATION_STATUS_META, type Machine } from "@/lib/catalog";
import { formatBRL, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/auditoria")({
  head: () => ({
    meta: [
      { title: "Validação Técnica | Eixo-Catálogo" },
      {
        name: "description",
        content: "Validação técnica das especificações das máquinas do catálogo Eixo.",
      },
      { property: "og:locale", content: "pt_BR" },
    ],
  }),
  component: TechnicalValidationPage,
});

function TechnicalValidationPage() {
  const machinesQuery = useQuery({ queryKey: ["machines"], queryFn: fetchMachines });
  const machines = machinesQuery.data ?? [];

  const stats = {
    total: machines.length,
    validated: machines.filter(m => 
      m.status_power === 'confirmed' && 
      m.status_operating_weight === 'confirmed' &&
      m.power !== 'Não confirmado' &&
      m.operating_weight !== 'Não confirmado'
    ).length,
    withIssues: machines.filter(m => 
      [m.status_power, m.status_operating_weight, m.status_engine, m.status_transmission].some(s => s === 'review')
    ).length,
    notConfirmed: machines.filter(m => 
      [m.status_power, m.status_operating_weight, m.status_engine, m.status_transmission].some(s => s === 'not_confirmed') ||
      [m.power, m.operating_weight, m.max_digging_depth, m.bucket_capacity, m.engine, m.transmission].some(v => v === 'Não confirmado' || v === null || v === '')
    ).length
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase">Validação Técnica</h2>
          <p className="text-sm text-muted-foreground">
            Auditoria de precisão das especificações técnicas do catálogo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/historico">VER LOG DE ALTERAÇÕES</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de Máquinas" value={stats.total} icon={FileSearch} />
        <StatCard label="Máquinas Validadas" value={stats.validated} icon={CheckCircle} color="text-green-500" />
        <StatCard label="Com Divergência" value={stats.withIssues} icon={AlertTriangle} color="text-amber-500" />
        <StatCard label="Não Confirmadas" value={stats.notConfirmed} icon={XCircle} color="text-red-500" />
      </section>

      {machinesQuery.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton-shimmer h-32 rounded-2xl" />)}
        </div>
      ) : machines.length === 0 ? (
        <EmptyState title="Nenhuma máquina cadastrada" description="O catálogo está vazio." />
      ) : (
        <div className="space-y-4">
          {machines.map((machine) => (
            <ValidationRow key={machine.id} machine={machine} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color?: string }) {
  return (
    <div className="panel p-4 flex items-center gap-4">
      <div className={cn("rounded-xl p-2 bg-secondary/50", color)}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}

function ValidationRow({ machine }: { machine: Machine }) {
  const specs = [
    { label: "Potência", value: machine.power, status: machine.status_power },
    { label: "Peso Operacional", value: machine.operating_weight, status: machine.status_operating_weight },
    { label: "Profundidade de Escavação", value: machine.max_digging_depth, status: machine.status_max_digging_depth },
    { label: "Capacidade Caçamba", value: machine.bucket_capacity, status: machine.status_bucket_capacity },
    { label: "Motor", value: machine.engine, status: machine.status_engine },
    { label: "Transmissão", value: machine.transmission, status: machine.status_transmission },
  ];

  const hasIssues = specs.some(s => s.status === 'review');
  const allConfirmed = specs.every(s => s.status === 'confirmed');

  return (
    <article className={cn(
      "panel overflow-hidden border-l-4 transition-all hover:border-accent/40",
      allConfirmed ? "border-l-green-500" : hasIssues ? "border-l-amber-500" : "border-l-red-500"
    )}>
      <div className="flex flex-col md:flex-row md:items-start gap-6 p-5">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-eyebrow text-accent">{machine.brand}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-secondary uppercase">{machine.category}</span>
          </div>
          <h3 className="font-display text-xl font-bold uppercase tracking-tight">{machine.display_name}</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 pt-2">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Versão / Configuração</p>
              <p className="text-sm font-semibold">{machine.version_config || "VERSÃO NÃO IDENTIFICADA"}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Fonte Técnica</p>
              <p className="text-sm truncate">{machine.technical_source || "Não informada"}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Última Validação</p>
              <p className="text-sm">{machine.technical_last_validated_at ? formatDate(machine.technical_last_validated_at) : "Pendente"}</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button asChild variant="accent" size="sm">
            <Link to="/admin/maquinas/$id" params={{ id: machine.id }}>
              <Pencil className="size-4" /> EDITAR E VALIDAR
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-secondary/20 px-5 py-4 border-t border-white/5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Status das Especificações</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {specs.map((spec) => (
            <div key={spec.label} className="flex items-center justify-between gap-4 p-2 rounded-lg bg-secondary/30 border border-white/5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground truncate">{spec.label}</p>
                <p className={cn(
                  "text-sm font-semibold truncate",
                  (spec.value === "Não confirmado" || !spec.value) && "text-amber-500 italic"
                )}>{spec.value || "Pendente"}</p>
              </div>
              <StatusChip status={spec.status || 'not_confirmed'} />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function StatusChip({ status }: { status: "confirmed" | "review" | "not_confirmed" }) {
  const meta = VALIDATION_STATUS_META[status];
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0",
      status === 'confirmed' ? "bg-green-500/10 text-green-500" :
      status === 'review' ? "bg-amber-500/10 text-amber-500" :
      "bg-red-500/10 text-red-500"
    )}>
      <span className="text-xs">{meta.icon}</span>
      {meta.label}
    </div>
  );
}
