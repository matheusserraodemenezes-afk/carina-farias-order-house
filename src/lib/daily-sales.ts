import { z } from "zod";

export const localDay = (date: string | Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Belem", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(date));
const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((v) => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, "Data inválida");
export const dailySalesSchema = z.object({ from: daySchema, to: daySchema }).refine((v) => v.to >= v.from && Date.parse(v.to) - Date.parse(v.from) <= 92 * 86400000, "Escolha um período de até 93 dias.");
export type SalesOrder = { created_at: string; completed_at: string | null; total: number | string; status: string; payment_status: string };
export function dailySales(orders: SalesOrder[], from: string, to: string) {
  const days = new Map<string, { day: string; orders: number; completed: number; value: number; paid: number; pending: number; refunded: number; statuses: Record<string, number> }>();
  for (let date = Date.parse(from); date <= Date.parse(to); date += 86400000) {
    const day = new Date(date).toISOString().slice(0, 10);
    days.set(day, { day, orders: 0, completed: 0, value: 0, paid: 0, pending: 0, refunded: 0, statuses: {} });
  }
  for (const order of orders) {
    const row = days.get(localDay(order.created_at));
    if (row) {
      const amount = Math.round(Number(order.total) * 100);
      row.orders++; row.statuses[order.status] = (row.statuses[order.status] ?? 0) + 1;
      if (order.payment_status === "estornado") row.refunded += amount;
      if (order.status !== "cancelado" && order.payment_status !== "estornado") {
        row.value += amount;
        if (order.payment_status === "pago") row.paid += amount;
        if (order.payment_status === "pendente") row.pending += amount;
      }
    }
    if (order.completed_at) {
      const completedDay = days.get(localDay(order.completed_at));
      if (completedDay) completedDay.completed++;
    }
  }
  return [...days.values()].reverse().map((row) => ({ ...row, value: row.value / 100, paid: row.paid / 100, pending: row.pending / 100, refunded: row.refunded / 100 }));
}