import { describe, expect, it } from "vitest";
import { dailySales, dailySalesSchema, type SalesOrder } from "./daily-sales";
const order = (patch: Partial<SalesOrder> = {}): SalesOrder => ({ created_at: "2026-11-18T22:00:00Z", completed_at: null, total: 13, status: "novo", payment_status: "pendente", ...patch });
describe("daily shop sales", () => {
  it("separates paid and pending amounts without counting cancelled or refunded sales", () => {
    const rows = dailySales([order(), order({ total: 20, payment_status: "pago" }), order({ total: 30, status: "cancelado", payment_status: "pago" }), order({ total: 7, payment_status: "estornado" })], "2026-11-18", "2026-11-18");
    expect(rows[0]).toMatchObject({ orders: 4, value: 33, paid: 20, pending: 13, refunded: 7, statuses: { novo: 3, cancelado: 1 } });
  });
  it("groups order dates in Belém and counts completion on its actual day", () => {
    const rows = dailySales([order({ created_at: "2026-11-19T02:30:00Z", completed_at: "2026-11-19T03:10:00Z" })], "2026-11-18", "2026-11-19");
    expect(rows[1]).toMatchObject({ day: "2026-11-18", orders: 1, completed: 0 });
    expect(rows[0]).toMatchObject({ day: "2026-11-19", orders: 0, completed: 1 });
  });
  it("includes empty days and keeps cents exact", () => {
    const rows = dailySales([order({ total: 0.1 }), order({ total: 0.2 })], "2026-11-17", "2026-11-18");
    expect(rows[0]?.value).toBe(0.3); expect(rows[1]?.orders).toBe(0);
  });
  it("rejects invalid, reversed and excessively large periods", () => {
    expect(dailySalesSchema.safeParse({ from: "2026-02-30", to: "2026-03-01" }).success).toBe(false);
    expect(dailySalesSchema.safeParse({ from: "2026-11-19", to: "2026-11-18" }).success).toBe(false);
    expect(dailySalesSchema.safeParse({ from: "2026-01-01", to: "2026-11-18" }).success).toBe(false);
  });
});