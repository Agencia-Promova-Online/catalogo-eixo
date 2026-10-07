import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LockKeyhole, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapAdminStatus, createFirstAdmin } from "@/lib/users.functions";


export const Route = createFileRoute("/auth")({
  ssr: false,
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
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const bootstrap = useQuery({
    queryKey: ["bootstrap-admin"],
    queryFn: () => bootstrapAdminStatus(),
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/catalogo", replace: true });
    });
  }, [navigate]);

  const needsBootstrap = bootstrap.data?.needsBootstrap === true;

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error("E-mail ou senha inválidos.");
      return;
    }
    navigate({ to: "/catalogo", replace: true });
  }

  async function handleBootstrap(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await createFirstAdmin({ data: { name: name.trim(), email: email.trim(), password } });
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error(error.message);
      toast.success("Administrador criado com sucesso!");
      navigate({ to: "/catalogo", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar administrador.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-900 px-4 py-10 text-white">
      <div className="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-gold-500 blur-3xl opacity-5" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[30rem] rounded-full bg-gold-500 blur-3xl opacity-5" aria-hidden />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex w-16 h-16 items-center justify-center rounded-2xl bg-gold-500 shadow-[0_8px_30px_rgb(184,150,63,0.2)]">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <p className="font-display text-2xl font-semibold tracking-tight text-white">
            Eixo-<span className="text-gold-400">Catálogo</span>
          </p>
          <h1 className="mt-1 text-sm font-medium uppercase tracking-[0.28em] text-ink-400">
            Área administrativa
          </h1>
        </div>

        <div className="bg-white text-ink-900 rounded-2xl shadow-2xl p-8 animate-slide-up">
          <div className="mb-6 flex items-center gap-2">
            <LockKeyhole className="w-5 h-5 text-gold-500" />
            <h2 className="font-display text-xl font-semibold text-ink-900">
              {needsBootstrap ? "Criar administrador" : "Acesso da equipe"}
            </h2>
          </div>

          <form className="space-y-4" onSubmit={needsBootstrap ? handleBootstrap : handleSignIn}>
            {needsBootstrap ? (
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={120}
                  autoComplete="name"
                  className="mt-1.5"
                />
              </div>
            ) : null}

            <div>
              <Label htmlFor="email">E-mail</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden />
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  maxLength={255}
                  autoComplete="username"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1.5">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" aria-hidden />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={needsBootstrap ? 8 : 1}
                  maxLength={72}
                  autoComplete={needsBootstrap ? "new-password" : "current-password"}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mt-6" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {needsBootstrap ? "Criar e entrar" : "Entrar"}
            </Button>
          </form>

          <p className="mt-5 text-xs text-ink-400 leading-relaxed">
            {needsBootstrap
              ? "Nenhum administrador cadastrado ainda. Este primeiro acesso cria o administrador do sistema."
              : "Cada funcionário possui um usuário próprio. Solicite o acesso ao administrador."}
          </p>
        </div>
      </div>
    </main>
  );
}
