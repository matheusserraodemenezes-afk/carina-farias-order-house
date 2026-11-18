import { describe, expect, it } from "vitest";
import { customerHistory, type CustomerOrder } from "./customer-history";

const order = (patch: Partial<CustomerOrder> = {}): CustomerOrder => ({ id: "one", number: 1, customer_id: null, customer_name: "Carina", customer_phone: "91980389283", created_at: "2026-11-18T17:00:00Z", total: 13, status: "novo", payment_status: "pendente", payment_method: "pix", order_items: [{ name: "Espeto", qty: 1, unit_price: 13 }], ...patch });
describe("customer history", () => {
  it("groups repeated customers and shows their most recent payment and order status", () => {
    const rows = customerHistory([order(), order({ id: "two", customer_phone: "+55 (91) 98038-9283", created_at: "2026-11-18T18:00:00Z", status: "pronto", payment_status: "pago" })]);
    expect(rows).toHaveLength(1);
    const row = rows[0];
    if (!row) throw new Error("Cliente ausente");
    expect(row.orders).toHaveLength(2);
    expect(row.latest.status).toBe("pronto");
    expect(row.latest.payment_status).toBe("pago");
    expect(row.pending).toBe(13);
    expect(row.paid).toBe(13);
  });
  it("keeps different phones separate even with matching names", () => {
    expect(customerHistory([order(), order({ id: "two", customer_phone: "91911112222" })])).toHaveLength(2);
  });
  it("excludes cancelled and refunded orders from amounts awaiting payment or paid", () => {
    const [row] = customerHistory([order({ status: "cancelado" }), order({ id: "two", payment_status: "estornado" }), order({ id: "three", total: 20.1, payment_status: "pago" })]);
    if (!row) throw new Error("Cliente ausente");
    expect(row.pending).toBe(0);
    expect(row.pendingOrders).toBe(0);
    expect(row.paid).toBe(20.1);
    expect(row.orders).toHaveLength(3);
  });
});