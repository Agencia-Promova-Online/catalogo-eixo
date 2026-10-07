import { cn } from "@/lib/utils";

export type Role = "admin" | "seller";

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  const cls = role === "admin" ? "badge-admin" : "badge-seller";
  const label = role === "admin" ? "Administrador" : "Vendedor";
  return (
    <span className={cn("badge-base", cls, className)}>
      {label}
    </span>
  );
}
