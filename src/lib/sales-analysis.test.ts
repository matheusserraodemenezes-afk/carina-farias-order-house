import { describe, expect, it } from "vitest";
import { salesInputSchema, salesMetrics, validateSalesAnalysis } from "./sales-analysis";

describe("sales analysis", () => {
  const input = { period: "Semana", orders: [
    { items: [{ id: "c1", qty: 3 }, { id: "s1", qty: 2 }], paid: 53 },
    { items: [{ id: "c1", qty: 1 }, { id: "s1", qty: 1 }], paid: 18 },
    { items: [{ id: "c8", qty: 1 }], paid: 13 },
  ] };
  it("uses actual paid product totals for revenue and average", () => {
    expect(salesMetrics(input)).toMatchObject({ revenue: 84, average: 28, orderCount: 3 });
  });
  it("counts co-occurrence per order, not per quantity", () => {
    expect(salesMetrics(input).pairs).toEqual([{ ids: ["c1", "s1"], count: 2, share: 66.67 }]);
  });
  it("rejects unlisted products", () => {
    expect(salesInputSchema.safeParse({ period: "Dia", orders: [{ items: [{ id: "unknown", qty: 1 }], paid: 1 }] }).success).toBe(false);
  });
  it("rejects duplicate lines and invalid quantities", () => {
    expect(salesInputSchema.safeParse({ period: "Dia", orders: [{ items: [{ id: "c1", qty: 1 }, { id: "c1", qty: 1 }], paid: 26 }] }).success).toBe(false);
    expect(salesInputSchema.safeParse({ period: "Dia", orders: [{ items: [{ id: "c1", qty: 0 }], paid: 13 }] }).success).toBe(false);
  });
  const promo = { title: "Combo", reason: "Produtos juntos", action: "Oferecer no carrinho", items: [{ id: "c1", qty: 1 }, { id: "s1", qty: 1 }], discountPercent: 10 };
  it("computes hypothetical discounts from official prices, not AI prices", () => {
    expect(validateSalesAnalysis({ summary: "Teste", promotions: [promo] }, 18).promotions[0]).toMatchObject({ regular: 20, suggested: 18, saving: 2, difference: 0 });
  });
  it("rejects invented products and excessive discounts in model output", () => {
    expect(() => validateSalesAnalysis({ summary: "Teste", promotions: [{ ...promo, items: [{ id: "fake", qty: 1 }, { id: "s1", qty: 1 }] }] }, 18)).toThrow();
    expect(() => validateSalesAnalysis({ summary: "Teste", promotions: [{ ...promo, discountPercent: 31 }] }, 18)).toThrow();
  });
});