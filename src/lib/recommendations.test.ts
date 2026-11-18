import { describe, expect, it } from "vitest";
import { MENU } from "./menu";
import { eligibleMenu, validateSuggestions, type Preferences } from "./recommendations";

const preferences: Preferences = { occasion: "Família", diet: [], people: 1, budget: 21, meat: "Qualquer", drink: "Qualquer", avoid: [], notes: "" };
const combination = (items = [{ id: "c1", qty: 1 }, { id: "s1", qty: 1 }]) => ({ message: "", combinations: [{ title: "Combinação", reason: "", items }] });

describe("Cardápio oficial e sugestões", () => {
  it("mantém os churrascos nos preços da foto", () => {
    expect(MENU.filter((item) => item.category === "Churrasco").map((item) => item.price)).toEqual([13, 13, 13, 13, 15, 13, 25, 20]);
  });
  it("mantém os dez sucos de 400ml por R$7", () => {
    const juices = MENU.filter((item) => item.category === "Sucos");
    expect(juices).toHaveLength(10);
    expect(juices.map((item) => [item.price, item.desc])).toEqual(Array.from({length: 10}, () => [7, "400ml"]));
  });
  it("mantém os preços dos lanches da foto", () => {
    expect(MENU.filter((item) => item.category === "Lanches").map((item) => item.price)).toEqual([10,10,10,12,13,15,12,15,17,20,15,17,20,15,17,20,17,20,22,22,15,17,20,20,35]);
  });
  it("mantém sopa a R$10 e refrigerantes nos preços impressos", () => {
    expect(MENU.find((item) => item.id === "sp1")?.price).toBe(10);
    expect(MENU.filter((item) => item.category === "Refrigerantes").map((item) => item.price)).toEqual([10,13,15,8,6,10,15,10,13,15,6,10,13,15,6,10,13,15,6,7]);
  });
  it("não inventa acompanhamentos ou produtos", () => {
    expect(MENU).toHaveLength(64);
    expect(() => validateSuggestions(combination([{ id: "a1", qty: 1 }]), preferences)).toThrow("Invalid menu item");
  });
  it("calcula o preço no cardápio, não no modelo", () => {
    expect(validateSuggestions(combination(), preferences).combinations[0]?.total).toBe(20);
  });
  it("respeita o orçamento total", () => {
    expect(() => validateSuggestions(combination(), { ...preferences, budget: 19 })).toThrow("Over budget");
  });
  it("exclui carnes que o cliente evita", () => {
    expect(eligibleMenu({ ...preferences, avoid: ["Calabresa"] }).some((item) => item.name.includes("Calabresa"))).toBe(false);
    expect(() => validateSuggestions(combination(), { ...preferences, avoid: ["Calabresa"] })).toThrow("Invalid menu item");
  });
  it("respeita a carne e o suco preferidos", () => {
    expect(eligibleMenu({ ...preferences, meat: "Frango", drink: "Acerola" }).map((item) => item.id)).toEqual(["c2", "c5", "c8", "s2"]);
  });
  it("respeita a escolha sem bebida", () => {
    expect(validateSuggestions(combination([{ id: "c1", qty: 1 }]), { ...preferences, drink: "Sem bebida" }).combinations[0]?.total).toBe(13);
  });
  it("valida quantidades para todas as pessoas", () => {
    expect(() => validateSuggestions(combination(), { ...preferences, budget: null, people: 2 })).toThrow("Invalid portions");
  });
});

describe("restrições alimentares", () => {
  it("sem carne suína remove calabresa", () => {
    expect(eligibleMenu({ ...preferences, diet: ["Sem carne suína"] }).some((item) => /calabresa/i.test(item.name))).toBe(false);
  });
  it("sem carne vermelha mantém só frango no churrasco", () => {
    const grill = eligibleMenu({ ...preferences, diet: ["Sem carne vermelha"] }).filter((item) => item.category === "Churrasco");
    expect(grill.length).toBeGreaterThan(0);
    expect(grill.every((item) => !/carne|charque|bisteca/i.test(item.name))).toBe(true);
  });
});
