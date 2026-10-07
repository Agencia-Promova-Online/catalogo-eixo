import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoFrame } from "@/components/PhotoFrame";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchCategories,
  fetchImages,
  fetchMachine,
  buildSignedImages,
  PHOTO_LABELS,
  STATUS_OPTIONS,
  VALIDATION_STATUS_META,
  MACHINE_BUCKET,
  publicImageUrl,
  type MachineImage,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/_authenticated/admin/maquinas/$id")({
  head: () => ({
    meta: [
      { title: "Cadastro de Máquina | Eixo-Catálogo" },
      {
        name: "description",
        content: "Formulário de cadastro e edição de máquinas, valores, especificações e imagens.",
      },
      { property: "og:title", content: "Cadastro de Máquina | Eixo-Catálogo" },
      { property: "og:description", content: "Gestão de máquinas do catálogo Eixo." },
      { property: "og:locale", content: "pt_BR" },
    ],
  }),
  component: MachineForm,
});

type FormState = {
  code: string;
  display_name: string;
  brand: string;
  model: string;
  category: string;
  year: string;
  price: string;
  down_payment: string;
  installment: string;
  power: string;
  operating_weight: string;
  hours: string;
  location: string;
  status: string;
  description: string;
  notes: string;
  version_config: string;
  technical_source: string;
  status_power: string;
  status_operating_weight: string;
  status_max_digging_depth: string;
  status_bucket_capacity: string;
  status_max_reach: string;
  status_dump_height: string;
  status_engine: string;
  status_transmission: string;
  status_hydraulic_flow: string;
};

const EMPTY: FormState = {
  code: "",
  display_name: "",
  brand: "",
  model: "",
  category: "",
  year: "",
  price: "",
  down_payment: "",
  installment: "",
  power: "",
  operating_weight: "",
  hours: "",
  location: "",
  status: "disponivel",
  description: "",
  notes: "",
  version_config: "Não especificada",
  technical_source: "",
  status_power: "not_confirmed",
  status_operating_weight: "not_confirmed",
  status_max_digging_depth: "not_confirmed",
  status_bucket_capacity: "not_confirmed",
  status_max_reach: "not_confirmed",
  status_dump_height: "not_confirmed",
  status_engine: "not_confirmed",
  status_transmission: "not_confirmed",
  status_hydraulic_flow: "not_confirmed",
};

function toNumber(value: string): number | null {
  const cleaned = value.replace(/\./g, "").replace(",", ".").trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function MachineForm() {
  const { id } = Route.useParams();
  const isNew = id === "nova";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [uploading, setUploading] = useState(false);

  const categories = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const machine = useQuery({
    queryKey: ["machine", id],
    queryFn: () => fetchMachine(id),
    enabled: !isNew,
  });
  const images = useQuery({
    queryKey: ["images", id],
    queryFn: () => fetchImages(id),
    enabled: !isNew,
  });
  const signed = useMemo(
    () => buildSignedImages(images.data ?? []),
    [images.data],
  );
  const uploaded = useMemo(
    () => (images.data ?? []) as MachineImage[],
    [images.data],
  );

  useEffect(() => {
    const data = machine.data;
    if (!data) return;
    setForm({
      code: data.code ?? "",
      display_name: data.display_name ?? "",
      brand: data.brand ?? "",
      model: data.model ?? "",
      category: data.category ?? "",
      year: data.year ? String(data.year) : "",
      price: data.price ? String(data.price) : "",
      down_payment: data.down_payment ? String(data.down_payment) : "",
      installment: data.installment ? String(data.installment) : "",
      power: data.power ?? "",
      operating_weight: data.operating_weight ?? "",
      hours: data.hours ?? "",
      location: data.location ?? "",
      status: data.status ?? "disponivel",
      description: data.description ?? "",
      notes: data.notes ?? "",
      version_config: data.version_config ?? "Não especificada",
      technical_source: data.technical_source ?? "",
      status_power: data.status_power || "not_confirmed",
      status_operating_weight: data.status_operating_weight || "not_confirmed",
      status_max_digging_depth: data.status_max_digging_depth || "not_confirmed",
      status_bucket_capacity: data.status_bucket_capacity || "not_confirmed",
      status_max_reach: data.status_max_reach || "not_confirmed",
      status_dump_height: data.status_dump_height || "not_confirmed",
      status_engine: data.status_engine || "not_confirmed",
      status_transmission: data.status_transmission || "not_confirmed",
      status_hydraulic_flow: data.status_hydraulic_flow || "not_confirmed",
    });
  }, [machine.data]);

  const categoryOptions = useMemo(
    () => (categories.data ?? []).filter((row) => row.active).map((row) => row.name),
    [categories.data],
  );

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        code: form.code.trim() || null,
        display_name: form.display_name.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        category: form.category.trim() || categoryOptions[0] || "OUTRAS",
        year: form.year ? Number(form.year) : null,
        price: toNumber(form.price),
        down_payment: toNumber(form.down_payment),
        installment: toNumber(form.installment),
        power: form.power.trim() || null,
        operating_weight: form.operating_weight.trim() || null,
        hours: form.hours.trim() || null,
        location: form.location.trim() || null,
        status: form.status,
        description: form.description.trim() || null,
        notes: form.notes.trim() || null,
        version_config: form.version_config.trim() || "Não especificada",
        technical_source: form.technical_source.trim() || null,
        status_power: form.status_power as any,
        status_operating_weight: form.status_operating_weight as any,
        status_max_digging_depth: form.status_max_digging_depth as any,
        status_bucket_capacity: form.status_bucket_capacity as any,
        status_max_reach: form.status_max_reach as any,
        status_dump_height: form.status_dump_height as any,
        status_engine: form.status_engine as any,
        status_transmission: form.status_transmission as any,
        status_hydraulic_flow: form.status_hydraulic_flow as any,
        technical_last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (!payload.brand || !payload.model) throw new Error("Informe marca e modelo.");

      if (isNew) {
        const { data, error } = await supabase.from("machines").insert(payload).select("id").single();
        if (error) throw new Error(error.message);
        return data.id as string;
      }
      const { error } = await supabase.from("machines").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: (savedId) => {
      toast.success("Máquina salva!");
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      queryClient.invalidateQueries({ queryKey: ["machine", savedId] });
      if (isNew) navigate({ to: "/admin/maquinas/$id", params: { id: savedId }, replace: true });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function handleUpload(files: FileList | null, label: string) {
    if (!files?.length || isNew) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const mime = file.type;
        if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
          toast.error(`Formato ${mime} não suportado. Use JPG, PNG ou WebP.`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} excede 10 MB.`);
          continue;
        }
        const extension = mime.split("/")[1] ?? "webp";
        const name = `${crypto.randomUUID()}.${extension}`;
        const path = `${id}/${name}`;
        const { error: upErr } = await supabase.storage
          .from(MACHINE_BUCKET)
          .upload(path, file, {
            cacheControl: "public, max-age=31536000, immutable",
            contentType: mime,
            upsert: false,
          });
        if (upErr) throw new Error(upErr.message);

        const publicUrl = publicImageUrl({ storage_path: path });
        const hasMain = (images.data ?? []).some((img) => img.is_main);
        const { error: insErr } = await supabase.from("machine_images").insert({
          machine_id: id,
          image_url: publicUrl ?? path,
          storage_path: path,
          label,
          is_main: !hasMain,
          ai_generated: false,
          sort_order: (images.data ?? []).length + 1,
        });
        if (insErr) throw new Error(insErr.message);
      }
      toast.success("Fotos enviadas!");
      await queryClient.invalidateQueries({ queryKey: ["images", id] });
      await queryClient.invalidateQueries({ queryKey: ["all-images"] });
      await queryClient.invalidateQueries({ queryKey: ["machines"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha no envio da foto.");
    } finally {
      setUploading(false);
    }
  }

  async function setMain(imageId: string) {
    try {
      const { error: err1 } = await supabase
        .from("machine_images")
        .update({ is_main: false })
        .eq("machine_id", id);
      if (err1) throw new Error(err1.message);
      const { error: err2 } = await supabase
        .from("machine_images")
        .update({ is_main: true })
        .eq("id", imageId);
      if (err2) throw new Error(err2.message);
      toast.success("Foto principal definida.");
      await queryClient.invalidateQueries({ queryKey: ["images", id] });
      await queryClient.invalidateQueries({ queryKey: ["all-images"] });
      await queryClient.invalidateQueries({ queryKey: ["machines"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao definir foto principal.");
    }
  }

  async function removeImage(imageId: string) {
    if (!window.confirm("Excluir esta foto? Ação não pode ser desfeita.")) return;
    try {
      const list = images.data ?? [];
      const target = list.find((img) => img.id === imageId);
      if (target?.storage_path) {
        await supabase.storage.from(MACHINE_BUCKET).remove([target.storage_path]).catch(() => null);
      }
      const { error } = await supabase.from("machine_images").delete().eq("id", imageId);
      if (error) throw new Error(error.message);
      toast.success("Foto excluída.");
      await queryClient.invalidateQueries({ queryKey: ["images", id] });
      await queryClient.invalidateQueries({ queryKey: ["all-images"] });
      await queryClient.invalidateQueries({ queryKey: ["machines"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir foto.");
    }
  }

  return (
    <section className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/admin">
          <ArrowLeft className="size-4" /> VOLTAR
        </Link>
      </Button>

      <h2 className="font-display text-2xl font-bold uppercase">
        {isNew ? "Nova máquina" : "Editar máquina"}
      </h2>

      <form
        className="space-y-4 rounded-xl border bg-card p-4 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Código">
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} maxLength={20} />
          </Field>
          <Field label="Categoria">
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Selecione...</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Marca *">
            <Input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              required
              maxLength={80}
            />
          </Field>
          <Field label="Nome oficial (exibido para todos)">
            <Input
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="Preenchido automaticamente com marca + modelo"
              maxLength={160}
            />
          </Field>
          <Field label="Modelo *">
            <Input
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              required
              maxLength={120}
            />
          </Field>
          <Field label="Valor (R$)">
            <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} inputMode="decimal" />
          </Field>
          <Field label="Entrada (R$)">
            <Input
              value={form.down_payment}
              onChange={(e) => setForm({ ...form, down_payment: e.target.value })}
              inputMode="decimal"
            />
          </Field>
          <Field label="Parcela a partir de (R$)">
            <Input
              value={form.installment}
              onChange={(e) => setForm({ ...form, installment: e.target.value })}
              inputMode="decimal"
            />
          </Field>
          <Field label="Ano">
            <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} inputMode="numeric" />
          </Field>
          <Field label="Potência">
            <Input value={form.power} onChange={(e) => setForm({ ...form, power: e.target.value })} maxLength={60} />
          </Field>
          <Field label="Peso operacional">
            <Input
              value={form.operating_weight}
              onChange={(e) => setForm({ ...form, operating_weight: e.target.value })}
              maxLength={60}
            />
          </Field>
          <Field label="Horas de uso">
            <Input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} maxLength={60} />
          </Field>
          <Field label="Localização">
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              maxLength={120}
            />
          </Field>
          <Field label="Status">
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Descrição">
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            maxLength={2000}
          />
        </Field>
        <Field label="Observações">
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            maxLength={1000}
          />
        </Field>

        <Button type="submit" size="lg" disabled={save.isPending}>
          SALVAR MÁQUINA
        </Button>
      </form>

      <div className="panel p-6 space-y-6">
        <div>
          <h3 className="font-display text-xl font-bold uppercase tracking-tight">Validação Técnica e Fontes</h3>
          <p className="text-sm text-muted-foreground">
            Defina a confiabilidade das especificações técnicas com base em fontes oficiais.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Field label="Versão / Configuração (Ex: CORE, PRO, ULTRA)">
              <Input 
                value={form.version_config} 
                onChange={(e) => setForm({ ...form, version_config: e.target.value })} 
                placeholder="Ex: CORE, PRO, PLUS..." 
              />
            </Field>
            <Field label="Fonte da Especificação (Ex: Catálogo Oficial Caterpillar)">
              <Input 
                value={form.technical_source} 
                onChange={(e) => setForm({ ...form, technical_source: e.target.value })} 
                placeholder="Ex: Fabricante, Ficha Técnica Oficial..." 
              />
            </Field>
          </div>

          <div className="rounded-xl bg-secondary/20 p-4 border border-white/5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status de Validação por Campo</h4>
            
            <div className="grid gap-3">
              <ValidationField 
                label="Potência" 
                value={form.status_power} 
                onChange={(v) => setForm({ ...form, status_power: v })} 
              />
              <ValidationField 
                label="Peso Operacional" 
                value={form.status_operating_weight} 
                onChange={(v) => setForm({ ...form, status_operating_weight: v })} 
              />
              <ValidationField 
                label="Profundidade Máxima" 
                value={form.status_max_digging_depth} 
                onChange={(v) => setForm({ ...form, status_max_digging_depth: v })} 
              />
              <ValidationField 
                label="Capacidade Caçamba" 
                value={form.status_bucket_capacity} 
                onChange={(v) => setForm({ ...form, status_bucket_capacity: v })} 
              />
              <ValidationField 
                label="Motor" 
                value={form.status_engine} 
                onChange={(v) => setForm({ ...form, status_engine: v })} 
              />
              <ValidationField 
                label="Transmissão" 
                value={form.status_transmission} 
                onChange={(v) => setForm({ ...form, status_transmission: v })} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-card">
        <h3 className="font-display text-xl font-bold uppercase">Fotos reais (exibidas no catálogo)</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Envie fotos reais da máquina. O backend comprime automaticamente para WebP 1600px (max),
          qualidade 80. A primeira foto enviada torna-se a principal automaticamente.
        </p>

        {isNew ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Salve a máquina primeiro para enviar as fotos.
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {PHOTO_LABELS.map((label) => (
                <label
                  key={label}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-secondary px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide disabled:opacity-50"
                >
                  <Upload className="size-4" /> {label}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(event) => handleUpload(event.target.files, label)}
                  />
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Suporta JPG, PNG ou WebP • até 10 MB/arquivo • convertido e otimizado em WebP no servidor.
            </p>
            {uploading ? <p className="mt-2 text-sm text-muted-foreground">Comprimindo e enviando fotos...</p> : null}

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {uploaded.map((image) => (
                <div key={image.id} className="overflow-hidden rounded-lg border">
                  <PhotoFrame
                    src={signed[image.id] ?? null}
                    alt={image.label ?? "Foto"}
                    className="aspect-square w-full"
                  />
                  <div className="flex items-center justify-between gap-1 p-2">
                    <span className="truncate text-xs font-semibold uppercase">
                      {image.is_main ? "★ " : ""}
                      {image.label ?? "Foto"}
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant={image.is_main ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setMain(image.id)}
                        aria-label="Definir como principal"
                        title="Definir como principal"
                      >
                        <Star className={cn("size-4", image.is_main && "fill-amber-400 text-amber-500")} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImage(image.id)}
                        aria-label="Excluir foto"
                        title="Excluir foto"
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {uploaded.length === 0 && !uploading ? (
                <div className="col-span-full border-2 border-dashed border-ink-200 rounded-lg p-8 text-center">
                  <Upload className="size-10 text-ink-300 mx-auto mb-3" aria-hidden />
                  <p className="text-sm font-semibold text-ink-500 uppercase">Nenhuma foto enviada ainda</p>
                  <p className="text-xs text-ink-400 mt-1">
                    As fotos enviadas serão exibidas nesta grade e no catálogo público.
                  </p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ValidationField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-2 rounded-lg bg-background/40 border border-white/5">
      <span className="text-xs font-semibold truncate">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-7 rounded px-2 text-[10px] font-black uppercase tracking-tighter outline-none cursor-pointer",
          value === 'confirmed' ? "bg-green-500/10 text-green-500" :
          value === 'review' ? "bg-amber-500/10 text-amber-500" :
          "bg-red-500/10 text-red-500"
        )}
      >
        {Object.entries(VALIDATION_STATUS_META).map(([key, meta]) => (
          <option key={key} value={key} className="bg-background text-foreground">
            {meta.icon} {meta.label}
          </option>
        ))}
      </select>
    </div>
  );
}
