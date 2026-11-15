import { z } from "zod";
import { MENU } from "./menu";

export const preferencesSchema = z.object({
  people: z.number().int().min(1).max(10),
  budget: z.number().min(1).max(2000).nullable(),
  meat: z.enum(["Qualquer", "Carne", "Frango", "Calabresa", "Bisteca", "Coração"]),
  drink: z.enum(["Qualquer", "Goiaba", "Acerola", "Caju", "Sem bebida"]),
  avoid: z.array(z.enum(["Carne", "Frango", "Calabresa", "Bisteca", "Coração"])).max(5),
  notes: z.string().trim().max(500),
});
export type Preferences = z.infer<typeof preferencesSchema>;
export const suggestionsSchema = z.object({
  message: z.string().max(500),
  combinations: z.array(z.object({
    title: z.string().min(1).max(80),
    reason: z.string().max(300),
    items: z.array(z.object({ id: z.string(), qty: z.number().int().min(1).max(10) })).min(1).max(10),
  })).max(3),
});

const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function eligibleMenu(preferences: Preferences) {
  return MENU.filter((item) => {
    if (item.category !== "Churrasco" && item.category !== "Sucos") return false;
    const name = normalized(item.name);
    if (preferences.avoid.some((avoid) => name.includes(normalized(avoid)))) return false;
    if (item.category === "Churrasco" && preferences.meat !== "Qualquer" && !name.includes(normalized(preferences.meat))) return false;
    if (item.category === "Sucos" && (preferences.drink === "Sem bebida" || (preferences.drink !== "Qualquer" && !name.includes(normalized(preferences.drink))))) return false;
    return true;
  });
}

export function validateSuggestions(raw: unknown, preferences: Preferences) {
  const parsed = suggestionsSchema.parse(raw);
  const allowed = eligibleMenu(preferences);
  const combinations = parsed.combinations.map((combo) => {
    const seen = new Set<string>();
    const items = combo.items.map((line) => {
      const item = allowed.find((entry) => entry.id === line.id);
      if (!item || seen.has(line.id)) throw new Error("Invalid menu item");
      seen.add(line.id);
      return { ...item, qty: line.qty };
    });
    const total = Math.round(items.reduce((sum, item) => sum + item.price * item.qty, 0) * 100) / 100;
    if (preferences.budget !== null && total > preferences.budget) throw new Error("Over budget");
    if (items.filter((item) => item.category === "Churrasco").reduce((sum, item) => sum + item.qty, 0) !== preferences.people) throw new Error("Invalid portions");
    if (preferences.drink !== "Sem bebida" && items.filter((item) => item.category === "Sucos").reduce((sum, item) => sum + item.qty, 0) !== preferences.people) throw new Error("Invalid drinks");
    return { title: combo.title, reason: combo.reason, items, total };
  });
  return { message: parsed.message, combinations };
}
export type Suggestions = ReturnType<typeof validateSuggestions>;