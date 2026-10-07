import { Tractor } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhotoFrame({
  src,
  alt,
  className,
  imageClassName,
}: {
  src?: string | null | undefined;
  alt: string;
  className?: string | undefined;
  imageClassName?: string | undefined;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-ink-100", className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-100 text-ink-300">
          <Tractor className="size-10" aria-hidden strokeWidth={1.25} />
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
            Foto não cadastrada
          </span>
        </div>
      )}
    </div>
  );
}

