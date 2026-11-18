import { z } from "zod";

// Métricas do acompanhamento de pedidos (puras, testadas). Nunca incluem dados pessoais.
export const insightQuestionSchema = z.object({ question: z.string().trim().min(3).max(500) });

export type StatusCheck = { order_id: string; payment_status: string; order_status: string; mode: string; payment_method: string; created_at: string };
export type OrderRow = { id: string; created_at: string; payment_method: string; payment_status: string };

const count = (values: string[]) => values.reduce<Record<string, number>>((acc, v) => ((acc[v] = (acc[v] ?? 0) + 1), acc), {});
const round1 = (n: number) => Math.round(n * 10) / 10;

export function trackingMetrics(checks: StatusCheck[], orders: OrderRow[]) {
  const byOrder = new Map<string, StatusCheck[]>();
  for (const c of checks) byOrder.set(c.order_id, [...(byOrder.get(c.order_id) ?? []), c]);
  const created = new Map(orders.map((o) => [o.id, new Date(o.created_at).getTime()]));
  const firstDelays = [...byOrder.entries()].flatMap(([id, list]) => {
    const start = created.get(id);
    if (start === undefined) return [];
    const first = Math.min(...list.map((c) => new Date(c.created_at).getTime()));
    return [(first - start) / 60_000];
  });
  const pix = orders.filter((o) => o.payment_method === "pix");
  const pixTracked = pix.filter((o) => byOrder.has(o.id));
  const pixSawPaid = pixTracked.filter((o) => byOrder.get(o.id)!.some((c) => c.payment_status === "pago"));
  return {
    orders: orders.length,
    trackedOrders: byOrder.size,
    trackedShare: orders.length ? round1((byOrder.size / orders.length) * 100) : 0,
    checks: checks.length,
    checksPerTrackedOrder: byOrder.size ? round1(checks.length / byOrder.size) : 0,
    byPaymentStatus: count(checks.map((c) => c.payment_status)),
    byOrderStatus: count(checks.map((c) => c.order_status)),
    byMode: count(checks.map((c) => c.mode)),
    byPaymentMethod: count(checks.map((c) => c.payment_method)),
    pixOrders: pix.length,
    pixTracked: pixTracked.length,
    pixSawPaid: pixSawPaid.length,
    avgMinutesToFirstCheck: firstDelays.length ? round1(firstDelays.reduce((a, b) => a + b, 0) / firstDelays.length) : null,
  };
}
export type TrackingMetrics = ReturnType<typeof trackingMetrics>;

export const insightOutputSchema = z.object({
  summary: z.string().min(1).max(1500),
  patterns: z.array(z.string().min(1).max(400)).max(5),
  suggestions: z.array(z.object({ title: z.string().min(1).max(120), action: z.string().min(1).max(500) })).max(4),
});
export type TrackingInsight = z.infer<typeof insightOutputSchema>;
