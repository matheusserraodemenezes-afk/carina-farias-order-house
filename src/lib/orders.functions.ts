import { createServerFn } from "@tanstack/react-start";
import { orderInputSchema } from "./orders";
import { priceOrder } from "./order-pricing";

// Função PÚBLICA: o cliente não precisa de conta. Os preços NUNCA vêm do navegador:
// o servidor recalcula tudo a partir do cardápio oficial (menu.ts).
export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderInputSchema.parse(input))
  .handler(async ({ data }) => {
    // Importado aqui dentro de propósito: client.server.ts usa a chave secreta e não pode ir para o navegador.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // As tabelas novas ainda não estão em types.ts (arquivo gerado), por isso o tipo solto.
    const db = supabaseAdmin as unknown as { from: (table: string) => any };

    const priced = priceOrder(data.items, data.mode);
    const phone = data.phone.replace(/\D/g, "");
    if (phone.length < 8) throw new Error("Telefone inválido.");
    const address = data.mode === "entrega" ? data.address : "";

    // Cliente: cria ou atualiza pelo telefone. Se falhar, o pedido segue sem vínculo.
    let customerId: string | null = null;
    const customer = await db
      .from("customers")
      .upsert({ phone, name: data.name, ...(address ? { address } : {}) }, { onConflict: "phone" })
      .select("id")
      .single();
    if (customer.error) console.error("[createOrder] cliente:", customer.error.message);
    else customerId = customer.data?.id ?? null;

    const order = await db
      .from("orders")
      .insert({
        customer_id: customerId,
        customer_name: data.name,
        customer_phone: phone,
        mode: data.mode,
        address,
        payment_method: data.payment,
        subtotal: priced.subtotal,
        delivery_fee: priced.fee,
        total: priced.total,
        payment_status: "pendente", // confirmação manual pela loja no painel
        notes: [data.notes ?? "", data.payment === "dinheiro" && data.changeFor ? `Troco para R$ ${data.changeFor.toFixed(2).replace(".", ",")}` : ""].filter(Boolean).join(" · "),
      })
      .select("id, number")
      .single();
    if (order.error || !order.data) {
      console.error("[createOrder] pedido:", order.error?.message);
      throw new Error("Não foi possível registrar o pedido.");
    }

    const items = await db.from("order_items").insert(
      priced.lines.map((line) => ({ order_id: order.data.id, product_id: line.id, name: line.name, unit_price: line.price, qty: line.qty })),
    );
    if (items.error) {
      console.error("[createOrder] itens:", items.error.message);
      await db.from("orders").delete().eq("id", order.data.id); // não deixa pedido sem itens
      throw new Error("Não foi possível registrar o pedido.");
    }

    return { id: order.data.id as string, number: Number(order.data.number), ...priced };
  });
