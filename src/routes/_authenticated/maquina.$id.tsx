import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Copy, Maximize2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { PhotoFrame } from "@/components/PhotoFrame";
import { MachineMedia } from "@/components/MachineMedia";
import { StatusBadge } from "@/components/StatusBadge";
import { FactoryNewBadge } from "@/components/FactoryNewBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { buildSignedImages, fetchImages, fetchMachine, fetchSettings, machineTitle, publicImageUrl } from "@/lib/catalog";
import {
  machineApplications,
  machineDescription,
  machineHighlights,
  machineQualities,
  machineSpecs,
} from "@/lib/machineSpecs";
import { cn } from "@/lib/utils";
import { copyOfferToClipboard } from "@/lib/offer";
import { formatBRL, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/maquina/$id")({
  head: () => ({
    meta: [
      { title: "Ficha da Máquina | Eixo-Catálogo" },
      {
        name: "description",
        content:
          "Ficha completa da máquina: especificações, valor, entrada, parcela e aplicações para o atendimento comercial.",
      },
      { property: "og:title", content: "Ficha da Máquina | Eixo-Catálogo" },
      {
        property: "og:description",
        content: "Consulta rápida da ficha técnica e comercial da máquina.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MachineDetail,
});

function MachineDetail() {
  const { id } = Route.useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const machine = useQuery({ queryKey: ["machine", id], queryFn: () => fetchMachine(id) });
  const images = useQuery({ queryKey: ["images", id], queryFn: () => fetchImages(id) });
  const settings = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const signed = useMemo(
    () => buildSignedImages(images.data ?? []),
    [images.data],
  );

  const item = machine.data;

  /** Todas as fotos reais da máquina (ordenadas principal primeiro). */
  const gallery = useMemo(() => {
    return (images.data ?? [])
      .map((image) => ({
        src: signed[image.id] ?? publicImageUrl(image) ?? null,
        label: image.label ?? "Foto",
      }))
      .filter((view): view is { src: string; label: string } => Boolean(view.src));
  }, [images.data, signed]);

  const heroUrl = gallery[activeIndex]?.src ?? gallery[0]?.src ?? null;

  return (
    <div className="app-surface min-h-screen pb-12">
      <AppHeader companyName={settings.data?.company_name} />

      <main className="mx-auto max-w-6xl px-4 py-4">
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
          <Link to="/catalogo">
            <ArrowLeft className="size-4" /> VOLTAR AO CATÁLOGO
          </Link>
        </Button>

        {machine.isLoading ? (
          <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
            <div className="skeleton-shimmer aspect-[4/3] w-full rounded-2xl" />
            <div className="space-y-3">
              <div className="skeleton-shimmer h-8 w-2/3 rounded" />
              <div className="skeleton-shimmer h-28 w-full rounded-xl" />
              <div className="skeleton-shimmer h-20 w-full rounded-xl" />
            </div>
          </div>
        ) : !item ? (
          <p className="py-20 text-center text-muted-foreground">Máquina não encontrada.</p>
        ) : (
          <article className="enter-up space-y-5">
            <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:items-start">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => heroUrl && setZoomOpen(true)}
                  className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl border shadow-card"
                  aria-label="Ampliar foto"
                >
                  <MachineMedia
                    src={heroUrl}
                    alt={`Foto — ${machineTitle(item)}`}
                    className="aspect-[4/3] w-full"
                    eager
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-surface/80 p-2 text-surface-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    <Maximize2 className="size-4" />
                  </span>
                </button>

                {gallery.length > 1 ? (
                  <div className="scroll-x-clean flex gap-2">
                    {gallery.map((view, index) => (
                      <button
                        key={`${view.src}-${index}`}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-label={view.label}
                        className={`shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                          index === activeIndex
                            ? "border-accent shadow-accent"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <PhotoFrame src={view.src} alt={view.label} className="size-20" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <header className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                    <FactoryNewBadge />
                    {item.code ? (
                      <span className="rounded-md bg-accent px-2 py-0.5 font-display text-xs font-bold text-accent-foreground">
                        #{item.code}
                      </span>
                    ) : null}
                  </div>
                  <p className="label-eyebrow text-accent">{item.brand}</p>
                  <h1 className="font-display text-4xl font-extrabold uppercase leading-none tracking-tight">
                    {machineTitle(item)}
                  </h1>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {item.category}
                    {item.year ? ` · ${item.year}` : ""}
                  </p>
                </header>

                <section className="glass overflow-hidden rounded-2xl border-accent/35">
                  <div className="money-strip px-4 py-4">
                    <p className="label-eyebrow">Valor da máquina</p>
                    <p className="price-accent font-display text-[2.6rem] font-extrabold leading-none tracking-tight sm:text-5xl">
                      {formatBRL(item.price)}
                    </p>
                  </div>
                  <div className="grid gap-3 border-t p-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/70 bg-steel/50 px-3 py-2.5 transition-colors hover:border-silver/25">
                      <p className="label-eyebrow">Entrada</p>
                      <p className="font-display text-2xl font-bold">{formatBRL(item.down_payment)}</p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-steel/50 px-3 py-2.5 transition-colors hover:border-silver/25">
                      <p className="label-eyebrow">Parcela a partir de</p>
                      <p className="font-display text-2xl font-bold">{formatBRL(item.installment)}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <Button
                        type="button"
                        size="lg"
                        variant={copied ? "info" : "accent"}
                        className="w-full rounded-xl"
                        onClick={async () => {
                          const ok = await copyOfferToClipboard(item);
                          if (!ok) return;
                          setCopied(true);
                          window.setTimeout(() => setCopied(false), 1800);
                        }}
                      >
                        {copied ? (
                          <>
                            <Check className="size-4" /> OFERTA COPIADA
                          </>
                        ) : (
                          <>
                            <Copy className="size-4" /> COPIAR OFERTA
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-2">
                  {machineHighlights(item).map((highlight) => (
                    <div
                      key={highlight.label}
                      className="rounded-xl border border-border/70 bg-secondary/25 px-3 py-2"
                    >
                      <p className="label-eyebrow truncate">{highlight.label}</p>
                      <p className="truncate font-display text-base font-bold">
                        {highlight.value?.trim() ? highlight.value : "Não informado"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <section className="panel p-4 lg:col-span-3">
                <h2 className="font-display text-lg font-bold uppercase">Especificações técnicas</h2>
                <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {machineSpecs(item, true).map((spec) => (
                    <SpecRow key={spec.label} label={spec.label} value={spec.value} status={spec.status} />
                  ))}
                  <SpecRow label="Horímetro" value={item.hours || "0 horas"} />
                  <SpecRow label="Localização" value={item.location} />

                  <SpecRow label="Atualizado em" value={formatDate(item.updated_at)} />
                </dl>
              </section>

              <section className="panel p-4 lg:col-span-2">
                <h2 className="font-display text-lg font-bold uppercase">Descrição</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {machineDescription(item)}
                </p>

                <h3 className="mt-4 font-display text-sm font-bold uppercase tracking-[0.16em] text-accent">
                  Aplicações
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {machineApplications(item).map((application) => (
                    <span
                      key={application}
                      className="rounded-full border border-border/70 bg-secondary/35 px-3 py-1 text-xs font-medium"
                    >
                      {application}
                    </span>
                  ))}
                </div>
              </section>

              <section className="panel p-4">
                <h2 className="font-display text-lg font-bold uppercase">Qualidades</h2>
                <ul className="mt-2 space-y-1.5">
                  {machineQualities(item).map((quality) => (
                    <li key={quality} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                      {quality}
                    </li>
                  ))}
                </ul>

                {item.notes?.trim() ? (
                  <>
                    <h3 className="mt-4 font-display text-sm font-bold uppercase tracking-[0.16em] text-accent">
                      Observações
                    </h3>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {item.notes}
                    </p>
                  </>
                ) : null}
              </section>
            </div>
          </article>
        )}
      </main>


      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl border-0 bg-surface p-2">
          <DialogTitle className="sr-only">Foto ampliada</DialogTitle>
          {heroUrl ? (
            <div className="relative">
              <img
                src={heroUrl}
                alt={item ? `Foto — ${machineTitle(item)}` : "Foto"}
                className="max-h-[75vh] w-full rounded-xl object-contain"
              />
            </div>
          ) : null}

          {gallery.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pt-2">
              {gallery.map((view, index) => (
                <button
                  key={`zoom-${view.src}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={view.label}
                  className={`shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                    index === activeIndex ? "border-accent" : "border-transparent"
                  }`}
                >
                  <PhotoFrame src={view.src} alt={view.label} className="size-16" />
                </button>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SpecRow({ label, value, status }: { label: string; value: string | null; status?: "confirmed" | "review" | "not_confirmed" | undefined }) {
  const isUpdating = value === "Informação técnica em atualização.";
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-border/70 py-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cn(
        "text-right text-sm font-semibold",
        isUpdating && "text-amber-500 italic font-medium"
      )}>
        {value?.trim() ? value : "Não informado"}
      </dd>
    </div>
  );
}
