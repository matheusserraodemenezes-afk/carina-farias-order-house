import { z } from "zod";
import { MENU } from "./menu";

const money = (value: number) => Math.round(value * 100) / 100;
export const salesInputSchema = z.object({
  period: z.string().trim().min(1).max(80),
  orders: z.array(z.object({
    items: z.array(z.object({ id: z.string(), qty: z.number().int().min(1).max(100) }).strict()).min(1).max(60),
    paid: z.number().positive().max(100000),
  }).strict()).min(1).max(200),
}).strict().superRefine((data, ctx) => {
  data.orders.forEach((order, index) => {
    const ids = order.items.map((item) => item.id);
    if (new Set(ids).size !== ids.length || ids.some((id) => !MENU.some((item) => item.id === id))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["orders", index], message: "Use produtos do cardápio, sem duplicar produtos no mesmo pedido." });
    }
  });
});
export type SalesInput = z.infer<typeof salesInputSchema>;

export function salesMetrics(input: SalesInput) {
  const data = salesInputSchema.parse(input);
  const frequencies = new Map<string, number>();
  const products = new Map<string, number>();
  for (const order of data.orders) {
    order.items.forEach((item) => products.set(item.id, (products.get(item.id) ?? 0) + item.qty));
    const ids = order.items.map((item) => item.id).sort();
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const key = `${ids[i]}|${ids[j]}`;
      frequencies.set(key, (frequencies.get(key) ?? 0) + 1);
    }
  }
  const revenue = money(data.orders.reduce((sum, order) => sum + order.paid, 0));
  return {
    orderCount: data.orders.length, revenue, average: money(revenue / data.orders.length),
    products: [...products].map(([id, qty]) => ({ id, name: MENU.find((item) => item.id === id)?.name ?? id, qty })).sort((a, b) => b.qty - a.qty),
    pairs: [...frequencies].map(([key, count]) => ({ ids: key.split("|"), count, share: money(count / data.orders.length * 100) })).sort((a, b) => b.count - a.count).slice(0, 10),
  };
}

export const promotionOutputSchema = z.object({
  summary: z.string().min(1).max(1200),
  promotions: z.array(z.object({
    title: z.string().min(1).max(100),
    reason: z.string().min(1).max(600),
    action: z.string().min(1).max(500),
    items: z.array(z.object({ id: z.string(), qty: z.number().int().min(1).max(10) }).strict()).min(2).max(5),
    discountPercent: z.number().int().min(0).max(30),
  }).strict()).max(3),
}).strict();

export function validateSalesAnalysis(raw: unknown, average: number) {
  const result = promotionOutputSchema.parse(raw);
  return { summary: result.summary, promotions: result.promotions.map((promo) => {
    const seen = new Set<string>();
    const items = promo.items.map((line) => {
      const item = MENU.find((entry) => entry.id === line.id);
      if (!item || seen.has(line.id)) throw new Error("Invalid promotion product");
      seen.add(line.id);
      return { ...item, qty: line.qty };
    });
    const regular = money(items.reduce((sum, item) => sum + item.price * item.qty, 0));
    const suggested = money(regular * (1 - promo.discountPercent / 100));
    return { ...promo, items, regular, suggested, saving: money(regular - suggested), difference: money(suggested - average) };
  }) };
}
export type SalesAnalysis = ReturnType<typeof validateSalesAnalysis>;