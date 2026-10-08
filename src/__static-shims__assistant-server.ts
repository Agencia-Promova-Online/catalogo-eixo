/**
 * src/__static-shims__assistant-server.ts
 *
 * SHIM build estático.
 *
 * O arquivo original `@/lib/assistant.server.ts` roda apenas em servidor
 * (Nitro/SSR) — ele usa `process.env['LOVABLE_API_KEY']` e faz fetch em
 * `ai.gateway.lovable.dev` (serviço interno Lovable). No build cliente SPA
 * isso NÃO FUNCIONA, e `apiKey()` dá THROW FATAL na inicialização.
 *
 * Este shim substitui e retorna respostas "indisponível" seguras sem throws.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { AssistantInput, FinderInput } from "@/lib/assistant.schemas";

export type AssistantContext = {
  supabase: SupabaseClient<Database>;
  userId: string;
};

const UNAVAILABLE_REPLY =
  "O assistente do catálogo requer backend (Nitro/TanStack Start). ";

export async function answerCatalogQuestion(
  _context: AssistantContext,
  _input: AssistantInput,
): Promise<{ answer: string }> {
  return Promise.resolve({
    answer:
      UNAVAILABLE_REPLY +
      "Use a página do catálogo /catalogo e filtros de marca, categoria e valores para encontrar a máquina. Se precisar acione o administrador.",
  });
}

export async function recommendMachines(
  _context: AssistantContext,
  _input: FinderInput,
): Promise<{ intro: string; picks: { id: string; reason: string }[] }> {
  return Promise.resolve({
    intro:
      UNAVAILABLE_REPLY +
      "Use os filtros de marca/categoria/valor na página do catálogo ou fale com um administrador.",
    picks: [],
  });
}

export default { answerCatalogQuestion, recommendMachines };
