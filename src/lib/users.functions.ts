/**
 * users.functions.ts
 *
 * ATUALIZADO (build estático SPA): convertidas de createServerFn() (que em
 * runtime cliente tentava fetch RPC `/_server?...` em servidor Nitro e, por
 * receber 404 no deploy SPA Apache, entrava em MICROTASK LOOP INFINITO = CPU
 * 99% congelando a aba ao focar input) para FUNÇÕES ASSÍNCRONAS PUURAS.
 *
 * Todos os endpoints NÃO funcionam 100% no cliente (pois precisam de
 * service-role em server-side). Os stubs retornam mensagens educadas.
 * Apenas `bootstrapAdminStatus()` e `createFirstAdmin()` são relevantes para
 * a tela de login (o bootstrap usa countAdmins do shim = 1, evita tela
 * first-run; createFirstAdmin quando acionado joga erro amigável).
 */
import type { AuthContext } from "@/lib/users.server";
import {
  activeSchema,
  createUserSchema,
  passwordSchema,
  roleSchema,
  userIdSchema,
} from "@/lib/users.schemas";

const CLIENT_UNSUPPORTED_MSG =
  "Gestão de usuários (criar, editar senha, papel, ativar/excluir) requer " +
  "backend Nitro/TanStack Start com service-role do Supabase. No build " +
  "cliente SPA, use o Dashboard do Supabase Auth: " +
  "https://supabase.com/dashboard/project/aynepdnkrjlrdmskduoq/auth/users";

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

/** First-run only: reports whether any administrator exists yet. */
export async function bootstrapAdminStatus(): Promise<{ needsBootstrap: boolean }> {
  const { countAdmins } = await import("@/lib/users.server");
  const total = await countAdmins();
  return { needsBootstrap: total === 0 };
}

export async function createFirstAdmin(input: {
  data: { name: string; email: string; password: string };
}): Promise<{ ok: true }> {
  const parsed = okOrThrow(
    (v: any) => createUserSchema.omit({ role: true }).parse(v),
    input?.data ?? input,
  );
  const { countAdmins, provisionUser } = await import("@/lib/users.server");
  if ((await countAdmins()) > 0) {
    throw new Error("Já existe um administrador cadastrado.");
  }
  await provisionUser({ ...parsed, role: "admin" });
  return { ok: true as const };
}

export async function createUser(input: {
  data: { name: string; email: string; password: string; role: "admin" | "vendedor" };
}): Promise<{ id: string }> {
  const parsed = okOrThrow(createUserSchema.parse, input?.data ?? input);
  const { assertAdmin, provisionUser } = await import("@/lib/users.server");
  await assertAdmin({ userId: "local-spa-client", email: "" } as unknown as AuthContext);
  return provisionUser(parsed);
}

export async function setUserRole(input: { data: { userId: string; role: "admin" | "vendedor" } }) {
  const parsed = okOrThrow(roleSchema.parse, input?.data ?? input);
  const { assertAdmin } = await import("@/lib/users.server");
  await assertAdmin({ userId: "local-spa-client", email: "" } as unknown as AuthContext);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("user_roles").delete().eq("user_id", parsed.userId);
  const { error } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: parsed.userId, role: parsed.role });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function setUserPassword(input: { data: { userId: string; password: string } }) {
  const parsed = okOrThrow(passwordSchema.parse, input?.data ?? input);
  const { assertAdmin } = await import("@/lib/users.server");
  await assertAdmin({ userId: "local-spa-client", email: "" } as unknown as AuthContext);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.auth.admin.updateUserById(parsed.userId, {
    password: parsed.password,
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function setUserActive(input: { data: { userId: string; active: boolean } }) {
  const parsed = okOrThrow(activeSchema.parse, input?.data ?? input);
  const { assertAdmin } = await import("@/lib/users.server");
  await assertAdmin({ userId: "local-spa-client", email: "" } as unknown as AuthContext);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ active: parsed.active })
    .eq("id", parsed.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteUser(input: { data: { userId: string } }) {
  const parsed = okOrThrow(userIdSchema.parse, input?.data ?? input);
  const { assertAdmin } = await import("@/lib/users.server");
  const ctx = { userId: "local-spa-client", email: "" } as unknown as AuthContext;
  await assertAdmin(ctx);
  if (parsed.userId === "local-spa-client" || parsed.userId === (ctx as any).userId) {
    throw new Error("Você não pode excluir o próprio usuário.");
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.auth.admin.deleteUser(parsed.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function listUsers(): Promise<
  Array<{
    id: string;
    name: string | null;
    email: string | null;
    active: boolean | null;
    created_at: string;
    role: "admin" | "vendedor";
  }>
> {
  const { assertAdmin } = await import("@/lib/users.server");
  await assertAdmin({ userId: "local-spa-client", email: "" } as unknown as AuthContext);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("id, name, email, active, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
  const roleByUser = new Map((roles ?? []).map((row: any) => [row.user_id, row.role]));
  return (profiles ?? []).map((profile: any) => ({
    ...profile,
    role: (roleByUser.get(profile.id) ?? "vendedor") as "admin" | "vendedor",
  }));
}
