import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";


export function AppHeader({ companyName }: { companyName?: string | null | undefined }) {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 rounded-none border-x-0 border-t-0 border-b border-ink-100 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="min-w-0">
          <Link to="/catalogo" className="flex min-w-0 items-center gap-2.5">
            <BrandLogo size="sm" />
            <p className="truncate font-display text-base font-semibold leading-tight text-ink-900 sm:text-lg">
              {companyName || "Eixo-Catálogo"}
            </p>
          </Link>
        </div>

        <h1 className="hidden justify-self-center whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.22em] text-ink-400 sm:block">
          Catálogo de Máquinas
        </h1>

        <div className="flex shrink-0 items-center gap-2 justify-self-end">
          <div className="hidden text-right sm:block">
            <p className="truncate font-medium leading-tight text-ink-900">{user?.name ?? "—"}</p>
            <p className="label-eyebrow text-ink-400">{user?.roleLabel ?? ""}</p>
          </div>
          <ThemeToggle />
          {user?.isAdmin ? (
            <Button asChild variant="primary" size="sm">
              <Link to="/admin">
                <Settings2 className="size-4" />
                <span className="hidden sm:inline">Administração</span>
              </Link>
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={handleSignOut}>
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-ink-100 px-4 py-1.5 text-xs sm:hidden">
        <span className="font-display font-semibold uppercase tracking-[0.18em] text-ink-400">
          Catálogo de Máquinas
        </span>
        <span className="truncate text-ink-500">
          {user?.name ?? "—"} · {user?.roleLabel ?? ""}
        </span>
      </div>
    </header>
  );
}
