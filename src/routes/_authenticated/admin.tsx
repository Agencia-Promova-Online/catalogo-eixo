import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    const isAdmin = (roles ?? []).some((row) => row.role === "admin");
    if (!isAdmin) throw redirect({ to: "/catalogo" });
  },

  component: AdminLayout,
});

const TITLES: { prefix: string; label: string; exact?: boolean }[] = [
  { prefix: "/admin/maquinas", label: "Máquinas" },
  { prefix: "/admin/marcas", label: "Marcas" },
  { prefix: "/admin/categorias", label: "Categorias" },
  { prefix: "/admin/usuarios", label: "Usuários" },
  { prefix: "/admin/auditoria", label: "Auditoria de catálogo" },
  { prefix: "/admin/historico", label: "Histórico" },
  { prefix: "/admin/configuracoes", label: "Configurações" },
  { prefix: "/admin", label: "Dashboard", exact: true },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const current =
    TITLES.find((entry) => (entry.exact ? pathname.replace(/\/$/, "") === entry.prefix : pathname.startsWith(entry.prefix)))
      ?.label ?? "Painel";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-ink-50">
        <AdminSidebar />
        <SidebarInset className="min-w-0 bg-ink-50">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-100 bg-white px-3 sm:px-6">
            <SidebarTrigger className="shrink-0 rounded-xl hover:bg-ink-100" />
            <div className="min-w-0 flex-1">
              <p className="label-eyebrow text-primary">Painel administrativo</p>
              <h1 className="truncate font-display text-lg font-semibold leading-none tracking-tight text-ink-900">
                {current}
              </h1>
            </div>
          </header>
          <main key={pathname} className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
