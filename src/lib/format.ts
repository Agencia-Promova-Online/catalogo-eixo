export function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "Não informado";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    date,
  );
}

export function orNotInformed(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "Não informado";
  const text = String(value).trim();
  return text.length ? text : "Não informado";
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}
