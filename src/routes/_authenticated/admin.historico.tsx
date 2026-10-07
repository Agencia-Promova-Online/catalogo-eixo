import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchChangeLog } from "@/lib/catalog";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/historico")({
  head: () => ({
    meta: [
      { title: "Histórico | Eixo-Catálogo" },
      {
        name: "description",
        content: "Auditoria de mudanças de valor, entrada, parcela e status das máquinas do catálogo Eixo.",
      },
      { property: "og:title", content: "Histórico do Catálogo | Eixo-Catálogo" },
      {
        property: "og:description",
        content: "Registro completo das alterações comerciais do catálogo.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminHistory,
});

const FIELD_LABELS: Record<string, string> = {
  price: "💰 Valor",
  down_payment: "💳 Entrada",
  installment: "📆 Parcela",
  status: "Status",
};

function AdminHistory() {
  const log = useQuery({ queryKey: ["change-log"], queryFn: fetchChangeLog });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase">Histórico de alterações</h2>
        <p className="text-sm text-muted-foreground">
          Toda mudança de valor, entrada, parcela ou status é registrada automaticamente.
        </p>
      </div>

      {log.isLoading ? (
        <p className="py-12 text-center text-muted-foreground">Carregando histórico...</p>
      ) : (log.data ?? []).length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">Nenhuma alteração registrada ainda.</p>
      ) : (
        <ul className="space-y-2">
          {(log.data ?? []).map((entry) => (
            <li key={entry.id} className="rounded-xl border bg-card p-3 shadow-card">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display font-bold uppercase">{entry.machine_label}</p>
                <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
              </div>
              <p className="mt-1 text-sm">
                <span className="label-eyebrow">{FIELD_LABELS[entry.field] ?? entry.field}</span>{" "}
                <span className="text-muted-foreground line-through">{entry.old_value ?? "—"}</span>{" "}
                <span aria-hidden>→</span>{" "}
                <span className="font-semibold">{entry.new_value ?? "—"}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
