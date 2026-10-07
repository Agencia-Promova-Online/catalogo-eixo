import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { wrap: string; icon: string }> = {
  sm:  { wrap: "h-9 w-9 rounded-lg",   icon: "size-5" },
  md:  { wrap: "h-11 w-11 rounded-xl", icon: "size-6" },
  lg:  { wrap: "h-16 w-16 rounded-2xl", icon: "size-8" },
};

export function BrandLogo({ size = "md", className }: { size?: Size; className?: string }) {
  return (
    <span
      aria-label="Eixo"
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden bg-primary text-primary-foreground shadow-sm",
        SIZES[size].wrap,
        className ?? "",
      )}
    >
      <img
        src="/favicon.png"
        alt="Eixo-Catálogo"
        className={cn("h-full w-full object-contain", SIZES[size].icon)}
        loading="eager"
        fetchPriority="high"
      />
    </span>
  );
}
