import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | Eixo-Catálogo" },
      {
        name: "description",
        content: "Dados da empresa exibidos no catálogo comercial do time Eixo.",
      },
      { property: "og:title", content: "Configurações | Eixo-Catálogo" },
      { property: "og:description", content: "Ajuste as informações do catálogo Eixo." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSettings,
});

function AdminSettings() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const [form, setForm] = useState({ company_name: "", phone: "" });

  useEffect(() => {
    if (!settings.data) return;
    setForm({
      company_name: settings.data.company_name ?? "",
      phone: settings.data.phone ?? "",
    });
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("app_settings")
        .update({
          company_name: form.company_name.trim(),
          phone: form.phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", true);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Configurações salvas!");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase">Configurações</h2>
        <p className="text-sm text-muted-foreground">
          Catálogo interno de consulta — sem envio de mensagens ou controle de estoque.
        </p>
      </div>

      <form
        className="space-y-4 rounded-xl border bg-card p-4 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="company">Nome da empresa</Label>
            <Input
              id="company"
              value={form.company_name}
              onChange={(event) => setForm({ ...form, company_name: event.target.value })}
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone interno</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              maxLength={40}
            />
          </div>
        </div>

        <Button type="submit" size="lg" disabled={save.isPending}>
          SALVAR CONFIGURAÇÕES
        </Button>
      </form>
    </section>
  );
}
