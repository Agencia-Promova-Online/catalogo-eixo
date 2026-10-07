import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatColor = "gold" | "blue" | "green" | "ink" | "red";

const COLOR_MAP: Record<StatColor, { iconBg: string; iconBorder: string; iconText: string }> = {
  gold: {
    iconBg: "bg-gold-50",
    iconBorder: "border-gold-200",
    iconText: "text-gold-600",
  },
  blue: {
    iconBg: "bg-blue-50",
    iconBorder: "border-blue-200",
    iconText: "text-blue-600",
  },
  green: {
    iconBg: "bg-green-50",
    iconBorder: "border-green-200",
    iconText: "text-green-600",
  },
  ink: {
    iconBg: "bg-ink-100",
    iconBorder: "border-ink-200",
    iconText: "text-ink-600",
  },
  red: {
    iconBg: "bg-red-50",
    iconBorder: "border-red-200",
    iconText: "text-red-600",
  },
};

export function StatCard({
  icon,
  value,
  label,
  color = "gold",
  className,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  color?: StatColor;
  className?: string;
}) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.gold;
  return (
    <div className={cn("card-surface p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-400 mb-1">{label}</p>
          <p className="font-display text-2xl font-semibold tracking-tight text-ink-900 leading-none">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex w-11 h-11 shrink-0 items-center justify-center rounded-xl border",
            c.iconBg,
            c.iconBorder,
            c.iconText,
          )}
          aria-hidden
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
