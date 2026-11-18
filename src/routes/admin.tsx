import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw, ChartNoAxesCombined, Users, WifiOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccount } from "@/components/account-context";
import { TrackingInsights } from "@/components/tracking-insights";
import { OrderAlerts } from "@/components/order-alerts";
import { checkAdmin, listAdminOrders, updateAdminOrder } from "@/lib/admin-orders.functions";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, paymentLabel, type OrderStatus, type PaymentStatus } from "@/lib/payments";
import { brl } from "@/lib/menu";
import { readOfflineOrders, saveOfflineOrders, clearOfflineOrders } from "@/lib/offline-orders";

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "Painel de pedidos — Carina Farias" },
    { name: "description", content: "Acompanhe pedidos e confirme pagamentos da Carina Farias." },
    { property: "og:title", content: "Painel de pedidos — Carina Farias" },
    { property: "og:description", content: "Área restrita da administração da Carina Farias." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ], links: [
    { rel: "manifest", href: "/manifest.webmanifest" },
    { rel: "apple-touch-icon", href: "/panel-icon-180.png" },
  ] }),
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  return <><OrderAlerts />{(path === "/admin" || path === "/admin/") && <AdminPage />}<Outlet /></>;
}

type AdminOrder = Awaited<ReturnType<typeof listAdminOrders>>[number];
const paymentTone: Record<PaymentStatus, string> = { pendente: "border-primary text-primary", pago: "border-gold text-gold", estornado: "border-muted-foreground text-muted-foreground" };

function AdminPage() {
  const { user, ready } = useAccount();
  const check = useServerFn(checkAdmin);
  const list = useServerFn(listAdminOrders);
  const update = useServerFn(updateAdminOrder);
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"todos" | PaymentStatus>("todos");

  const [offline, setOffline] = useState(false);
  const [savedAt, setSavedAt] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const fresh = await list(); setOrders(fresh);
      if (user) { try { setSavedAt(saveOfflineOrders(user.id, fresh).savedAt); } catch { setError("O celular ficou sem espaço para salvar todo o histórico."); } }
    } catch { setError("Não foi possível atualizar os pedidos. Os dados salvos podem estar desatualizados."); } finally { setLoading(false); }
  }, [list, user?.id]);

  useEffect(() => {
    let active = true;
    if (!user) { setAdmin(null); setOrders([]); setSavedAt(""); return; }
    const connect = () => {
      setOffline(!navigator.onLine);
      if (!navigator.onLine) {
        const snapshot = readOfflineOrders(user.id);
        setOrders(snapshot?.orders ?? []); setSavedAt(snapshot?.savedAt ?? ""); setAdmin(Boolean(snapshot));
        setError(snapshot ? "" : "Abra o painel com internet primeiro para salvar os pedidos neste celular."); return;
      }
      setAdmin(null);
      check().then((r) => {
        if (!active) return;
        setAdmin(r.admin);
        if (r.admin) void load(); else { clearOfflineOrders(); setOrders([]); setSavedAt(""); }
      }).catch(() => { if (active) { setAdmin(false); setOrders([]); } });
    };
    connect(); window.addEventListener("online", connect); window.addEventListener("offline", connect);
    return () => { active = false; window.removeEventListener("online", connect); window.removeEventListener("offline", connect); };
  }, [user?.id, check, load]);

  useEffect(() => {
    if (!admin) return;
    const refresh = () => { void load(); };
    window.addEventListener("admin:new-orders", refresh);
    return () => window.removeEventListener("admin:new-orders", refresh);
  }, [admin, load]);

  async function change(id: string, patch: { paymentStatus?: PaymentStatus; status?: OrderStatus }) {
    if (offline || !navigator.onLine) return;
    const previous = orders;
    setOrders((all) => all.map((o) => o.id === id ? { ...o, ...(patch.paymentStatus ? { payment_status: patch.paymentStatus } : {}), ...(patch.status ? { status: patch.status } : {}) } : o));
    try {
      const result = await update({ data: { id, ...patch } });
      if (result.completed && result.status) {
        window.__lovableEvents?.track?.("project.order_completed", { status: result.status });
      }
      void load();
    } catch { setOrders(previous); setError("Não foi possível salvar a alteração. Tente novamente."); }
  }

  const shown = orders.filter((o) => filter === "todos" || o.payment_status === filter);
  const waiting = orders.filter((o) => o.payment_status === "pendente" && o.status !== "cancelado").length;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft />Voltar ao cardápio</Link></Button>
      <h1 className="mt-4 font-display text-5xl">Painel de pedidos</h1>
      {offline && <p role="status" className="mt-4 flex items-center gap-2 text-primary"><WifiOff className="size-4 shrink-0" />Sem internet · somente consulta dos pedidos salvos.</p>}
      {error && !admin && <p role="alert" className="mt-4 text-destructive">{error}</p>}
      {!ready ? <p className="mt-6 text-muted-foreground">Carregando…</p>
      : !user ? <div className="mt-6"><p className="text-muted-foreground">Entre com a conta da administração para ver os pedidos.</p><Button asChild className="mt-4"><Link to="/auth" onClick={() => sessionStorage.setItem("authNext", "/admin")}>Entrar</Link></Button></div>
      : admin === null ? <p className="mt-6 text-muted-foreground">Verificando acesso…</p>
      : !admin ? <p className="mt-6 text-destructive">Esta conta não tem acesso de administração.</p>
      : <>
        {savedAt && <div className="mt-4 flex flex-wrap items-center gap-3"><p className="text-xs text-muted-foreground">Salvo neste celular · {new Date(savedAt).toLocaleString("pt-BR", { timeZone: "America/Belem" })} · histórico completo ({orders.length} pedidos)</p><Button variant="ghost" size="sm" onClick={() => { clearOfflineOrders(); setSavedAt(""); if (offline) { setOrders([]); setAdmin(false); } }}><Trash2 />Apagar do celular</Button></div>}
        {!offline && <nav className="mt-6 flex flex-wrap gap-3" aria-label="Áreas do painel">
          <Button asChild variant="outline"><Link to="/admin/vendas"><ChartNoAxesCombined />Vendas por dia</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/clientes"><Users />Clientes</Link></Button>
        </nav>}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="mr-auto text-sm"><strong className="text-primary">{waiting}</strong> aguardando pagamento</p>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}><SelectTrigger className="w-52" aria-label="Filtrar pagamento"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os pagamentos</SelectItem>{(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => <SelectItem key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</SelectItem>)}</SelectContent></Select>
          <Button variant="outline" onClick={load} disabled={loading || offline}>{loading ? <Loader2 className="motion-safe:animate-spin" /> : <RefreshCw />}Atualizar</Button>
        </div>
        {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
        {!offline && <TrackingInsights />}
        {!loading && !shown.length && <p className="mt-6 text-muted-foreground">Nenhum pedido encontrado.</p>}
        <div className="mt-6 space-y-4">
          {shown.map((o) => (
            <article key={o.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><h2 className="text-lg font-bold">Pedido #{o.number}</h2><p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("pt-BR")}</p></div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${paymentTone[o.payment_status as PaymentStatus]}`}>{PAYMENT_STATUS_LABELS[o.payment_status as PaymentStatus]}</span>
              </div>
              <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p><strong>{o.customer_name}</strong> · <a className="underline" href={`https://wa.me/55${o.customer_phone.replace(/^55/, "")}`} target="_blank" rel="noopener noreferrer">{o.customer_phone}</a></p>
                  <p>{o.mode === "entrega" ? `Entrega: ${o.address}` : "Retirada na loja"}</p>
                  <p>Pagamento: {paymentLabel(o.payment_method)}</p>
                  {o.notes && <p className="text-muted-foreground">Obs.: {o.notes}</p>}
                </div>
                <ul className="space-y-1">
                  {o.order_items.map((i, n) => <li key={n} className="flex justify-between gap-2"><span>{i.qty}× {i.name}</span><span>{brl(i.qty * i.unit_price)}</span></li>)}
                  <li className="flex justify-between border-t pt-1 font-bold"><span>Total</span><span className="text-gold">{brl(o.total)}</span></li>
                </ul>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold">Pagamento<Select disabled={offline} value={o.payment_status} onValueChange={(v) => change(o.id, { paymentStatus: v as PaymentStatus })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((s) => <SelectItem key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</SelectItem>)}</SelectContent></Select></label>
                <label className="text-xs font-semibold">Pedido<Select disabled={offline} value={o.status} onValueChange={(v) => change(o.id, { status: v as OrderStatus })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>)}</SelectContent></Select></label>
              </div>
            </article>
          ))}
        </div>
      </>}
    </main>
  );
}
