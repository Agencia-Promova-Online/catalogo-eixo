/**
 * assistant.functions.ts
 *
 * ATUALIZADO (build estático SPA): convertidas de createServerFn() → funções
 * assíncronas puras, pela mesma razão de users.functions.ts: evita RPC
 * `/_server?...` 404 que gera microtask loop infinito = CPU 99%.
 */
import { assistantInputSchema, finderInputSchema } from "@/lib/assistant.schemas";
import type { AssistantContext } from "@/lib/assistant.server";

function okOrThrow<T>(parser: (v: unknown) => T, value: unknown): T {
  try {
    return parser(value);
  } catch (err: any) {
    const issues = err?.issues;
    if (Array.isArray(issues) && issues.length) {
      const first = issues[0];
      const path = Array.isArray(first?.path) && first.path.length ? first.path.join(".") : "valor";
      throw new Error(`Entrada inválida em ${path}: ${first.message}`);
    }
    throw new Error(err?.message || "Entrada inválida.");
  }
}

export async function askAssistant(data: unknown) {
  const parsed = okOrThrow(assistantInputSchema.parse, data);
  const ctx = { userId: "local-spa-client", email: "" } as unknown as AssistantContext;
  const { answerCatalogQuestion } = await import("@/lib/assistant.server");
  return answerCatalogQuestion(ctx, parsed);
}

export async function findMyMachine(data: unknown) {
  const parsed = okOrThrow(finderInputSchema.parse, data);
  const ctx = { userId: "local-spa-client", email: "" } as unknown as AssistantContext;
  const { recommendMachines } = await import("@/lib/assistant.server");
  return recommendMachines(ctx, parsed);
}
