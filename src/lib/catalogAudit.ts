import { normalizeText, type Machine } from "@/lib/catalog";

/** Marcas oficiais aceitas no catálogo. */
export const OFFICIAL_BRANDS = [
  "CATERPILLAR",
  "JCB",
  "CASE",
  "SANY",
  "VOLVO",
  "BOBCAT",
  "KOMATSU",
  "NEW HOLLAND",
];

/** Categorias oficiais (singular, maiúsculas). */
export const OFFICIAL_CATEGORIES = [
  "ESCAVADEIRA",
  "RETROESCAVADEIRA",
  "MINI ESCAVADEIRA",
  "MINI CARREGADEIRA",
  "PÁ CARREGADEIRA",
  "MÁQUINA AGRÍCOLA",
  "CAMINHÃO",
];

export type AuditIssue =
  | "marca"
  | "categoria"
  | "modelo"
  | "display_name"
  | "duplicado"
  | "conflito";

export const ISSUE_LABEL: Record<AuditIssue, string> = {
  marca: "Marca inconsistente",
  categoria: "Categoria inconsistente",
  modelo: "Modelo inconsistente",
  display_name: "Nome oficial inconsistente",
  duplicado: "Possível duplicado",
  conflito: "Conflito para revisão",
};

export type AuditRow = {
  machine: Machine;
  issues: AuditIssue[];
  /** Quantidade de campos preenchidos — usada para recomendar o registro principal. */
  completeness: number;
  recommended: boolean;
  detail: string[];
};

const CATEGORY_TOKENS = OFFICIAL_CATEGORIES.map((name) => normalizeText(name));

function completenessOf(machine: Machine): number {
  const fields = [
    machine.code,
    machine.description,
    machine.notes,
    machine.year,
    machine.price,
    machine.down_payment,
    machine.installment,
    machine.power,
    machine.operating_weight,
    machine.hours,
    machine.location,
  ];
  return fields.filter((value) => value !== null && value !== "" && value !== undefined).length;
}

function sameCommercial(a: Machine, b: Machine): boolean {
  return (
    Number(a.price ?? -1) === Number(b.price ?? -1) &&
    Number(a.down_payment ?? -1) === Number(b.down_payment ?? -1) &&
    Number(a.installment ?? -1) === Number(b.installment ?? -1)
  );
}

/** Auditoria puramente informativa: aponta problemas, nunca altera dados. */
export function auditCatalog(machines: Machine[]): AuditRow[] {
  const groups = new Map<string, Machine[]>();
  for (const machine of machines) {
    const key = `${normalizeText(machine.brand)}|${normalizeText(machine.model)}`;
    groups.set(key, [...(groups.get(key) ?? []), machine]);
  }

  const rows: AuditRow[] = machines.map((machine) => {
    const issues: AuditIssue[] = [];
    const detail: string[] = [];

    if (!OFFICIAL_BRANDS.includes(machine.brand?.trim() ?? "")) {
      issues.push("marca");
      detail.push(`Marca "${machine.brand}" fora da lista oficial.`);
    }
    if (!OFFICIAL_CATEGORIES.includes(machine.category?.trim() ?? "")) {
      issues.push("categoria");
      detail.push(`Categoria "${machine.category}" fora da nomenclatura padrão.`);
    }

    const model = normalizeText(machine.model);
    if (CATEGORY_TOKENS.some((token) => model.includes(token))) {
      issues.push("modelo");
      detail.push("O modelo contém o nome da categoria.");
    }

    const expected = `${machine.brand ?? ""} ${machine.model ?? ""}`.replace(/\s+/g, " ").trim();
    if (normalizeText(machine.display_name) !== normalizeText(expected)) {
      issues.push("display_name");
      detail.push(`Nome oficial difere de marca + modelo ("${expected}").`);
    }

    if ((machine.notes ?? "").toUpperCase().includes("CONFLITO PARA REVISÃO")) {
      issues.push("conflito");
      detail.push("Registro marcado como conflito comercial para revisão manual.");
    }

    return { machine, issues, completeness: completenessOf(machine), recommended: false, detail };
  });

  const byId = new Map(rows.map((row) => [row.machine.id, row]));

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const ranked = [...group].sort(
      (a, b) => completenessOf(b) - completenessOf(a) || a.created_at.localeCompare(b.created_at),
    );
    const principal = ranked[0];
    if (!principal) continue;
    for (const machine of group) {
      const row = byId.get(machine.id);

      if (!row) continue;
      row.issues.push("duplicado");
      row.recommended = machine.id === principal.id;
      const conflicting = group.some((other) => other.id !== machine.id && !sameCommercial(machine, other));
      row.detail.push(
        conflicting
          ? `Mesmo modelo com valores comerciais diferentes (${group.length} registros) — CONFLITO PARA REVISÃO, não excluir sem confirmação.`
          : `Duplicidade com valores idênticos (${group.length} registros). Registro principal recomendado: ${principal.display_name}${principal.code ? ` #${principal.code}` : ""}.`,
      );
      if (conflicting && !row.issues.includes("conflito")) row.issues.push("conflito");
    }
  }

  return rows
    .filter((row) => row.issues.length > 0)
    .sort((a, b) => b.issues.length - a.issues.length || a.machine.display_name.localeCompare(b.machine.display_name));
}
