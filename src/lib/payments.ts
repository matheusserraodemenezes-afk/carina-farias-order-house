// Formas de pagamento do pedido. Hoje todas são confirmadas manualmente pela loja
// (provider "manual"). Para um gateway automático no futuro, adicione um novo
// provider aqui e um webhook que mude payment_status para "pago".
export type PaymentId = "pix" | "dinheiro" | "cartao_entrega";
export type PaymentProvider = "manual";
export type PaymentStatus = "pendente" | "pago" | "estornado";

export const PAYMENT_OPTIONS: { id: PaymentId; label: string; description: string; provider: PaymentProvider }[] = [
  { id: "pix", label: "PIX", description: "Pague com a chave ou QR Code. A loja confirma o recebimento.", provider: "manual" },
  { id: "dinheiro", label: "Dinheiro", description: "Pague na entrega ou na retirada.", provider: "manual" },
  { id: "cartao_entrega", label: "Cartão na entrega", description: "Crédito ou débito na maquininha da loja.", provider: "manual" },
];
export const PAYMENT_IDS = PAYMENT_OPTIONS.map((option) => option.id) as [PaymentId, ...PaymentId[]];
export const paymentLabel = (id: string) => PAYMENT_OPTIONS.find((option) => option.id === id)?.label ?? id;

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = { pendente: "Aguardando pagamento", pago: "Pago", estornado: "Estornado" };
export const ORDER_STATUS_LABELS = { novo: "Novo", em_preparo: "Em preparo", pronto: "Pronto", saiu_entrega: "Saiu para entrega", entregue: "Entregue", cancelado: "Cancelado" } as const;
export type OrderStatus = keyof typeof ORDER_STATUS_LABELS;

// Dados PIX da empresa. Deixe PIX_KEY vazio até a loja confirmar a chave.
export const PIX_KEY = "";
export const PIX_RECEIVER = "CARINA FARIAS";
export const PIX_CITY = "BELEM";

const field = (id: string, value: string) => `${id}${value.length.toString().padStart(2, "0")}${value}`;
const ascii = (value: string, max: number) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "").toUpperCase().slice(0, max);

export function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Código "PIX copia e cola" (BR Code estático) com valor e referência do pedido. */
export function buildPixPayload({ key, receiver, city, amount, reference }: { key: string; receiver: string; city: string; amount: number; reference: string }) {
  if (!key.trim()) throw new Error("Chave PIX não configurada");
  if (!(amount > 0)) throw new Error("Valor inválido");
  const txid = reference.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const body = [
    field("00", "01"),
    field("26", field("00", "br.gov.bcb.pix") + field("01", key.trim())),
    field("52", "0000"), field("53", "986"), field("54", amount.toFixed(2)), field("58", "BR"),
    field("59", ascii(receiver, 25) || "LOJA"), field("60", ascii(city, 15) || "BRASIL"),
    field("62", field("05", txid)),
  ].join("") + "6304";
  return body + crc16(body);
}
