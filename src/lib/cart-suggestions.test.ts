import { describe, expect, it } from "vitest";
import { MENU } from "./menu";
import { cartSuggestions } from "./cart-suggestions";

describe("Complementos do carrinho", () => {
  it("oferece bebidas do cardápio para um churrasco sem adicionar automaticamente", () => {
    const cart = { c1: 1 };
    expect(cartSuggestions(cart).map((item) => [item.id, item.price])).toEqual([["s1", 7], ["r5", 6], ["s2", 7], ["r4", 8]]);
    expect(cart).toEqual({ c1: 1 });
  });
  it("não oferece novamente produtos que já estão no pedido", () => {
    expect(cartSuggestions({ c1: 1, s1: 2, r5: 1 }).map((item) => item.id)).toEqual(["s2", "r4", "l3", "sp1"]);
  });
  it("oferece comidas para quem escolheu apenas uma bebida", () => {
    expect(cartSuggestions({ s1: 1 }).map((item) => item.id)).toEqual(["c8", "l21", "sp1", "l3"]);
  });
  it("usa somente produtos e preços do catálogo compartilhado", () => {
    for (const item of cartSuggestions({ c1: 1 })) expect(item).toEqual(MENU.find((entry) => entry.id === item.id));
    expect(cartSuggestions({})).toEqual([]);
  });
});