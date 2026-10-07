import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MachineMedia } from "@/components/MachineMedia";
import { StatusBadge } from "@/components/StatusBadge";
import { FactoryNewBadge } from "@/components/FactoryNewBadge";
import { machineTitle, publicImageUrl, type Machine } from "@/lib/catalog";
import { copyOfferToClipboard } from "@/lib/offer";
import { formatBRL } from "@/lib/format";

export function MachineCard({
  machine,
  photoUrl,
  index = 0,
}: {
  machine: Machine;
  photoUrl?: string | null | undefined;
  index?: number;
}) {
  const isSold = machine.status === "vendida";
  const mainPhoto = photoUrl ?? publicImageUrl(machine.main_photo ?? null);
  const [copied, setCopied] = useState(false);

  async function copyOffer() {
    const ok = await copyOfferToClipboard(machine);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article
      className="group card-surface enter-up flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-md"
      style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
    >
      <Link
        to="/maquina/$id"
        params={{ id: machine.id }}
        className="relative block overflow-hidden"
        aria-label={`Ver detalhes de ${machineTitle(machine)}`}
      >
        <MachineMedia
          src={mainPhoto}
          alt={machineTitle(machine)}
          className="aspect-[16/11] w-full rounded-t-2xl"
          imageClassName={isSold ? "grayscale" : ""}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <StatusBadge status={machine.status} />
          {machine.code ? (
            <span className="badge-base badge-active">
              #{machine.code}
            </span>
          ) : null}
        </div>
        {isSold ? (
          <span className="pointer-events-none absolute inset-x-0 bottom-6 bg-red-500/90 py-1 text-center font-display text-sm font-bold uppercase tracking-[0.24em] text-white">
            Vendida
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3.5 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="label-eyebrow truncate">{machine.category}</p>
          <h3 className="truncate font-display text-xl font-semibold tracking-tight leading-tight">
            {machineTitle(machine)}
          </h3>
          <FactoryNewBadge className="mt-2" />
        </div>

        <span className="h-px w-full bg-ink-100" aria-hidden />

        <div className="money-strip rounded-xl px-3 py-3">
          <p className="label-eyebrow">Valor</p>
          <p className="font-display text-3xl font-semibold leading-none tracking-tight text-ink-900 sm:text-4xl">
            {formatBRL(machine.price)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-ink-100 bg-white px-3 py-2">
            <p className="label-eyebrow">Entrada</p>
            <p className="font-display text-lg font-semibold leading-tight text-ink-900 sm:text-xl">
              {formatBRL(machine.down_payment)}
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white px-3 py-2">
            <p className="label-eyebrow">Parcela</p>
            <p className="font-display text-lg font-semibold leading-tight text-ink-900 sm:text-xl">
              {formatBRL(machine.installment)}
            </p>
          </div>
        </div>

        <div className="mt-auto grid gap-2 pt-1">
          <Button
            type="button"
            size="lg"
            variant={copied ? "secondary" : "primary"}
            onClick={copyOffer}
            className="w-full"
            aria-label={`Copiar oferta de ${machineTitle(machine)}`}
          >
            {copied ? (
              <>
                <Check className="size-4" /> Oferta copiada
              </>
            ) : (
              <>
                <Copy className="size-4" /> Copiar oferta
              </>
            )}
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full">
            <Link to="/maquina/$id" params={{ id: machine.id }}>
              Ver detalhes <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
