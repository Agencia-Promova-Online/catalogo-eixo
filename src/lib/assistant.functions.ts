import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assistantInputSchema, finderInputSchema } from "@/lib/assistant.schemas";
import type { AssistantContext } from "@/lib/assistant.server";

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => assistantInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { answerCatalogQuestion } = await import("@/lib/assistant.server");
    return answerCatalogQuestion(context as unknown as AssistantContext, data);
  });

export const findMyMachine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => finderInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { recommendMachines } = await import("@/lib/assistant.server");
    return recommendMachines(context as unknown as AssistantContext, data);
  });
