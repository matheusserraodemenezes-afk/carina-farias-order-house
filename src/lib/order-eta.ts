// Previsão de preparo e entrega (pura, testada). Tempos médios informados pela loja.
export const PREP_MINUTES = 30;
export const DELIVERY_MINUTES = 20;

export type Eta = { readyAt: Date; arriveAt: Date | null; late: boolean } | null;

/** Previsão a partir do horário do pedido. Some quando o pedido foi entregue ou cancelado. */
export function orderEta(createdAt: string | Date, mode: string, status: string, now: Date = new Date()): Eta {
  if (status === "entregue" || status === "cancelado") return null;
  const start = new Date(createdAt).getTime();
  if (!Number.isFinite(start)) return null;
  const readyAt = new Date(start + PREP_MINUTES * 60_000);
  const arriveAt = mode === "entrega" ? new Date(readyAt.getTime() + DELIVERY_MINUTES * 60_000) : null;
  const target = status === "pronto" && !arriveAt ? null : (arriveAt ?? readyAt);
  return { readyAt, arriveAt, late: !!target && now > target };
}
