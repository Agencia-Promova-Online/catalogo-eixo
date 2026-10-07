import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  active: boolean;
  isAdmin: boolean;
  roleLabel: string;
};

export async function loadCurrentUser(): Promise<CurrentUser | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  const isAdmin = (roles ?? []).some((row) => row.role === "admin");
  return {
    id: user.id,
    email: profile?.email || user.email || "",
    name: profile?.name || user.email?.split("@")[0] || "Usuário",
    active: profile?.active ?? true,
    isAdmin,
    roleLabel: isAdmin ? "ADMINISTRADOR" : "VENDEDOR",
  };
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: loadCurrentUser,
    staleTime: 60_000,
  });
}
