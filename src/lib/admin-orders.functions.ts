import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { dailySales, dailySalesSchema, type SalesOrder } from "./daily-sales";
import { customerHistory, type CustomerOrder } from "./customer-history";

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

export const getNewOrderAlerts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ after: z.number().int().nonnegative().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.after === undefined) {
      const result = await context.supabase.from("orders").select("number").order("number", { ascending: false }).limit(1);
      if (result.error) throw new Error("Não foi possível iniciar os alertas.");
      return { cursor: Number(result.data?.[0]?.number ?? 0), orders: [] };
    }
    const result = await context.supabase.from("orders").select("id, number, total, mode")
      .gt("number", data.after).order("number").limit(1000);
    if (result.error) throw new Error("Não foi possível consultar novos pedidos.");
    const orders = (result.data ?? []).map((order) => ({ ...order, number: Number(order.number), total: Number(order.total) }));
    return { cursor: orders.at(-1)?.number ?? data.after, orders };
  });

export const listAdminCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const orders: CustomerOrder[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await context.supabase.from("orders")
        .select("id, number, customer_id, customer_name, customer_phone, created_at, total, status, payment_status, payment_method, order_items(name, qty, unit_price)")
        .order("id").range(offset, offset + 999);
      if (error) { console.error("[listAdminCustomers]", error.message); throw new Error("Não foi possível carregar os clientes."); }
      orders.push(...(data ?? []).map((o) => ({ ...o, number: Number(o.number), total: Number(o.total), order_items: o.order_items.map((i) => ({ ...i, unit_price: Number(i.unit_price) })) })));
      if ((data?.length ?? 0) < 1000) break;
    }
    return customerHistory(orders);
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  paymentStatus: z.enum(["pendente", "pago", "estornado"]).optional(),
  status: z.enum(["novo", "em_preparo", "pronto", "saiu_entrega", "entregue", "cancelado"]).optional(),
}).refine((v) => v.paymentStatus || v.status);

export const getDailySales = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => dailySalesSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const start = `${data.from}T00:00:00-03:00`;
    const end = new Date(Date.parse(`${data.to}T00:00:00-03:00`) + 86400000).toISOString();
    const orders: SalesOrder[] = [];
    for (let offset = 0; ; offset += 1000) {
      const result = await context.supabase.from("orders")
        .select("created_at, completed_at, total, status, payment_status")
        .or(`and(created_at.gte.${start},created_at.lt.${end}),and(completed_at.gte.${start},completed_at.lt.${end})`)
        .order("id").range(offset, offset + 999);
      if (result.error) { console.error("[getDailySales]", result.error.message); throw new Error("Não foi possível carregar as vendas."); }
      orders.push(...(result.data ?? []));
      if ((result.data?.length ?? 0) < 1000) break;
    }
    return dailySales(orders, data.from, data.to);
  });

export const updateAdminOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: completed, error } = await context.supabase.rpc("update_order_with_completion", {
      _id: data.id,
      ...(data.paymentStatus ? { _payment_status: data.paymentStatus } : {}),
      ...(data.status ? { _status: data.status } : {}),
    });
    if (error) { console.error("[updateAdminOrder]", error.message); throw new Error("Não foi possível atualizar o pedido."); }
    return { ok: true, completed: completed === true, status: data.status };
  });
