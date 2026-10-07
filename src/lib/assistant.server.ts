import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { AssistantInput, FinderInput } from "@/lib/assistant.schemas";

export type AssistantContext = {
  supabase: SupabaseClient<Database>;
  userId: string;
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

function apiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("O assistente não está configurado no backend.");
  return key;
}

const brl = (value: number | null) =>
  value === null || value === undefined
    ? "não informado"
    : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const SYSTEM = `Você é o ASSISTENTE EIXO-CATÁLOGO, especialista no catálogo interno de máquinas da Eixo-Catálogo.
Regras obrigatórias:
- Responda em português do Brasil, de forma curta, objetiva e profissional.
- Use SOMENTE as máquinas listadas no catálogo enviado. Nunca invente máquinas, valores ou especificações.
- Se uma especificação técnica (potência, peso, etc.) contiver o texto "Essa informação ainda está em validação no catálogo." ou "Não confirmado", você DEVE responder exatamente: "Essa informação ainda está em validação no catálogo." ao ser perguntado sobre ela. NUNCA invente ou estime valores.
- Todas as máquinas são NOVAS DE FÁBRICA. Nunca trate nenhuma como usada ou seminova.
- Se a informação estiver marcada como "Não confirmado" ou não estiver no catálogo, responda "Não informado no catálogo".
- Não fale de estoque, quantidade disponível nem WhatsApp.
- Ao citar máquinas, use o formato "MARCA MODELO — valor, entrada, parcela" quando os valores existirem.
- No máximo 6 máquinas por resposta.`;

export async function answerCatalogQuestion(
  context: AssistantContext,
  input: AssistantInput,
): Promise<{ answer: string }> {
  const { data, error } = await context.supabase
    .from("machines")
    .select("display_name,brand,model,category,status,price,down_payment,installment,power,operating_weight,year,status_power,status_operating_weight")
    .order("brand", { ascending: true });
  if (error) throw new Error("Não foi possível consultar o catálogo agora.");

  const catalog = (data ?? [])
    .map(
      (m) =>
        `- ${m.display_name} | categoria: ${m.category} | status: ${m.status} | valor: ${brl(m.price)} | entrada: ${brl(m.down_payment)} | parcela: ${brl(m.installment)} | potência: ${m.status_power === 'confirmed' ? (m.power ?? "não informado") : "Essa informação ainda está em validação no catálogo."} | peso operacional: ${m.status_operating_weight === 'confirmed' ? (m.operating_weight ?? "não informado") : "Essa informação ainda está em validação no catálogo."}`,
    )
    .join("\n");

  const response = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "system",
          content: `CATÁLOGO ATUAL (${(data ?? []).length} registros):\n${catalog || "Nenhuma máquina cadastrada."}`,
        },
        ...input.history,
        { role: "user", content: input.question },
      ],
    }),
  });

  if (response.status === 429) throw new Error("Muitas perguntas em sequência. Tente novamente em instantes.");
  if (!response.ok) throw new Error("O assistente está indisponível agora. Tente novamente.");

  const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const answer = json.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("O assistente não retornou resposta. Tente reformular a pergunta.");
  return { answer };
}

/**
 * "Encontrar minha máquina": a IA escolhe entre as máquinas REAIS do catálogo.
 * Retorna apenas ids que existem no banco — nunca cria máquinas ou valores.
 */
export async function recommendMachines(
  context: AssistantContext,
  input: FinderInput,
): Promise<{ intro: string; picks: { id: string; reason: string }[] }> {
  const { data, error } = await context.supabase
    .from("machines")
    .select("id,display_name,brand,model,category,price,down_payment,installment,power,operating_weight,status_power,status_operating_weight")
    .order("price", { ascending: true });
  if (error) throw new Error("Não foi possível consultar o catálogo agora.");

  const machines = data ?? [];
  if (machines.length === 0) return { intro: "Nenhuma máquina cadastrada no catálogo.", picks: [] };

  const catalog = machines
    .map(
      (m) =>
        `${m.id} | ${m.display_name} | categoria: ${m.category} | valor: ${brl(m.price)} | entrada: ${brl(m.down_payment)} | parcela: ${brl(m.installment)} | potência: ${m.status_power === 'confirmed' ? (m.power ?? "não informado") : "Essa informação ainda está em validação no catálogo."} | peso: ${m.status_operating_weight === 'confirmed' ? (m.operating_weight ?? "não informado") : "Essa informação ainda está em validação no catálogo."}`,
    )
    .join("\n");

  const response = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        {
          role: "system",
          content: `Você recomenda máquinas do catálogo interno da Eixo-Catálogo.
Regras: use SOMENTE os ids listados; nunca invente máquinas, valores ou especificações; todas são novas de fábrica; não fale de estoque nem WhatsApp.
Escolha até 3 máquinas que melhor atendem à necessidade informada e explique em 1 frase curta cada escolha (em português do Brasil).
Responda SOMENTE JSON: {"intro":"...","picks":[{"id":"...","reason":"..."}]}`,
        },
        { role: "system", content: `CATÁLOGO:\n${catalog}` },
        {
          role: "user",
          content: `Finalidade: ${input.purpose}\nFaixa de investimento: ${input.budget}\nParcela desejada: ${input.installment}\nObservações: ${input.notes || "nenhuma"}`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (response.status === 429)
    throw new Error("Muitas solicitações em sequência. Tente novamente em instantes.");
  if (!response.ok) throw new Error("O assistente está indisponível agora. Tente novamente.");

  const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = json.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error("O assistente não retornou recomendações. Tente novamente.");

  let parsed: { intro?: string; picks?: { id?: string; reason?: string }[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Não foi possível interpretar a recomendação. Tente novamente.");
  }

  const valid = new Set(machines.map((m) => m.id));
  const picks = (parsed.picks ?? [])
    .filter((pick): pick is { id: string; reason?: string } => Boolean(pick.id && valid.has(pick.id)))
    .slice(0, 3)
    .map((pick) => ({ id: pick.id, reason: (pick.reason ?? "").trim() }));

  return {
    intro: parsed.intro?.trim() || "Estas máquinas podem atender ao que você procura.",
    picks,
  };
}
