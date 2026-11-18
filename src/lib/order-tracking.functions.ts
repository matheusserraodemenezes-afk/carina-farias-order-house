import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Função PÚBLICA: o link do pedido usa o id aleatório (UUID), impossível de adivinhar.
// Retorna só o necessário para acompanhar — nunca telefone nem endereço da cliente.
export const getOrderTracking = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("number, mode, payment_method, payment_status, status, subtotal, delivery_fee, total, created_at, updated_at, order_items(name, qty, unit_price)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) { console.error("[getOrderTracking]", error.message); throw new Error("Não foi possível carregar o pedido."); }
    if (!order) return null;
    const o = order as any;
    return {
      number: Number(o.number), mode: String(o.mode), paymentMethod: String(o.payment_method),
      paymentStatus: String(o.payment_status), status: String(o.status ?? "novo"),
      subtotal: Number(o.subtotal), fee: Number(o.delivery_fee), total: Number(o.total),
      createdAt: String(o.created_at), updatedAt: o.updated_at ? String(o.updated_at) : null,
      items: ((o.order_items ?? []) as any[]).map((i) => ({ name: String(i.name), qty: Number(i.qty), price: Number(i.unit_price) })),
    };
  });
