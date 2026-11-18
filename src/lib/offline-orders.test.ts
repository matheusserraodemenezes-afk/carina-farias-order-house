import { expect, it } from "vitest";
import { parseOfflineOrders } from "./offline-orders";
it("only reads history for its signed-in account", () => {
  const raw = JSON.stringify({ userId: "owner", savedAt: "2026-11-18T18:00:00Z", orders: [] });
  expect(parseOfflineOrders(raw, "owner")?.savedAt).toBe("2026-11-18T18:00:00Z");
  expect(parseOfflineOrders(raw, "another")).toBeNull();
});
it("rejects malformed history", () => { expect(parseOfflineOrders('{"userId":"owner"}', "owner")).toBeNull(); });