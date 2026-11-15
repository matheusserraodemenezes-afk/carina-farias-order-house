import { MENU } from "./menu";

// A deterministic catalog selection: no model calls, invented prices or automatic additions.
export function cartSuggestions(cart: Record<string, number>) {
  const selected = MENU.filter((item) => (cart[item.id] ?? 0) > 0);
  if (!selected.length) return [];
  const hasFood = selected.some((item) => !["Sucos", "Refrigerantes"].includes(item.category));
  const preferredIds = hasFood ? ["s1", "r5", "s2", "r4", "l3", "sp1"] : ["c8", "l21", "sp1", "l3"];
  return preferredIds.flatMap((id) => {
    const item = MENU.find((entry) => entry.id === id);
    return item && !(cart[id] > 0) ? [item] : [];
  }).slice(0, 4);
}