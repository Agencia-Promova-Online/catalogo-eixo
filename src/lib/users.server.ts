export type AuthContext = {
  supabase: {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (
          column: string,
          value: unknown,
        ) => {
          eq: (
            column: string,
            value: unknown,
          ) => { maybeSingle: () => Promise<{ data: unknown; error: unknown }> };
        };
      };
    };
  };
  userId: string;
};

export async function assertAdmin(context: AuthContext) {
  // Role is verified server-side against user_roles, which RLS scopes to the caller.
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Apenas administradores podem gerenciar usuários.");
}


export async function countAdmins() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  return count ?? 0;
}

export async function provisionUser(input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "vendedor";
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name, role: input.role },
  });
  if (error || !created.user) {
    throw new Error(error?.message ?? "Não foi possível criar o usuário.");
  }
  await supabaseAdmin
    .from("profiles")
    .upsert({ id: created.user.id, name: input.name, email: input.email, active: true });
  await supabaseAdmin.from("user_roles").delete().eq("user_id", created.user.id);
  await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: input.role });
  return { id: created.user.id };
}
