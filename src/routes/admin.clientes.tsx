import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccount } from "@/components/account-context";
import { listAdminCustomers } from "@/lib/admin-orders.functions";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, paymentLabel } from "@/lib/payments";
import { brl } from "@/lib/menu";

export const Route = createFileRoute("/admin/clientes")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "Clientes e pagamentos — Carina Farias" },
    { name: "description", content: "Histórico privado de pedidos e pagamentos dos clientes da Carina Farias." },
    { property: "og:title", content: "Clientes e pagamentos — Carina Farias" },
    { property: "og:description", content: "Consulta administrativa de clientes, pedidos e últimos status de pagamento." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }), component: CustomersPage,
});

function CustomersPage() {
  const { user, ready } = useAccount();
  const fetchCustomers = useServerFn(listAdminCustomers);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAdminCustomers>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const load = useCallback(async () => {
    setLoading(true); setError(""); setRows([]);
    try { setRows(await fetchCustomers()); }
    catch { setError("Não foi possível consultar os clientes. Verifique seu acesso de administração e tente novamente."); }
    finally { setLoading(false); }
  }, [fetchCustomers]);
  useEffect(() => { setRows([]); if (user) void load(); }, [user?.id, load]);
  const term = search.trim().toLocaleLowerCase("pt-BR");
  const shown = rows.filter((row) => (!term || row.name.toLocaleLowerCase("pt-BR").includes(term) || row.phone.replace(/\D/g, "").includes(term.replace(/\D/g, "") || term)) && (filter === "todos" || (filter === "pendente" ? row.pendingOrders > 0 : row.paidOrders > 0)));
  const date = (value: string) => new Date(value).toLocaleString("pt-BR", { timeZone: "America/Belem", dateStyle: "short", timeStyle: "short" });
  return <main className="mx-auto max-w-5xl px-5 py-10">
    <Button asChild variant="ghost" size="sm"><Link to="/admin"><ArrowLeft />Painel de pedidos</Link></Button>
    <h1 className="mt-4 font-display text-4xl sm:text-5xl">Clientes</h1>
    {!ready ? <p className="mt-6">Carregando…</p> : !user ? <Button asChild className="mt-6"><Link to="/auth" onClick={() => sessionStorage.setItem("authNext", "/admin/clientes")}>Entrar para consultar clientes</Link></Button> : <>
      <dl className="mt-6 grid grid-cols-2 gap-4 border-y py-5 sm:grid-cols-3">
        {[["Clientes", rows.length], ["Com pagamentos aguardando", rows.filter((r) => r.pendingOrders > 0).length], ["Com pedidos pagos", rows.filter((r) => r.paidOrders > 0).length]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-2xl font-bold">{value}</dd></div>)}
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <label className="relative min-w-0 flex-1 basis-60"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="pl-9" aria-label="Buscar cliente por nome ou telefone" placeholder="Nome ou telefone" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
        <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-full sm:w-56" aria-label="Filtrar clientes por pagamento"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os clientes</SelectItem><SelectItem value="pendente">Aguardando pagamento</SelectItem><SelectItem value="pago">Com pedidos pagos</SelectItem></SelectContent></Select>
        <Button variant="outline" onClick={load} disabled={loading}><RefreshCw className={loading ? "motion-safe:animate-spin" : ""} />Atualizar</Button>
      </div>
      {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
      {loading ? <p role="status" className="mt-6 text-muted-foreground">Consultando clientes…</p> : !error && !shown.length ? <p className="mt-6 text-muted-foreground">Nenhum cliente encontrado.</p> : <div className="mt-6 space-y-4">
        {shown.map((row) => <article key={row.id} className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap justify-between gap-3"><div className="min-w-0"><h2 className="break-words text-lg font-bold">{row.name}</h2><p className="text-sm text-muted-foreground">{row.phone || "Telefone não informado"} · {row.orders.length} pedidos</p></div><div className="text-sm"><p className={row.pendingOrders ? "font-semibold text-primary" : "text-muted-foreground"}>Aguardando: {brl(row.pending)}</p><p className="text-gold">Pago: {brl(row.paid)}</p></div></div>
          <div className="mt-3 border-t pt-3 text-sm"><p className="text-muted-foreground">Último pedido #{row.latest.number} · {date(row.latest.created_at)}</p><p className="mt-1 font-semibold">{ORDER_STATUS_LABELS[row.latest.status]} · {PAYMENT_STATUS_LABELS[row.latest.payment_status]}</p></div>
          <details className="mt-4"><summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary">Histórico de pedidos<ChevronDown className="size-4" /></summary>
            <div className="mt-3 divide-y">{row.orders.map((order) => <section key={order.id} aria-label={`Pedido ${order.number}`} className="py-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">Pedido #{order.number}</h3><span className="font-semibold">{brl(order.total)}</span></div>
              <p className="text-xs text-muted-foreground">{date(order.created_at)} · {paymentLabel(order.payment_method)}</p>
              <p className="mt-1">{ORDER_STATUS_LABELS[order.status]} · <span className={order.payment_status === "pendente" ? "text-primary" : order.payment_status === "pago" ? "text-gold" : "text-muted-foreground"}>{PAYMENT_STATUS_LABELS[order.payment_status]}</span></p>
              <ul className="mt-2 text-muted-foreground">{order.order_items.map((item, i) => <li key={i}>{item.qty}× {item.name} · {brl(item.qty * item.unit_price)}</li>)}</ul>
            </section>)}</div>
          </details>
        </article>)}
      </div>}
    </>}
  </main>;
}