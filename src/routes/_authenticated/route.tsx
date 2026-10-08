import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Proteção extra: evitar redirect loops infinitos quando o proxy Supabase
    // lançar exceção (falta secrets, falha de rede, etc). Sem este try/catch,
    // beforeLoad re-tenta eternamente em microtask loop, crashando o Chrome
    // com "Página sem resposta".
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        throw redirect({ to: "/auth", replace: true });
      }
      return { user: data.session.user };
    } catch (maybeRedirectOrError) {
      // redirects do TanStack são objetos com Symbol(redirect) — precisamos
      // re-lançar apenas esses redirects; errors reais são apenas logados.
      if (
        maybeRedirectOrError !== null &&
        typeof maybeRedirectOrError === "object" &&
        // TanStack marca redirect com uma flag. Re-throw se for redirect.
        ((maybeRedirectOrError as any).code === "REDIRECT" ||
          (maybeRedirectOrError as any).statusCode === 302 ||
          (maybeRedirectOrError as any).statusCode === 301 ||
          (maybeRedirectOrError as any).headers instanceof Headers)
      ) {
        throw maybeRedirectOrError;
      }
      // Erro real (ex: falha inicialização Supabase). Em vez de lançar e
      // causar loop, redireciona para auth explicitamente sem throw de erro.
      // eslint-disable-next-line no-console
      console.warn("[auth:beforeLoad] Não foi possível validar sessão — redirecionando para /auth:", maybeRedirectOrError);
      throw redirect({ to: "/auth", replace: true });
    }
  },
  component: () => <Outlet />,
});
