import { expect, it } from "vitest";
import { parseOfflineOrders } from "./offline-orders";
it("only reads history for its signed-in account", () => {
  const raw = JSON.stringify({ userId: "owner", savedAt: "2026-11-18T18:00:00Z", orders: [] });
  expect(parseOfflineOrders(raw, "owner")?.savedAt).toBe("2026-11-18T18:00:00Z");
  expect(parseOfflineOrders(raw, "another")).toBeNull();
});
it("rejects malformed history", () => { expect(parseOfflineOrders('{"userId":"owner"}', "owner")).toBeNull(); });it("keeps the full history, beyond 100 orders", () => {
  const o = { id: "x", number: 1, customer_name: "A", customer_phone: "1", mode: "retirada", address: "", payment_method: "pix", payment_status: "pago", status: "entregue", subtotal: 1, delivery_fee: 0, total: 1, notes: "", created_at: "2026-11-18T18:00:00Z", order_items: [] };
  const raw = JSON.stringify({ userId: "owner", savedAt: "2026-11-18T18:00:00Z", orders: Array(250).fill(o) });
  expect(parseOfflineOrders(raw, "owner")?.orders).toHaveLength(250);
});
