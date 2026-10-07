import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias | Eixo-Catálogo" },
      { name: "description", content: "Criação e manutenção das categorias usadas nos filtros do catálogo Eixo." },
      { property: "og:title", content: "Categorias | Eixo-Catálogo" },
      { property: "og:description", content: "Organização dos filtros do catálogo." },
      { property: "og:locale", content: "pt_BR" },
    ],
  }),
  component: AdminCategories,
});

function AdminCategories() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  const create = useMutation({
    mutationFn: async () => {
      const value = name.trim().toUpperCase();
      if (value.length < 2) throw new Error("Informe o nome da categoria.");
      const { error } = await supabase.from("categories").insert({ name: value, active: true });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Categoria criada.");
      setName("");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold uppercase">Categorias</h2>
        <p className="text-sm text-muted-foreground">Usadas nos filtros rápidos do catálogo.</p>
      </div>

      <form
        className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <div className="min-w-[200px] flex-1 space-y-1.5">
          <Label htmlFor="cat">Nova categoria</Label>
          <Input id="cat" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} />
        </div>
        <Button type="submit" size="lg" disabled={create.isPending}>
          <Plus className="size-4" /> ADICIONAR
        </Button>
      </form>

      <div className="space-y-2">
        {(categories.data ?? []).map((category) => (
          <div
            key={category.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-card p-3 shadow-card"
          >
            <p className="truncate font-display text-lg font-semibold uppercase">{category.name}</p>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  const { error } = await supabase
                    .from("categories")
                    .update({ active: !category.active })
                    .eq("id", category.id);
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  refresh();
                }}
              >
                {category.active ? "OCULTAR" : "MOSTRAR"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (!window.confirm(`Excluir ${category.name}?`)) return;
                  const { error } = await supabase.from("categories").delete().eq("id", category.id);
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  toast.success("Categoria excluída.");
                  refresh();
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
