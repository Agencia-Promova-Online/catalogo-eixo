import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MachineCard } from "@/components/MachineCard";
import { findMyMachine } from "@/lib/assistant.functions";
import type { Machine } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const PURPOSES = [
  "Construção civil",
  "Agricultura",
  "Terraplenagem",
  "Saneamento",
  "Loteamento",
  "Escavação",
];

const BUDGETS = [
  "Até R$ 250.000",
  "R$ 250.000 a R$ 450.000",
  "R$ 450.000 a R$ 700.000",
  "Acima de R$ 700.000",
  "Sem faixa definida",
];

const INSTALLMENTS = [
  "Até R$ 3.000",
  "R$ 3.000 a R$ 5.000",
  "R$ 5.000 a R$ 8.000",
  "Acima de R$ 8.000",
  "Sem preferência",
];

/** Fluxo guiado por IA que recomenda máquinas reais do catálogo. */
export function MachineFinder({ machines }: { machines: Machine[] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState("");
  const [budget, setBudget] = useState("");
  const [installment, setInstallment] = useState("");
  const [notes, setNotes] = useState("");
  const run = useServerFn(findMyMachine);

  const find = useMutation({
    mutationFn: () => run({ data: { purpose, budget, installment, notes } }),
  });

  function reset() {
    setStep(0);
    setPurpose("");
    setBudget("");
    setInstallment("");
    setNotes("");
    find.reset();
  }

  const results = (find.data?.picks ?? [])
    .map((pick) => ({ pick, machine: machines.find((item) => item.id === pick.id) }))
    .filter((row): row is { pick: { id: string; reason: string }; machine: Machine } =>
      Boolean(row.machine),
    );

  const steps = [
    { title: "Para qual finalidade você precisa da máquina?", options: PURPOSES, value: purpose, set: setPurpose },
    { title: "Qual faixa de investimento?", options: BUDGETS, value: budget, set: setBudget },
    { title: "Qual parcela mensal faz sentido?", options: INSTALLMENTS, value: installment, set: setInstallment },
  ];

  const current = steps[step];

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="accent" size="lg" className="rounded-full">
          <Wand2 className="size-4" /> ENCONTRAR MINHA MÁQUINA
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl font-extrabold uppercase tracking-wide">
            <Sparkles className="size-5 text-accent" aria-hidden /> Encontrar minha máquina
          </DialogTitle>
          <DialogDescription>
            Responda três perguntas rápidas — a recomendação usa apenas máquinas cadastradas.
          </DialogDescription>
        </DialogHeader>

        {find.data ? (
          <div className="space-y-4">
            <p className="rounded-2xl border-l-2 border-accent/60 bg-secondary/40 px-4 py-3 text-sm">
              {find.data.intro}
            </p>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma máquina do catálogo atende exatamente a esses critérios.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map(({ pick, machine }, index) => (
                  <div key={machine.id} className="space-y-2">
                    <MachineCard machine={machine} index={index} />
                    {pick.reason ? (
                      <p className="px-1 text-xs text-muted-foreground">{pick.reason}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
            <Button variant="secondary" size="lg" className="w-full" onClick={reset}>
              <RotateCcw className="size-4" /> NOVA BUSCA
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-1.5">
              {steps.map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    index <= step ? "bg-accent" : "bg-secondary",
                  )}
                />
              ))}
            </div>

            <p className="font-display text-base font-bold uppercase tracking-wide">
              {current?.title}
            </p>

            <div className="flex flex-wrap gap-2">
              {(current?.options ?? []).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    current?.set(option);
                    setStep((value) => Math.min(value + 1, steps.length - 1));
                  }}
                  className={cn(
                    "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-[0.97]",
                    current?.value === option
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-secondary/40 text-muted-foreground hover:border-accent/50 hover:text-foreground",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            {step === steps.length - 1 ? (
              <Input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Alguma observação? (opcional)"
                aria-label="Observações"
                maxLength={300}
                className="h-11 rounded-full bg-background/60"
              />
            ) : null}

            {find.error ? (
              <p className="text-sm text-destructive">{(find.error as Error).message}</p>
            ) : null}

            <div className="flex gap-2">
              {step > 0 ? (
                <Button variant="ghost" size="lg" onClick={() => setStep((value) => value - 1)}>
                  <ArrowLeft className="size-4" /> VOLTAR
                </Button>
              ) : null}
              <Button
                variant="accent"
                size="lg"
                className="flex-1"
                disabled={!purpose || !budget || !installment || find.isPending}
                onClick={() => find.mutate()}
              >
                {find.isPending ? "ANALISANDO CATÁLOGO..." : "VER RECOMENDAÇÕES"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
