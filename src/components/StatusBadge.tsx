import { STATUS_META, type MachineStatus } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = STATUS_META[(status as MachineStatus) in STATUS_META ? (status as MachineStatus) : "indisponivel"];
  const variantClass = meta.label.toLowerCase().includes("dispon") || meta.label.toLowerCase().includes("ativa")
    ? "badge-active"
    : meta.label.toLowerCase().includes("em negociac") || meta.label.toLowerCase().includes("reservad")
    ? "badge-sent"
    : "badge-inactive";

  return (
    <span className={cn("badge-base", variantClass, className)}>
      <span
        className={cn(
          "size-1.5 rounded-full",
          meta.label.toLowerCase().includes("dispon") || meta.label.toLowerCase().includes("ativa")
            ? "bg-green-500"
            : meta.label.toLowerCase().includes("em negociac") || meta.label.toLowerCase().includes("reservad")
            ? "bg-blue-500"
            : "bg-ink-400",
        )}
        aria-hidden
      />
      {meta.label}
    </span>
  );
}
