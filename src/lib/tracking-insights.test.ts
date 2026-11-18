import { describe, expect, it } from "vitest";
import { trackingMetrics } from "./tracking-insights";

const orders = [
  { id: "a", created_at: "2026-11-18T12:00:00Z", payment_method: "pix", payment_status: "pago" },
  { id: "b", created_at: "2026-11-18T12:00:00Z", payment_method: "pix", payment_status: "pendente" },
  { id: "c", created_at: "2026-11-18T12:00:00Z", payment_method: "dinheiro", payment_status: "pendente" },
  { id: "d", created_at: "2026-11-18T12:00:00Z", payment_method: "cartao_entrega", payment_status: "pendente" },
];
const chk = (order_id: string, payment_status: string, order_status: string, min: number) => ({ order_id, payment_status, order_status, mode: "entrega", payment_method: "pix", created_at: new Date(Date.parse("2026-11-18T12:00:00Z") + min * 60_000).toISOString() });

describe("trackingMetrics", () => {
  const m = trackingMetrics([chk("a", "pendente", "novo", 2), chk("a", "pago", "em_preparo", 10), chk("b", "pendente", "novo", 4)], orders);
  it("conta pedidos acompanhados e a parcela sobre o total", () => {
    expect(m.trackedOrders).toBe(2);
    expect(m.trackedShare).toBe(50);
    expect(m.checksPerTrackedOrder).toBe(1.5);
  });
  it("conta pedidos PIX que viram o pagamento confirmado", () => {
    expect(m.pixOrders).toBe(2);
    expect(m.pixTracked).toBe(2);
    expect(m.pixSawPaid).toBe(1);
  });
  it("mede minutos até a primeira consulta", () => {
    expect(m.avgMinutesToFirstCheck).toBe(3);
  });
  it("sem dados não divide por zero", () => {
    expect(trackingMetrics([], []).trackedShare).toBe(0);
    expect(trackingMetrics([], []).avgMinutesToFirstCheck).toBeNull();
  });
});
