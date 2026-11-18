import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { historySaveSchema, historyIdSchema, profileSchema } from "./sales-history";
import { salesInputSchema } from "./sales-analysis";

export const listSalesHistory = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("sales_history").select("id,period,orders,updated_at").eq("user_id", context.userId).order("updated_at", { ascending: false });
  if (error) throw new Error("Não foi possível consultar o histórico.");
  return (data ?? []).map((row) => ({ id: row.id, updated_at: row.updated_at, sales: salesInputSchema.parse({ period: row.period, orders: row.orders }) }));
});
export const saveSalesHistory = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => historySaveSchema.parse(input)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from("sales_history").upsert({ id: data.id, user_id: context.userId, period: data.sales.period, orders: data.sales.orders, updated_at: new Date().toISOString() });
  if (error) throw new Error("Não foi possível salvar as vendas. Tente novamente.");
  return { id: data.id };
});
export const deleteSalesHistory = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => historyIdSchema.parse(input)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from("sales_history").delete().eq("id", data.id).eq("user_id", context.userId);
  if (error) throw new Error("Não foi possível excluir o período.");
  return { ok: true };
});
export const getOwnerProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("profiles").select("display_name,avatar_url").eq("id", context.userId).maybeSingle();
  if (error) throw new Error("Não foi possível consultar o perfil.");
  return data ?? { display_name: "", avatar_url: "" };
});
export const saveOwnerProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => profileSchema.parse(input)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from("profiles").upsert({ id: context.userId, ...data });
  if (error) throw new Error("Não foi possível salvar o perfil.");
  return { ok: true };
});