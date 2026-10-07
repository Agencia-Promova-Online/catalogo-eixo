import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  Scale,
  FolderTree,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Tags,
  Tractor,
  Users,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BrandLogo } from "@/components/BrandLogo";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const ITEMS = [
  { to: "/admin" as const, label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/maquinas" as const, label: "Máquinas", icon: Tractor, exact: false },
  { to: "/comparar" as const, label: "Comparar", icon: Scale, exact: false },
  { to: "/admin/marcas" as const, label: "Marcas", icon: Tags, exact: false },
  { to: "/admin/categorias" as const, label: "Categorias", icon: FolderTree, exact: false },
  { to: "/admin/usuarios" as const, label: "Usuários", icon: Users, exact: false },
  { to: "/admin/auditoria" as const, label: "Auditoria", icon: ShieldCheck, exact: false },
  { to: "/admin/historico" as const, label: "Histórico", icon: History, exact: false },
  { to: "/admin/configuracoes" as const, label: "Configurações", icon: Settings, exact: false },
];

export function AdminSidebar() {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to || pathname === `${to}/` : pathname.startsWith(to);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <Sidebar className="bg-ink-900 border-r-0 text-white" collapsible="icon">
      <SidebarContent className="p-0">
        <div className="px-3 pt-4 pb-3 border-b border-ink-800 mb-2">
          <Link to="/catalogo" className="flex min-w-0 items-center gap-2.5 px-1 py-1.5">
            <BrandLogo size="sm" />
            <span className="min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="block truncate font-display text-sm font-semibold leading-tight text-white">
                Eixo-Catálogo
              </span>
              <span className="block truncate text-[0.65rem] uppercase tracking-[0.18em] text-ink-400">
                Painel Admin
              </span>
            </span>
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {ITEMS.map((item) => {
                const active = isActive(item.to, item.exact);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={active
                        ? "!bg-gold-500 !text-white shadow-sm rounded-xl px-3 py-2.5"
                        : "text-ink-300 hover:bg-ink-800 hover:text-white rounded-xl px-3 py-2.5"}
                    >
                      <Link to={item.to} className="flex items-center gap-3 justify-between">
                        <span className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span className="truncate text-sm font-medium">
                            {item.label}
                          </span>
                        </span>
                        {active && <ChevronRight className="w-4 h-4 shrink-0 opacity-80" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Ver catálogo"
                  className="text-ink-300 hover:bg-ink-800 hover:text-white rounded-xl px-3 py-2.5"
                >
                  <Link to="/catalogo" className="flex items-center gap-3">
                    <Tractor className="w-4 h-4 shrink-0" />
                    <span className="truncate text-sm font-medium">
                      Ver catálogo
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-ink-800 px-2 py-3">
        <div className="min-w-0 px-1 pb-2 group-data-[collapsible=icon]:hidden">
          <p className="truncate text-sm font-medium text-white">{user?.name ?? "—"}</p>
          <p className="text-xs text-ink-400">{user?.roleLabel ?? ""}</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sair"
              className="text-ink-300 hover:bg-ink-800 hover:text-red-400 rounded-xl px-3 py-2.5"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
