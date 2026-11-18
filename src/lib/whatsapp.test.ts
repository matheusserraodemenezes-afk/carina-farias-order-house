import { expect, it } from "vitest";
import { whatsappUrl } from "./whatsapp";
it("addresses the shop and includes delivery, items, payment and tracking", () => {
  const url = new URL(whatsappUrl({ number: 1024, name: "Teste", phone: "91999990000", mode: "entrega", address: "Rua teste, 123", payment: "PIX", paymentStatus: "Aguardando pagamento", items: [{ name: "Carne e Calabresa", qty: 1, price: 13 }], subtotal: 13, fee: 5, total: 18, trackingUrl: "https://carinafarias.com/pedido/teste" }));
  expect(url.pathname).toBe("/559180389283");
  const message = url.searchParams.get("text");
  expect(message).toContain("Endereço: Rua teste, 123");
  expect(message).toContain("1x Carne e Calabresa");
  expect(message).toContain("Status do pagamento: Aguardando pagamento");
  expect(message).toContain("https://carinafarias.com/pedido/teste");
});