import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

// Run against disposable seeded orders, never against customer orders.
const url = process.env['ORDER_TEST_URL'];
const key = process.env['ORDER_TEST_KEY'];
const token = process.env['ORDER_TEST_TOKEN'];
describe.skipIf(!url || !key || !token)("first order completion (authenticated integration)", () => {
  function client() {
    if (!url || !key || !token) throw new Error("Test session required");
    return createClient(url, key, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  }
  const id = (suffix: string) => `0583246e-c2d3-4e89-9373-093a2ef14c3${suffix}`;
  it("counts preparing → ready exactly once, including after reopening preparation", async () => {
    const db = client();
    const first = await db.rpc("update_order_with_completion", { _id: id("1"), _status: "pronto" });
    expect(first.error).toBeNull(); expect(first.data).toBe(true);
    const { data: row } = await db.from("orders").select("completed_at").eq("id", id("1")).single();
    expect(row?.completed_at).toBeTruthy();
    expect((await db.rpc("update_order_with_completion", { _id: id("1"), _status: "entregue" })).data).toBe(false);
    await db.rpc("update_order_with_completion", { _id: id("1"), _status: "em_preparo" });
    expect((await db.rpc("update_order_with_completion", { _id: id("1"), _status: "pronto" })).data).toBe(false);
    const again = await db.from("orders").select("completed_at").eq("id", id("1")).single();
    expect(again.data?.completed_at).toBe(row?.completed_at);
  });
  it("counts preparing → delivered", async () => {
    const result = await client().rpc("update_order_with_completion", { _id: id("2"), _status: "entregue" });
    expect(result.error).toBeNull(); expect(result.data).toBe(true);
  });
  it("does not count new → ready or payment confirmation", async () => {
    const db = client();
    expect((await db.rpc("update_order_with_completion", { _id: id("3"), _payment_status: "pago" })).data).toBe(false);
    expect((await db.rpc("update_order_with_completion", { _id: id("3"), _status: "pronto" })).data).toBe(false);
    const row = await db.from("orders").select("completed_at").eq("id", id("3")).single();
    expect(row.data?.completed_at).toBeNull();
  });
});