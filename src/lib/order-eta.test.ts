import { describe, expect, it } from "vitest";
import { orderEta } from "./order-eta";

const t = "2026-11-18T12:00:00Z";
describe("orderEta", () => {
  it("retirada fica pronta 30 min após o pedido", () => {
    const eta = orderEta(t, "retirada", "novo", new Date(t))!;
    expect(eta.readyAt.toISOString()).toBe("2026-11-18T12:30:00.000Z");
    expect(eta.arriveAt).toBeNull();
  });
  it("entrega chega 20 min depois de pronta", () => {
    expect(orderEta(t, "entrega", "em_preparo", new Date(t))!.arriveAt!.toISOString()).toBe("2026-11-18T12:50:00.000Z");
  });
  it("sem previsão para entregue ou cancelado", () => {
    expect(orderEta(t, "entrega", "entregue")).toBeNull();
    expect(orderEta(t, "entrega", "cancelado")).toBeNull();
  });
  it("marca atraso depois do horário previsto", () => {
    expect(orderEta(t, "entrega", "saiu_entrega", new Date("2026-11-18T13:00:00Z"))!.late).toBe(true);
  });
});
