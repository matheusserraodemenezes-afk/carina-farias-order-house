import type { OrderStatus, PaymentStatus } from "./payments";

export type CustomerOrder = {
  id: string; number: number; customer_id: string | null; customer_name: string;
  customer_phone: string; created_at: string; total: number;
  status: OrderStatus; payment_status: PaymentStatus; payment_method: string;
  order_items: { name: string; qty: number; unit_price: number }[];
};

export function customerHistory(orders: CustomerOrder[]) {
  const groups = new Map<string, CustomerOrder[]>();
  for (const order of orders) {
    const digits = order.customer_phone.replace(/\D/g, "");
    const phone = digits.length === 13 && digits.startsWith("55") ? digits.slice(2) : digits;
    const key = phone ? `phone:${phone}` : order.customer_id ? `id:${order.customer_id}` : `order:${order.id}`;
    const history = groups.get(key) ?? [];
    history.push(order); groups.set(key, history);
  }
  return [...groups.entries()].map(([id, history]) => {
    history.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id));
    const latest = history[0];
    if (!latest) throw new Error("Histórico vazio.");
    const sum = (status: PaymentStatus) => history.reduce((total, order) => total + (order.payment_status === status && order.status !== "cancelado" ? Math.round(order.total * 100) : 0), 0) / 100;
    return { id, name: latest.customer_name, phone: latest.customer_phone, latest, orders: history,
      paid: sum("pago"), pending: sum("pendente"),
      pendingOrders: history.filter((o) => o.payment_status === "pendente" && o.status !== "cancelado").length,
      paidOrders: history.filter((o) => o.payment_status === "pago" && o.status !== "cancelado").length };
  }).sort((a, b) => b.latest.created_at.localeCompare(a.latest.created_at));
}