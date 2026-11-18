import { describe, expect, it } from "vitest";
import { buildPixPayload, crc16, PAYMENT_IDS, PAYMENT_STATUS_LABELS } from "./payments";
import { orderInputSchema } from "./orders";

const base = { mode: "retirada", name: "Ana", phone: "91999990000", address: "", items: [{ id: "c1", qty: 1 }] } as const;

describe("formas de pagamento", () => {
  it("oferece exatamente PIX, dinheiro e cartão na entrega", () => {
    expect(PAYMENT_IDS).toEqual(["pix", "dinheiro", "cartao_entrega"]);
  });
  it("pedido pendente aparece como Aguardando pagamento", () => {
    expect(PAYMENT_STATUS_LABELS.pendente).toBe("Aguardando pagamento");
  });
  it("aceita as três formas e recusa outras", () => {
    for (const payment of PAYMENT_IDS) expect(orderInputSchema.safeParse({ ...base, payment }).success).toBe(true);
    expect(orderInputSchema.safeParse({ ...base, payment: "stripe" }).success).toBe(false);
  });
});

describe("PIX copia e cola", () => {
  it("CRC16 confere com o valor de referência", () => {
    expect(crc16("123456789")).toBe("29B1");
  });
  it("inclui chave, valor e CRC válido", () => {
    const payload = buildPixPayload({ key: "teste@exemplo.com", receiver: "Carina Farias", city: "Belém", amount: 18, reference: "Pedido 1001" });
    expect(payload).toContain("teste@exemplo.com");
    expect(payload).toContain("540518.00");
    expect(payload).toContain("6005BELEM");
    expect(payload.slice(-4)).toBe(crc16(payload.slice(0, -4)));
  });
  it("não gera código sem chave", () => {
    expect(() => buildPixPayload({ key: "", receiver: "X", city: "Y", amount: 10, reference: "1" })).toThrow();
  });
});
