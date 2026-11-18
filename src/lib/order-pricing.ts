// Cálculo do pedido a partir do cardápio oficial. Sem dependências do servidor,
// então roda igual no navegador (para mostrar o total) e no servidor (para validar).
import { DELIVERY_FEE, MENU } from "./menu";

export type PricedLine = { id: string; name: string; price: number; qty: number };
export type PricedOrder = { lines: PricedLine[]; subtotal: number; fee: number; total: number };

const round2 = (n: number) => Math.round(n * 100) / 100;

export function priceOrder(items: { id: string; qty: number }[], mode: "entrega" | "retirada"): PricedOrder {
  const merged = new Map<string, number>();
  for (const item of items) merged.set(item.id, (merged.get(item.id) ?? 0) + item.qty);

  const lines: PricedLine[] = [];
  for (const [id, qty] of merged) {
    const menuItem = MENU.find((entry) => entry.id === id);
    if (!menuItem) throw new Error(`Produto inválido no pedido: ${id}`);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) throw new Error("Quantidade inválida no pedido.");
    lines.push({ id: menuItem.id, name: menuItem.name, price: menuItem.price, qty });
  }
  if (!lines.length) throw new Error("O pedido está vazio.");

  const subtotal = round2(lines.reduce((sum, line) => sum + line.price * line.qty, 0));
  const fee = mode === "entrega" ? DELIVERY_FEE : 0;
  return { lines, subtotal, fee, total: round2(subtotal + fee) };
}
