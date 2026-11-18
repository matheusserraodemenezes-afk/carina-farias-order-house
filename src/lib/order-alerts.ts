export type OrderAlert = { id: string; number: number; total: number; mode: string };
export function mergeOrderAlerts(current: OrderAlert[], incoming: OrderAlert[]) {
  const ids = new Set(current.map((order) => order.id));
  return [...incoming.filter((order) => !ids.has(order.id)), ...current].sort((a, b) => b.number - a.number);
}