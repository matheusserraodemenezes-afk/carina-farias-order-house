import { describe, expect, it } from "vitest";
import { mergeOrderAlerts } from "./order-alerts";
const first = { id: "one", number: 1001, total: 13, mode: "retirada" };
const second = { id: "two", number: 1002, total: 20, mode: "entrega" };
describe("new order alerts", () => {
  it("keeps every arriving order, newest first", () => {
    expect(mergeOrderAlerts([], [first, second]).map((o) => o.number)).toEqual([1002, 1001]);
  });
  it("does not notify the same order twice after a refresh", () => {
    expect(mergeOrderAlerts([first], [first, second])).toEqual([second, first]);
  });
});