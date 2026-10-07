export function MachineCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="enter-soft overflow-hidden rounded-2xl border bg-card shadow-card"
      style={{ animationDelay: `${index * 60}ms` }}
      aria-hidden
    >
      <div className="skeleton-shimmer aspect-[16/11] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton-shimmer h-3 w-20 rounded" />
        <div className="skeleton-shimmer h-6 w-2/3 rounded" />
        <div className="skeleton-shimmer h-12 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          <div className="skeleton-shimmer h-14 rounded-lg" />
          <div className="skeleton-shimmer h-14 rounded-lg" />
        </div>
        <div className="skeleton-shimmer h-11 w-full rounded-md" />
      </div>
    </div>
  );
}
