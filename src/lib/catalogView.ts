import {
  Truck,
  Tractor,
  Construction,
  Boxes,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { normalizeText, type Machine } from "@/lib/catalog";

/** Ícone minimalista por categoria — apenas visual, não altera dados cadastrados. */
export function categoryIcon(name: string): LucideIcon {
  const key = normalizeText(name);
  if (key.includes("caminhao")) return Truck;
  if (key.includes("agricola") || key.includes("trator")) return Tractor;
  if (key.includes("carregadeira")) return Boxes;
  if (key.includes("escavadeira")) return Construction;
  return Wrench;
}

export type CountedOption = { name: string; count: number };

/** Marcas presentes no catálogo, ordenadas por quantidade de registros. */
export function brandOptions(machines: Machine[]): CountedOption[] {
  const map = new Map<string, number>();
  for (const machine of machines) {
    const brand = machine.brand?.trim();
    if (!brand) continue;
    map.set(brand, (map.get(brand) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Agrupa por categoria para organizar a listagem por modelos. */
export function groupByCategory(machines: Machine[]): { category: string; items: Machine[] }[] {
  const map = new Map<string, Machine[]>();
  for (const machine of machines) {
    const key = machine.category || "OUTRAS";
    const list = map.get(key) ?? [];
    list.push(machine);
    map.set(key, list);
  }
  return [...map.entries()]
    .map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.model.localeCompare(b.model)),
    }))
    .sort((a, b) => b.items.length - a.items.length || a.category.localeCompare(b.category));
}

/** Agrupa por marca e, dentro dela, por categoria — navegação marca › categoria › modelo. */
export function groupByBrand(
  machines: Machine[],
): { brand: string; categories: { category: string; items: Machine[] }[] }[] {
  const map = new Map<string, Machine[]>();
  for (const machine of machines) {
    const key = machine.brand?.trim() || "OUTRAS MARCAS";
    const list = map.get(key) ?? [];
    list.push(machine);
    map.set(key, list);
  }
  return [...map.entries()]
    .map(([brand, items]) => ({ brand, categories: groupByCategory(items) }))
    .sort((a, b) => a.brand.localeCompare(b.brand));
}
