import { describe, expect, it } from "vitest";
import { MENU } from "./menu";
import { eligibleMenu, validateSuggestions, type Preferences } from "./recommendations";

const preferences: Preferences = { people: 1, budget: 21, meat: "Qualquer", drink: "Qualquer", avoid: [], notes: "" };
const combination = (items = [{ id: "c1", qty: 1 }, { id: "s1", qty: 1 }]) => ({ message: "", combinations: [{ title: "Combinação", reason: "", items }] });

describe("Cardápio oficial e sugestões", () => {
  it("mantém todos os sete churrascos nos preços oficiais", () => {
    expect(MENU.filter((item) => item.category === "Churrasco").map((item) => [item.name, item.price])).toEqual([
      ["Carne e Calabresa", 17], ["Carne, Calabresa e Frango", 17], ["Duas Calabresa e uma Carne", 17], ["Só de Calabresa", 17], ["Carne e Frango", 17], ["Bisteca", 20], ["Coração", 17],
    ]);
  });
  it("mantém os três sucos no copo por R$4", () => {
    expect(MENU.filter((item) => item.category === "Sucos").map((item) => [item.name, item.price, item.desc])).toEqual([["Suco de Goiaba", 4, "No copo"], ["Suco de Acerola", 4, "No copo"], ["Suco de Caju", 4, "No copo"]]);
  });
  it("não inventa acompanhamentos ou produtos", () => {
    expect(MENU).toHaveLength(10);
    expect(() => validateSuggestions(combination([{ id: "a1", qty: 1 }]), preferences)).toThrow("Invalid menu item");
  });
  it("calcula o preço no cardápio, não no modelo", () => {
    expect(validateSuggestions(combination(), preferences).combinations[0]?.total).toBe(21);
  });
  it("respeita o orçamento total", () => {
    expect(() => validateSuggestions(combination(), { ...preferences, budget: 20 })).toThrow("Over budget");
  });
  it("exclui carnes que o cliente evita", () => {
    expect(eligibleMenu({ ...preferences, avoid: ["Calabresa"] }).map((item) => item.id)).toEqual(["c5", "c6", "c7", "s1", "s2", "s3"]);
    expect(() => validateSuggestions(combination(), { ...preferences, avoid: ["Calabresa"] })).toThrow("Invalid menu item");
  });
  it("respeita a carne e o suco preferidos", () => {
    expect(eligibleMenu({ ...preferences, meat: "Frango", drink: "Acerola" }).map((item) => item.id)).toEqual(["c2", "c5", "s2"]);
  });
  it("respeita a escolha sem bebida", () => {
    expect(validateSuggestions(combination([{ id: "c1", qty: 1 }]), { ...preferences, drink: "Sem bebida" }).combinations[0]?.total).toBe(17);
  });
  it("valida quantidades para todas as pessoas", () => {
    expect(() => validateSuggestions(combination(), { ...preferences, budget: null, people: 2 })).toThrow("Invalid portions");
  });
});