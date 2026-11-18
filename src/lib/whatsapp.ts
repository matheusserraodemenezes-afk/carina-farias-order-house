import { CONTACT_URL, brl } from "./menu";

export type WhatsAppOrder = {
  number?: number;
  mode: "entrega" | "retirada" | string;
  name: string;
  phone: string;
  address?: string;
  payment: string; // texto, ex.: "PIX"
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  fee: number;
  total: number;
  notes?: string | undefined;
  paymentStatus?: string;
  trackingUrl?: string | undefined;
};

export function buildWhatsAppMessage(order: WhatsAppOrder): string {
  const lines: string[] = [];
  lines.push(`*NOVO PEDIDO${order.number ? ` #${order.number}` : ""} - Carina Farias*`, "", "*Itens:*");
  for (const item of order.items) lines.push(`${item.qty}x ${item.name} - ${brl(item.qty * item.price)}`);
  lines.push("", `Subtotal: ${brl(order.subtotal)}`);
  if (order.mode === "entrega") lines.push(`Entrega: ${brl(order.fee)}`);
  lines.push(`*Total: ${brl(order.total)}*`, "", "*Cliente:*", `Nome: ${order.name}`, `Telefone: ${order.phone}`);
  lines.push(`Tipo: ${order.mode === "entrega" ? "Entrega" : "Retirada na loja"}`);
  if (order.mode === "entrega" && order.address) lines.push(`Endereço: ${order.address}`);
  lines.push(`Pagamento: ${order.payment}`);
  if (order.paymentStatus) lines.push(`Status do pagamento: ${order.paymentStatus}`);
  if (order.notes) lines.push(`Obs: ${order.notes}`);
  if (order.trackingUrl) lines.push("", `Acompanhe o pedido: ${order.trackingUrl}`);
  return lines.join("\n");
}

export const whatsappUrl = (order: WhatsAppOrder) => `${CONTACT_URL}?text=${encodeURIComponent(buildWhatsAppMessage(order))}`;
