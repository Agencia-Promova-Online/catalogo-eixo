import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Selo global do catálogo: todas as máquinas são novas de fábrica. */
export function FactoryNewBadge({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-accent/45 bg-accent/12 font-display font-semibold uppercase tracking-[0.16em] text-accent backdrop-blur",
        size === "sm" ? "px-2.5 py-1 text-[0.62rem]" : "px-3 py-1.5 text-xs",
        className,
      )}
    >
      <BadgeCheck className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden />
      Nova de fábrica
    </span>
  );
}
