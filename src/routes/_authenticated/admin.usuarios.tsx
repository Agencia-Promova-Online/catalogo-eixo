import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createUser,
  deleteUser,
  listUsers,
  setUserActive,
  setUserPassword,
  setUserRole,
} from "@/lib/users.functions";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Equipe | Eixo-Catálogo" },
      { name: "description", content: "Cadastro e gestão de SDRs, vendedores e administradores do catálogo Eixo." },
      { property: "og:title", content: "Equipe | Eixo-Catálogo" },
      { property: "og:description", content: "Gestão de acessos do time comercial." },
      { property: "og:locale", content: "pt_BR" },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "vendedor" });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }

  const create = useMutation({
    mutationFn: () =>
      createUser({
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role as "admin" | "vendedor",
        },
      }),
    onSuccess: () => {
      toast.success("Usuário criado!");
      setForm({ name: "", email: "", password: "", role: "vendedor" });
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase">Usuários</h2>
        <p className="text-sm text-muted-foreground">Cada funcionário tem o seu próprio acesso.</p>
      </div>

      <form
        className="grid gap-4 rounded-xl border bg-card p-4 shadow-card sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="u-name">Nome</Label>
          <Input id="u-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="u-email">E-mail</Label>
          <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="u-pass">Senha (mín. 8)</Label>
          <Input id="u-pass" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} maxLength={72} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="u-role">Perfil</Label>
          <select
            id="u-role"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="vendedor">Vendedor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" size="lg" disabled={create.isPending}>
            <UserPlus className="size-4" /> CRIAR USUÁRIO
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {(users.data ?? []).map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-card p-3 shadow-card"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {user.email} · {user.role === "admin" ? "Administrador" : "Vendedor"} ·{" "}
                {user.active ? "Ativo" : "Inativo"}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={user.role}
                onChange={async (event) => {
                  try {
                    await setUserRole({
                      data: { userId: user.id, role: event.target.value as "admin" | "vendedor" },
                    });
                    toast.success("Perfil atualizado.");
                    refresh();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Falha ao atualizar.");
                  }
                }}
              >
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  try {
                    await setUserActive({ data: { userId: user.id, active: !user.active } });
                    toast.success(user.active ? "Usuário desativado." : "Usuário ativado.");
                    refresh();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Falha ao atualizar.");
                  }
                }}
              >
                {user.active ? "DESATIVAR" : "ATIVAR"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const password = window.prompt("Nova senha (mín. 8 caracteres):");
                  if (!password) return;
                  try {
                    await setUserPassword({ data: { userId: user.id, password } });
                    toast.success("Senha redefinida.");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Falha ao redefinir.");
                  }
                }}
              >
                <KeyRound className="size-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (!window.confirm(`Excluir ${user.name}?`)) return;
                  try {
                    await deleteUser({ data: { userId: user.id } });
                    toast.success("Usuário excluído.");
                    refresh();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Falha ao excluir.");
                  }
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
