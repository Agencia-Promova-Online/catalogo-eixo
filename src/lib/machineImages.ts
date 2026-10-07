/**
 * Fallback visual para máquinas sem foto real cadastrada.
 * Gera 1 placeholder ilustrativo baseado em categoria/marca.
 */

export type MachineImagePlaceholder = {
  kind: "placeholder";
  background: string;
  foreground: string;
  label: string;
};

type MachineLike = {
  brand?: string | null;
  model?: string | null;
  category?: string | null;
};

const PALETTE = [
  { background: "#FEF3C7", foreground: "#92400E" },
  { background: "#E0E7FF", foreground: "#3730A3" },
  { background: "#D1FAE5", foreground: "#065F46" },
  { background: "#FCE7F3", foreground: "#9D174D" },
  { background: "#DBEAFE", foreground: "#1E40AF" },
  { background: "#FFEDD5", foreground: "#9A3412" },
  { background: "#F3E8FF", foreground: "#6B21A8" },
];

function hashSeed(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h << 5) - h + text.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function illustrativeImage(machine: MachineLike): MachineImagePlaceholder | null {
  const key = `${machine.brand ?? ""}|${machine.model ?? ""}|${machine.category ?? ""}`.trim();
  if (!key) return null;
  const idx = hashSeed(key) % PALETTE.length;
  const palette = PALETTE[idx];
  return {
    kind: "placeholder",
    background: palette.background,
    foreground: palette.foreground,
    label: (machine.category ?? "Máquina").toUpperCase(),
  };
}

/**
 * Galeria ilustrativa de 4 ângulos — mesma lógica do protótipo original.
 * Cada view é um placeholder com a mesma paletta base, variação leve no rótulo.
 */
export function illustrativeGallery(machine: MachineLike): MachineImagePlaceholder[] {
  const base = illustrativeImage(machine);
  if (!base) return [];
  const views = ["FRONTAL", "LATERAL", "TRASEIRA", "CABINE"];
  return views.map((view) => ({
    kind: "placeholder" as const,
    background: base.background,
    foreground: base.foreground,
    label: view,
  }));
}
