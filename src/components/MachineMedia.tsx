import { useState } from "react";
import { Tractor, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mídia da máquina: começa PARADA (poster) e só anima quando o usuário
 * passa o mouse (desktop) ou toca/clica (mobile). Nada anima sozinho.
 * Fallback: placeholder cinza com ícone Tractor caso nenhuma foto real cadastrada.
 */
export function MachineMedia({
  src,
  alt,
  className,
  imageClassName,
  eager = false,
  showControl = true,
}: {
  src?: string | null | undefined;
  alt: string;
  className?: string | undefined;
  imageClassName?: string | undefined;
  eager?: boolean;
  showControl?: boolean;
}) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const live = pinned || hovered;

  return (
    <div
      className={cn("group/media relative overflow-hidden bg-ink-100", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "h-full w-full object-cover will-change-transform",
              live ? "media-live" : "",
              imageClassName,
            )}
          />
          {showControl ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setPinned((value) => !value);
              }}
              aria-label={pinned ? "Parar animação" : "Animar máquina"}
              className="absolute bottom-2 right-2 z-10 grid size-8 place-items-center rounded-full border border-border/60 bg-background/70 text-foreground opacity-80 backdrop-blur transition-opacity hover:opacity-100"
            >
              {pinned ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>
          ) : null}
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-100 text-ink-300">
          <Tractor className="size-12" aria-hidden strokeWidth={1.25} />
          <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            Foto não cadastrada
          </span>
        </div>
      )}
    </div>
  );
}

