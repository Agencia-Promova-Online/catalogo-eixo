import { formatBRL } from "@/lib/format";
import { machineTitle, type Machine } from "@/lib/catalog";

type OfferMachine = Pick<
  Machine,
  "display_name" | "category" | "price" | "down_payment" | "installment"
>;

/**
 * Texto da oferta para colar no WhatsApp.
 * Formato fixo — somente categoria + nome, valor, entrada e parcelas.
 * Os marcadores * e _ são mantidos para a formatação do WhatsApp.
 */
export function buildOfferText(machine: OfferMachine): string {
  const title = [machine.category, machineTitle(machine as Machine)]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  return [
    `🚜 *${title}*`,
    `💰 *Valor:* _${formatBRL(machine.price)}_`,
    `✅ *Entrada:* _${formatBRL(machine.down_payment)}_`,
    `📅 *Parcelas:* _${formatBRL(machine.installment)}_`,
  ].join("\n\n");
}

export async function copyOfferToClipboard(machine: OfferMachine): Promise<boolean> {
  const text = buildOfferText(machine);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
