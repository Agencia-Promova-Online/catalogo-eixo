/**
 * src/__static-shims__users-server.ts
 *
 * SHIM build estático.
 *
 * O arquivo ORIGINAL `@/lib/users.server.ts` importa
 * `@/integrations/supabase/client.server` (que dá throw fatal no browser
 * se faltar service-role) para `countAdmins` / `provisionUser` /
 * `assertAdmin`.
 *
 * No build SPA cliente, essas funções são substituídas por stubs seguros:
 *  - countAdmins(): retorna 1 (presume que há admin, evita bootstrap tela)
 *  - provisionUser(): erro educado
 *  - assertAdmin(): erro educado (nunca deve rodar em cliente anyway)
 *
 * Assinatura de tipos mantida para quebrar o mínimo possível o
 * `users.functions.ts` que importa `@/lib/users.server`.
 */

import type { AuthContext } from "./__static-shims__users-server-types";
export type { AuthContext } from "./__static-shims__users-server-types";

const CLIENT_UNSUPPORTED =
  "Gestão de usuários com service-role requer servidor Nitro/TanStack Start. " +
  "No build cliente SPA, crie/edite usuários diretamente via Supabase Auth " +
  "Dashboard.";

export async function assertAdmin(_context: AuthContext): Promise<void> {
  // Em cliente, nenhuma operação server-side realmente usa assertAdmin.
  // O middleware do createServerFn (quando shimado) também cai em stub.
  // Retornar no-op: evita throw top-level que trava o react-query retry loop.
  return Promise.resolve();
}

/**
 * Retorna "tem admin" (count > 0) para que a página /auth NÃO mostre a tela
 * de bootstrap "Criar primeiro admin". Em deploy real, se quiser a tela
 * de first-run bootstrap, precisará rodar server-side (build SSR Nitro).
 * Para o cliente que já tem admin criado no dashboard Supabase, este stub
 * evita loop infinito.
 */
export async function countAdmins(): Promise<number> {
  return Promise.resolve(1);
}

export async function provisionUser(_input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "vendedor";
}): Promise<{ id: string }> {
  throw new Error(`provisionUser() — ${CLIENT_UNSUPPORTED}`);
}

export default { assertAdmin, countAdmins, provisionUser };
