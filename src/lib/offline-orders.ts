import { z } from "zod";
const orderSchema = z.object({ id: z.string(), number: z.number(), customer_name: z.string(), customer_phone: z.string(), mode: z.string(), address: z.string(), payment_method: z.string(), payment_status: z.enum(["pendente", "pago", "estornado"]), status: z.enum(["novo", "em_preparo", "pronto", "saiu_entrega", "entregue", "cancelado"]), subtotal: z.number(), delivery_fee: z.number(), total: z.number(), notes: z.string(), created_at: z.string(), order_items: z.array(z.object({ name: z.string(), qty: z.number(), unit_price: z.number() })) });
const schema = z.object({ userId: z.string(), savedAt: z.string().datetime(), orders: z.array(orderSchema).max(100) });
export type OfflineOrders = z.infer<typeof schema>;
const key = (id: string) => `carina:offline-orders:${id}`;
export function parseOfflineOrders(raw: string | null, userId: string): OfflineOrders | null {
  try { const snapshot = schema.parse(JSON.parse(raw ?? "null")); return snapshot.userId === userId ? snapshot : null; } catch { return null; }
}
export function readOfflineOrders(id: string) { try { return parseOfflineOrders(localStorage.getItem(key(id)), id); } catch { return null; } }
export function saveOfflineOrders(userId: string, orders: OfflineOrders["orders"]) {
  const snapshot = schema.parse({ userId, orders, savedAt: new Date().toISOString() });
  localStorage.setItem(key(userId), JSON.stringify(snapshot)); return snapshot;
}
export function clearOfflineOrders() { for (const name of Object.keys(localStorage)) if (name.startsWith("carina:offline-orders:")) localStorage.removeItem(name); }