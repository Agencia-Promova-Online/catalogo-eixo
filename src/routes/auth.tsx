import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        throw redirect({ to: "/catalogo", replace: true });
      }
    } catch (err) {
      const isRedirect =
        err !== null &&
        typeof err === "object" &&
        ((err as any).code === "REDIRECT" ||
          (err as any).statusCode === 302 ||
          (err as any).statusCode === 301 ||
          (err as any).headers instanceof Headers);
      if (isRedirect) throw err;
    }
  },
  head: () => ({
    meta: [
      { title: "Acesso Interno | Eixo-Catálogo" },
      {
        name: "description",
        content:
          "Área de acesso restrito do time comercial Eixo — SDRs e vendedores consultam o catálogo interno de máquinas.",
      },
      { property: "og:title", content: "Acesso Interno | Eixo-Catálogo" },
      {
        property: "og:description",
        content: "Catálogo interno de máquinas do time comercial Eixo.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Informe o e-mail e a senha.");
      return;
    }

    try {
      setLoading(true);
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError || !data.session) {
        const msg =
          signInError?.message?.includes("Invalid") ||
          signInError?.message?.includes("credentials")
            ? "Credenciais inválidas. Verifique seu e-mail e senha."
            : signInError?.message || "Falha ao autenticar.";
        setError(msg);
        toast.error(msg);
        return;
      }

      toast.success("Login realizado com sucesso. Redirecionando…");
      navigate({ to: "/catalogo", replace: true });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro inesperado ao fazer login.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      <main className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-10">
        <section
          aria-labelledby="auth-heading"
          className="w-full max-w-md rounded-2xl border border-stone-200/70 bg-white p-8 shadow-xl"
        >
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <img
              src="/brand/logo.svg"
              alt="Eixo-Catálogo"
              className="h-11 w-auto drop-shadow-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.visibility =
                  "hidden";
              }}
            />
            <span className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-600">
              Catálogo
            </span>
            <div className="mt-4 space-y-1">
              <h1
                id="auth-heading"
                className="text-2xl font-semibold tracking-tight text-stone-900"
              >
                Área administrativa
              </h1>
              <h2 className="text-sm font-normal text-stone-500">
                Acesso da equipe
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-stone-700">
                E-mail
              </Label>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@eixoconsorcios.com.br"
                  className="h-11 rounded-xl border-stone-200 bg-stone-50/60 pl-9 pr-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus-visible:ring-amber-500/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-stone-700"
              >
                Senha
              </Label>
              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Sua senha de acesso"
                  className="h-11 rounded-xl border-stone-200 bg-stone-50/60 pl-9 pr-3 text-stone-900 placeholder:text-stone-400 focus:bg-white focus-visible:ring-amber-500/30"
                />
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-sm font-semibold uppercase tracking-[0.18em] text-stone-900 shadow-md shadow-amber-500/20 transition hover:shadow-lg hover:shadow-amber-500/30 focus-visible:ring-amber-500/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-stone-500">
            Cada funcionário possui um usuário próprio. Solicite o acesso ao
            administrador.
          </p>
        </section>
      </main>
    </div>
  );
}
