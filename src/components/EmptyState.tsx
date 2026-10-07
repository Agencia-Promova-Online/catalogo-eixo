import type { ReactNode } from "react";
import { Search } from "lucide-react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="enter-up flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex w-14 h-14 items-center justify-center rounded-2xl bg-ink-100" aria-hidden>
        {icon ?? <Search className="w-7 h-7 text-ink-300" />}
      </span>
      <h3 className="font-display text-lg font-medium text-ink-700">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-ink-400">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
