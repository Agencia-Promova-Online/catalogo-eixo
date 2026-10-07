import { z } from "zod";

export const assistantInputSchema = z.object({
  question: z.string().trim().min(2).max(600),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().max(2000),
      }),
    )
    .max(10)
    .default([]),
});

export type AssistantInput = z.infer<typeof assistantInputSchema>;

/** "Encontrar minha máquina": respostas simples do formulário guiado. */
export const finderInputSchema = z.object({
  purpose: z.string().trim().min(2).max(80),
  budget: z.string().trim().min(1).max(80),
  installment: z.string().trim().min(1).max(80),
  notes: z.string().trim().max(300).default(""),
});

export type FinderInput = z.infer<typeof finderInputSchema>;
