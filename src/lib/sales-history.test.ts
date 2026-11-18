import { describe, expect, it } from "vitest";
import { historySaveSchema, profileSchema } from "./sales-history";
describe("private sales history inputs", () => {
  it("preserves received totals and products for future analysis", () => {
    const sales = { period: "Novembro", orders: [{ items: [{ id: "c8", qty: 2 }, { id: "s1", qty: 1 }], paid: 30 }] };
    expect(historySaveSchema.parse({ id: "12345678-1234-4234-8234-123456789012", sales }).sales).toEqual(sales);
  });
  it("never accepts caller-supplied ownership", () => {
    expect(historySaveSchema.safeParse({ id: "12345678-1234-4234-8234-123456789012", user_id: "someone-else", sales: { period: "Novembro", orders: [{ items: [{ id: "c8", qty: 1 }], paid: 13 }] } }).success).toBe(false);
  });
  it("rejects invalid catalog products in saved periods", () => {
    expect(historySaveSchema.safeParse({ id: "12345678-1234-4234-8234-123456789012", sales: { period: "Novembro", orders: [{ items: [{ id: "fake", qty: 1 }], paid: 13 }] } }).success).toBe(false);
  });
  it("rejects executable photo addresses", () => { expect(profileSchema.safeParse({ display_name: "Carina", avatar_url: "javascript:alert(1)" }).success).toBe(false); });
});