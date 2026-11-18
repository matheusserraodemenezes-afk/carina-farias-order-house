import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/components/account-context";
import { getDailySales } from "@/lib/admin-orders.functions";
import { dailySalesSchema, localDay } from "@/lib/daily-sales";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/payments";
import { brl } from "@/lib/menu";

export const Route = createFileRoute("/admin/vendas")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "Vendas por dia — Carina Farias" },
    { name: "description", content: "Relatório privado de pedidos, pagamentos e faturamento diário da Carina Farias." },
    { property: "og:title", content: "Vendas por dia — Carina Farias" },
    { property: "og:description", content: "Acompanhamento administrativo das vendas diárias da Carina Farias." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }), component: DailySalesPage,
});

function DailySalesPage() {
  const { user, ready } = useAccount();
  const fetchSales = useServerFn(getDailySales);
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [rows, setRows] = useState<Awaited<ReturnType<typeof getDailySales>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("");
  const formatDay = (day: string) => day.split("-").reverse().join("/");
  async function load(start: string, end: string) {
    if (!dailySalesSchema.safeParse({ from: start, to: end }).success) { setError("Escolha datas válidas, em um período de até 93 dias."); return; }
    setLoading(true); setError(""); setRows([]);
    try {
      setRows(await fetchSales({ data: { from: start, to: end } }));
      setPeriod(`${formatDay(start)} a ${formatDay(end)}`);
    } catch { setError("Não foi possível consultar as vendas. Verifique seu acesso de administração e tente novamente."); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    setRows([]);
    if (!user) return;
    const end = localDay(new Date());
    const start = localDay(new Date(Date.now() - 6 * 86400000));
    setFrom(start); setTo(end); void load(start, end);
  }, [user?.id]);
  const totals = rows.reduce((a, r) => ({ orders: a.orders + r.orders, completed: a.completed + r.completed, value: a.value + r.value, paid: a.paid + r.paid, pending: a.pending + r.pending, refunded: a.refunded + r.refunded }), { orders: 0, completed: 0, value: 0, paid: 0, pending: 0, refunded: 0 });
  return <main className="mx-auto max-w-5xl px-5 py-10">
    <Button asChild variant="ghost" size="sm"><Link to="/admin"><ArrowLeft />Painel de pedidos</Link></Button>
    <h1 className="mt-4 font-display text-4xl sm:text-5xl">Vendas por dia</h1>
    {!ready ? <p className="mt-6">Carregando…</p> : !user ? <Button asChild className="mt-6"><Link to="/auth" onClick={() => sessionStorage.setItem("authNext", "/admin/vendas")}>Entrar para consultar vendas</Link></Button> : <>
      <form className="mt-6 grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap" onSubmit={(e) => { e.preventDefault(); void load(from, to); }}>
        <label className="min-w-0 text-sm">De<Input className="mt-1" aria-label="Data inicial" type="date" value={from} onChange={(e) => setFrom(e.target.value)} required /></label>
        <label className="min-w-0 text-sm">Até<Input className="mt-1" aria-label="Data final" type="date" value={to} onChange={(e) => setTo(e.target.value)} required /></label>
        <Button className="col-span-2 sm:w-auto" type="submit" disabled={loading}><RefreshCw className={loading ? "motion-safe:animate-spin" : ""} />Consultar</Button>
      </form>
      {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
      {loading ? <p role="status" className="mt-6 text-muted-foreground">Consultando vendas…</p> : rows.length > 0 && <>
        <p className="mt-6 text-sm text-muted-foreground">{period} · Horário de Belém</p>
        <dl className="mt-4 grid grid-cols-2 gap-5 border-y py-5 sm:grid-cols-3">
          {[["Pedidos recebidos", totals.orders], ["Pedidos feitos", totals.completed], ["Valor dos pedidos", brl(totals.value)], ["Pago · faturamento", brl(totals.paid)], ["Aguardando pagamento", brl(totals.pending)], ["Estornado", brl(totals.refunded)]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-xl font-bold">{value}</dd></div>)}
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">Valores por data do pedido, incluindo entrega. Cancelados e estornados não entram no faturamento. Pedidos feitos usam a data da primeira conclusão.</p>
        <div className="mt-6 space-y-0">
          {rows.map((row) => <section key={row.day} aria-label={`Vendas de ${formatDay(row.day)}`} className="border-b py-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold">{formatDay(row.day)}</h2><p className="text-sm">{row.orders} pedidos · {row.completed} feitos</p></div>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Valor", row.value], ["Pago", row.paid], ["Pendente", row.pending], ["Estornado", row.refunded]].map(([label, amount]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="font-semibold">{brl(Number(amount))}</dd></div>)}</dl>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">{Object.entries(row.statuses).map(([status, count]) => <span key={status}>{ORDER_STATUS_LABELS[status as OrderStatus] ?? status}: {count}</span>)}{!row.orders && <span>Nenhum pedido recebido.</span>}</div>
          </section>)}
        </div>
      </>}
    </>}
  </main>;
}