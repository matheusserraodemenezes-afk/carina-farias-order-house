import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error || !data) throw new Error("Acesso restrito à administração.");
}

export const checkAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { admin: Boolean(data) };
  });

export const listAdminOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, number, customer_name, customer_phone, mode, address, payment_method, payment_status, status, subtotal, delivery_fee, total, notes, created_at, order_items(name, qty, unit_price)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) { console.error("[listAdminOrders]", error.message); throw new Error("Não foi possível carregar os pedidos."); }
    return (data ?? []).map((o) => ({ ...o, number: Number(o.number), subtotal: Number(o.subtotal), delivery_fee: Number(o.delivery_fee), total: Number(o.total), order_items: o.order_items.map((i) => ({ ...i, unit_price: Number(i.unit_price) })) }));
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  paymentStatus: z.enum(["pendente", "pago", "estornado"]).optional(),
  status: z.enum(["novo", "em_preparo", "pronto", "saiu_entrega", "entregue", "cancelado"]).optional(),
}).refine((v) => v.paymentStatus || v.status);

export const updateAdminOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("orders").update({
      ...(data.paymentStatus ? { payment_status: data.paymentStatus } : {}),
      ...(data.status ? { status: data.status } : {}),
    }).eq("id", data.id);
    if (error) { console.error("[updateAdminOrder]", error.message); throw new Error("Não foi possível atualizar o pedido."); }
    return { ok: true };
  });
