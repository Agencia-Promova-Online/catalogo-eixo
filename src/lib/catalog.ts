import { supabase } from "@/integrations/supabase/client";

export const MACHINE_BUCKET = "machine-photos";

export type MachineStatus = "disponivel" | "negociacao" | "vendida" | "indisponivel";
export type SpecValidationStatus = "confirmed" | "review" | "not_confirmed";

export const STATUS_META: Record<MachineStatus, { label: string; dot: string; color: string }> = {
  disponivel: { label: "DISPONÍVEL", dot: "🟢", color: "bg-status-available" },
  negociacao: { label: "EM NEGOCIAÇÃO", dot: "🟡", color: "bg-status-negotiating" },
  vendida: { label: "VENDIDA", dot: "🔴", color: "bg-status-sold" },
  indisponivel: { label: "INDISPONÍVEL", dot: "⚪", color: "bg-status-unavailable" },
};

export const VALIDATION_STATUS_META: Record<SpecValidationStatus, { label: string; icon: string; color: string }> = {
  confirmed: { label: "CONFIRMADO", icon: "✓", color: "text-green-500" },
  review: { label: "REVISAR", icon: "⚠", color: "text-amber-500" },
  not_confirmed: { label: "NÃO CONFIRMADO", icon: "❌", color: "text-red-500" },
};

export const STATUS_OPTIONS = Object.entries(STATUS_META).map(([value, meta]) => ({
  value: value as MachineStatus,
  label: `${meta.dot} ${meta.label}`,
}));

export const PHOTO_LABELS = [
  "Principal",
  "Lateral",
  "Traseira",
  "Cabine",
  "Motor",
  "Implementos",
  "Outras",
];

export type Machine = {
  id: string;
  code: string | null;
  brand: string;
  model: string;
  display_name: string;
  category: string;
  description: string | null;
  notes: string | null;
  year: number | null;
  price: number | null;
  down_payment: number | null;
  installment: number | null;
  power: string | null;
  operating_weight: string | null;
  hours: string | null;
  location: string | null;
  condition: string | null;
  max_digging_depth: string | null;
  bucket_capacity: string | null;
  bucket_capacity_front: string | null;
  bucket_capacity_rear: string | null;
  max_reach: string | null;
  dump_height: string | null;
  engine: string | null;
  transmission: string | null;
  hydraulic_system: string | null;
  hydraulic_flow: string | null;
  hydraulic_pressure: string | null;
  digging_force: string | null;
  dimensions: string | null;
  tank_capacity: string | null;
  max_speed: string | null;
  qualities: string[] | null;
  applications: string[] | null;
  status: string;
  version_config: string | null;
  technical_source: string | null;
  technical_last_validated_at: string | null;
  technical_validated_by: string | null;
  status_power: SpecValidationStatus;
  status_operating_weight: SpecValidationStatus;
  status_max_digging_depth: SpecValidationStatus;
  status_bucket_capacity: SpecValidationStatus;
  status_max_reach: SpecValidationStatus;
  status_dump_height: SpecValidationStatus;
  status_engine: SpecValidationStatus;
  status_transmission: SpecValidationStatus;
  status_hydraulic_flow: SpecValidationStatus;
  created_at: string;
  updated_at: string;
  main_photo?: MachineImage | null;
};

export type MachineImage = {
  id: string;
  machine_id: string;
  image_url: string;
  storage_path: string;
  label: string | null;
  is_main: boolean;
  sort_order: number;
  created_at: string;
  ai_generated?: boolean;
};

export function machineTitle(machine: Pick<Machine, "display_name">): string {
  return machine.display_name;
}

export async function fetchMachines(): Promise<Machine[]> {
  const { data, error } = await supabase
    .from("machines")
    .select(`
      *,
      main_photo:machine_images!machine_images_machine_id_fkey(
        id, machine_id, image_url, storage_path, label, is_main, sort_order, created_at, ai_generated
      )
    `)
    .order("code", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const photos: MachineImage[] = Array.isArray(row.main_photo) ? row.main_photo : [];
    // Prioridade ESTRITA para escolher a miniatura principal.
    // 1. Foto REAL (ai_generated=false) marcada como is_main=true  ← MÁXIMA PRIORIDADE
    // 2. Qualquer foto marcada como is_main=true (fallback ilustrativa)
    // 3. Primeira FOTO REAL (qualquer uma, por sort_order)
    // 4. Primeira foto de qualquer tipo (último fallback)
    const main =
      photos.find((img) => img.is_main === true && img.ai_generated === false) ??
      photos.find((img) => img.is_main === true) ??
      photos.find((img) => img.ai_generated === false) ??
      photos[0] ??
      null;

    return {
      ...row,
      main_photo: main,
    };
  }) as Machine[];
}

export async function fetchMachine(id: string): Promise<Machine | null> {
  const { data, error } = await supabase.from("machines").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Machine | null;
}

export async function fetchImages(machineId: string): Promise<MachineImage[]> {
  const { data, error } = await supabase
    .from("machine_images")
    .select("*")
    .eq("machine_id", machineId)
    .order("is_main", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MachineImage[];
}

/** Apenas as imagens ilustrativas geradas por IA (fallback visual). */
export async function fetchAiImages(machineId: string): Promise<MachineImage[]> {
  const { data, error } = await supabase
    .from("machine_images")
    .select("*")
    .eq("machine_id", machineId)
    .eq("ai_generated", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MachineImage[];
}

/** Apenas as fotos reais carregadas (upload). */
export async function fetchRealImages(machineId: string): Promise<MachineImage[]> {
  const { data, error } = await supabase
    .from("machine_images")
    .select("*")
    .eq("machine_id", machineId)
    .eq("ai_generated", false)
    .order("is_main", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MachineImage[];
}

/** Todas as imagens ilustrativas (IA) — dashboard e visão geral. */
export async function fetchAllAiImages(): Promise<MachineImage[]> {
  const { data, error } = await supabase
    .from("machine_images")
    .select("*")
    .eq("ai_generated", true)
    .order("machine_id")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MachineImage[];
}

/** Todas as imagens cadastradas (reais + ilustrativas) — contagem dashboard. */
export async function fetchAllImages(): Promise<MachineImage[]> {
  const { data, error } = await supabase
    .from("machine_images")
    .select("*")
    .order("machine_id")
    .order("is_main", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MachineImage[];
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export type MachineChangeLog = {
  id: string;
  machine_id: string | null;
  machine_label: string;
  user_id: string | null;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
};

export async function fetchChangeLog(): Promise<MachineChangeLog[]> {
  const { data, error } = await supabase
    .from("machine_change_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as MachineChangeLog[];
}

export async function fetchSettings() {
  const { data, error } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

/**
 * Bucket "machine-photos" — usado para imagens ilustrativas e uploads reais.
 * Retorna URL pública construída a partir do storage_path.
 * Se já for URL http, retorna como está.
 *
 * Safe: aceita `null`/`undefined` (máquina sem foto cadastrada) e retorna null.
 */
export function publicImageUrl(
  image: { image_url?: string | null; storage_path?: string | null } | null | undefined,
): string | null {
  if (!image) return null;
  const path = image.storage_path ?? image.image_url;
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = supabase.storage.from(MACHINE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function buildSignedImages(images: MachineImage[]): Record<string, string> {
  const entries = images.map((img) => [img.id, publicImageUrl(img) ?? ""] as const);
  return Object.fromEntries(entries.filter(([, url]) => Boolean(url)) as [string, string][]);
}

/** @deprecated Mantida p/ compatibilidade transitória — use `publicImageUrl` (URL pública). */
export async function signImage(
  image: Pick<MachineImage, "image_url" | "storage_path"> | null | undefined,
) {
  return publicImageUrl(image);
}

/** @deprecated Mantida p/ compatibilidade transitória — use `buildSignedImages`. */
export async function signImages(images: MachineImage[]): Promise<Record<string, string>> {
  return buildSignedImages(images);
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function matchesSearch(machine: Machine, term: string): boolean {
  const query = normalizeText(term);
  if (!query) return true;
  const haystack = normalizeText(
    [machine.display_name, machine.brand, machine.model, machine.category, machine.code, machine.description]
      .filter(Boolean)
      .join(" "),
  );
  return query.split(/\s+/).every((word) => haystack.includes(word));
}
