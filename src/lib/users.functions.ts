import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  activeSchema,
  createUserSchema,
  passwordSchema,
  roleSchema,
  userIdSchema,
} from "@/lib/users.schemas";
import type { AuthContext } from "@/lib/users.server";

export const createUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createUserSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin, provisionUser } = await import("@/lib/users.server");
    await assertAdmin(context as unknown as AuthContext);
    return provisionUser(data);
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => roleSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/users.server");
    await assertAdmin(context as unknown as AuthContext);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => passwordSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/users.server");
    await assertAdmin(context as unknown as AuthContext);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setUserActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => activeSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/users.server");
    await assertAdmin(context as unknown as AuthContext);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ active: data.active })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => userIdSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/users.server");
    const auth = context as unknown as AuthContext;
    await assertAdmin(auth);
    if (data.userId === auth.userId) {
      throw new Error("Você não pode excluir o próprio usuário.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("@/lib/users.server");
    await assertAdmin(context as unknown as AuthContext);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email, active, created_at")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const roleByUser = new Map((roles ?? []).map((row) => [row.user_id, row.role]));
    return (profiles ?? []).map((profile) => ({
      ...profile,
      role: (roleByUser.get(profile.id) ?? "vendedor") as "admin" | "vendedor",
    }));
  });

/** First-run only: reports whether any administrator exists yet. */
export const bootstrapAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { countAdmins } = await import("@/lib/users.server");
  return { needsBootstrap: (await countAdmins()) === 0 };
});

export const createFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createUserSchema.omit({ role: true }).parse(data))
  .handler(async ({ data }) => {
    const { countAdmins, provisionUser } = await import("@/lib/users.server");
    if ((await countAdmins()) > 0) throw new Error("Já existe um administrador cadastrado.");
    await provisionUser({ ...data, role: "admin" });
    return { ok: true };
  });
