import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, BarChart3, Loader2, Plus, Sparkles, Trash2, Pencil, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logoAsset from "@/assets/carina-original-logo.jpg.asset.json";
import { MENU, brl } from "@/lib/menu";
import { salesInputSchema, salesMetrics, type SalesInput, type SalesAnalysis } from "@/lib/sales-analysis";
import { analyzeSales } from "@/lib/sales-analysis.functions";

export const Route = createFileRoute("/vendas")({
  head: () => ({ meta: [
    { title: "Vendas e promoções — Carina Farias" },
    { name: "description", content: "Análise de pedidos, combinações populares e sugestões de promoções da Carina Farias." },
    { property: "og:title", content: "Vendas e promoções — Carina Farias" },
    { property: "og:description", content: "Combinações do cardápio e sugestões para valorizar cada pedido." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: SalesPage,
});

type Line = { id: string; qty: number };
const newLine = (): Line => ({ id: "", qty: 1 });

function SalesPage() {
  const [period, setPeriod] = useState("");
  const [orders, setOrders] = useState<SalesInput["orders"]>([]);
  const [draft, setDraft] = useState<Line[]>([newLine()]);
  const [paid, setPaid] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<SalesAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const pending = useRef(false);
  const analyze = useServerFn(analyzeSales);
  const metrics = useMemo(() => orders.length ? salesMetrics({ period: period.trim() || "Período não informado", orders }) : null, [orders, period]);
  const draftTotal = draft.reduce((sum, line) => sum + (MENU.find((item) => item.id === line.id)?.price ?? 0) * line.qty, 0);
  const changeDraft = (index: number, change: Partial<Line>) => setDraft((current) => current.map((line, i) => i === index ? { ...line, ...change } : line));

  function saveOrder() {
    const order = { items: draft, paid: paid.trim() ? Number(paid.replace(",", ".")) : draftTotal };
    const next = editing === null ? [...orders, order] : orders.map((entry, i) => i === editing ? order : entry);
    const parsed = salesInputSchema.safeParse({ period: period.trim() || "Período não informado", orders: next });
    if (!parsed.success) { setError("Selecione produtos diferentes, quantidades de 1 a 100 e um valor válido. Limite de 200 pedidos."); return; }
    setOrders(parsed.data.orders); setDraft([newLine()]); setPaid(""); setEditing(null); setAnalysis(null); setError("");
  }

  async function submitAnalysis() {
    if (pending.current) return;
    if (draft.some((line) => line.id)) { setError("Registre ou cancele o pedido em edição antes de analisar."); return; }
    const input = salesInputSchema.safeParse({ period, orders });
    if (!input.success) { setError("Informe o período e registre pelo menos um pedido para analisar."); return; }
    pending.current = true; setLoading(true); setError(""); setAnalysis(null);
    try {
      const result = await analyze({ data: input.data });
      if (result.ok) setAnalysis(result.analysis); else setError(result.error);
    } catch { setError("A análise não pôde ser concluída. Os pedidos informados foram mantidos."); }
    finally { pending.current = false; setLoading(false); }
  }

  return <div className="min-h-screen">
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3"><img src={logoAsset.url} alt="Carina Farias" className="h-14 w-16 shrink-0 object-contain" /><span className="font-display text-2xl">Carina Farias</span></div>
        <Button asChild variant="outline" size="sm"><Link to="/"><ArrowLeft className="h-4 w-4" />Cardápio</Link></Button>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 flex items-start gap-4"><BarChart3 className="mt-1 h-8 w-8 shrink-0 text-primary" /><div><p className="text-sm uppercase text-gold">Gestão da Carina</p><h1 className="font-display text-5xl sm:text-6xl">Vendas e promoções</h1></div></div>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="sales-entry">
          <h2 id="sales-entry" className="font-display text-3xl">Pedidos vendidos</h2>
          <div className="mt-5"><Label htmlFor="sales-period">Período das vendas</Label><Input id="sales-period" value={period} disabled={loading} maxLength={80} placeholder="Ex.: 9 a 15 de novembro de 2026" className="mt-2" onChange={(e) => { setPeriod(e.target.value); setAnalysis(null); }} /></div>
          <fieldset disabled={loading} className="mt-6 space-y-4 border-y py-5">
            <legend className="font-semibold">{editing === null ? "Novo pedido" : `Editar pedido ${editing + 1}`}</legend>
            {draft.map((line, index) => <div key={index} className="flex items-end gap-2">
              <div className="min-w-0 flex-1"><Label htmlFor={`product-${index}`}>Produto {index + 1}</Label><Select value={line.id} onValueChange={(id) => changeDraft(index, { id })} disabled={loading}>
                <SelectTrigger id={`product-${index}`} className="mt-2 w-full [&>span]:truncate"><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
                <SelectContent>{MENU.filter((item) => item.id === line.id || !draft.some((entry) => entry.id === item.id)).map((item) => <SelectItem key={item.id} value={item.id}>{item.name} · {brl(item.price)}</SelectItem>)}</SelectContent>
              </Select></div>
              <div className="w-16 shrink-0"><Label htmlFor={`quantity-${index}`}>Qtd.</Label><Input id={`quantity-${index}`} type="number" min={1} max={100} step={1} className="mt-2" value={Number.isNaN(line.qty) ? "" : line.qty} onChange={(e) => changeDraft(index, { qty: Number(e.target.value) })} /></div>
              <Button variant="ghost" size="icon" aria-label={`Remover produto ${index + 1}`} title="Remover produto" disabled={draft.length === 1 || loading} onClick={() => setDraft((current) => current.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
            </div>)}
            <Button variant="outline" size="sm" disabled={draft.length >= MENU.length || loading} onClick={() => setDraft((current) => [...current, newLine()])}><Plus className="h-4 w-4" />Outro produto</Button>
            <div className="flex justify-between gap-3 text-sm text-muted-foreground"><span>Total pelo cardápio</span><span className="font-semibold text-foreground">{brl(draftTotal)}</span></div>
            <div><Label htmlFor="sales-paid">Valor recebido pelos produtos (R$, sem entrega)</Label><Input id="sales-paid" inputMode="decimal" className="mt-2" value={paid} maxLength={12} placeholder={draftTotal.toFixed(2).replace(".", ",")} onChange={(e) => setPaid(e.target.value)} /><p className="mt-2 text-xs text-muted-foreground">Se vazio, considera o total do cardápio. Descontos já concedidos devem ser descontados deste valor.</p></div>
            <div className="flex flex-wrap gap-2"><Button onClick={saveOrder} disabled={loading || (orders.length >= 200 && editing === null)}><Plus className="h-4 w-4" />{editing === null ? "Registrar pedido" : "Salvar pedido"}</Button><Button variant="ghost" disabled={loading} onClick={() => { setDraft([newLine()]); setPaid(""); setEditing(null); }}>Cancelar</Button></div>
          </fieldset>
          <div className="mt-6 flex items-center justify-between gap-3"><h3 className="font-semibold">{orders.length} pedidos registrados</h3>{orders.length > 0 && <Button variant="ghost" size="sm" disabled={loading} onClick={() => { if (window.confirm("Apagar todos os pedidos informados?")) { setOrders([]); setAnalysis(null); setEditing(null); setDraft([newLine()]); setPaid(""); } }}>Limpar</Button>}</div>
          <div className="mt-3 max-h-80 overflow-y-auto divide-y">
            {!orders.length && <p className="py-6 text-sm text-muted-foreground">Nenhuma venda informada.</p>}
            {orders.map((order, index) => <div key={index} className="flex items-start gap-2 py-3"><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Pedido {index + 1} · {brl(order.paid)}</p><p className="mt-1 text-sm text-muted-foreground break-words">{order.items.map((line) => `${line.qty}× ${MENU.find((item) => item.id === line.id)?.name}`).join(" + ")}</p></div><Button variant="ghost" size="icon" disabled={loading || editing !== null} title="Editar pedido" aria-label={`Editar pedido ${index + 1}`} onClick={() => { setEditing(index); setDraft(order.items.map((line) => ({ ...line }))); setPaid(String(order.paid)); setError(""); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" disabled={loading || editing !== null} title="Excluir pedido" aria-label={`Excluir pedido ${index + 1}`} onClick={() => { setOrders((current) => current.filter((_, i) => i !== index)); setAnalysis(null); }}><Trash2 className="h-4 w-4" /></Button></div>)}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Sem nomes ou contatos de clientes. Dados temporários desta página, não salvos. As métricas se referem apenas aos pedidos informados.</p>
        </section>
        <section aria-labelledby="sales-results" className="min-w-0">
          <h2 id="sales-results" className="font-display text-3xl">Retrato das vendas</h2>
          <div className="mt-5 grid grid-cols-3 gap-3 border-y py-5">
            {[{ label: "Pedidos", value: metrics ? String(metrics.orderCount) : "—" }, { label: "Receita", value: metrics ? brl(metrics.revenue) : "—" }, { label: "Ticket médio", value: metrics ? brl(metrics.average) : "—" }].map((stat) => <div key={stat.label} className="min-w-0"><p className="text-xs text-muted-foreground">{stat.label}</p><p className="mt-2 break-words text-lg font-semibold sm:text-2xl">{stat.value}</p></div>)}
          </div>
          <h3 className="mt-6 flex items-center gap-2 font-semibold"><ShoppingBag className="h-4 w-4 text-gold" />Comprados juntos</h3>
          <div className="mt-3 divide-y">{metrics?.pairs.length ? metrics.pairs.map((pair) => <div key={pair.ids.join("|")} className="flex items-start justify-between gap-4 py-3"><p className="min-w-0 text-sm">{pair.ids.map((id) => MENU.find((item) => item.id === id)?.name).join(" + ")}</p><p className="shrink-0 text-right text-sm"><b>{pair.count} pedidos</b><br /><span className="text-muted-foreground">{pair.share.toLocaleString("pt-BR")}%</span></p></div>) : <p className="py-5 text-sm text-muted-foreground">Ainda não há produtos comprados juntos nos pedidos informados.</p>}</div>
          <div className="mt-7 border-t pt-6"><h3 className="font-display text-3xl">Oportunidades de promoção</h3><Button className="mt-4 w-full" disabled={loading || !orders.length} onClick={submitAnalysis}>{loading ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Sparkles className="h-4 w-4" />}{loading ? "Analisando vendas…" : "Analisar e sugerir promoções"}</Button>
            {error && <p role="alert" className="mt-4 rounded-md border border-destructive p-3 text-sm">{error}</p>}
            <div aria-live="polite">{analysis && <><p className="mt-5 whitespace-pre-line text-sm leading-relaxed">{analysis.summary}</p><div className="mt-5 space-y-4">{analysis.promotions.map((promo, index) => <article key={index} className="rounded-md border bg-card p-5"><p className="text-xs font-semibold uppercase text-gold">Sugestão para testar · não ativa</p><h4 className="mt-2 text-lg font-bold break-words">{promo.title}</h4><ul className="mt-3 space-y-1 text-sm">{promo.items.map((item) => <li key={item.id}>{item.qty}× {item.name}</li>)}</ul><p className="mt-3 text-sm text-muted-foreground">{promo.reason}</p><dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-2"><dt>Preço atual dos produtos</dt><dd>{brl(promo.regular)}</dd></div><div className="flex justify-between gap-2"><dt>Desconto hipotético</dt><dd>{promo.discountPercent}%</dd></div><div className="flex justify-between gap-2 font-bold"><dt>Preço sugerido do combo</dt><dd className="text-gold">{brl(promo.suggested)}</dd></div></dl><p className="mt-3 text-xs text-muted-foreground">{promo.difference >= 0 ? `${brl(promo.difference)} acima` : `${brl(Math.abs(promo.difference))} abaixo`} do ticket médio informado; não é previsão de aumento.</p><p className="mt-4 border-t pt-3 text-sm">{promo.action}</p></article>)}</div><p className="mt-4 text-xs text-muted-foreground">Valide custos e margem antes de aplicar descontos. Nenhuma promoção foi aplicada ao cardápio ou ao carrinho.</p></>}</div>
          </div>
        </section>
      </div>
    </main>
  </div>;
}