import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askTrackingInsights, getTrackingMetrics } from "@/lib/tracking-insights.functions";
import type { TrackingInsight, TrackingMetrics } from "@/lib/tracking-insights";

const SUGGESTED = ["As clientes de PIX acompanham até ver o pagamento confirmado?", "Em que etapa as clientes mais consultam o pedido?", "O que posso melhorar para as clientes ficarem menos ansiosas?"];

export function TrackingInsights() {
  const loadMetrics = useServerFn(getTrackingMetrics);
  const ask = useServerFn(askTrackingInsights);
  const [metrics, setMetrics] = useState<TrackingMetrics | null>(null);
  const [question, setQuestion] = useState(SUGGESTED[0]!);
  const [insight, setInsight] = useState<TrackingInsight | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadMetrics().then(setMetrics).catch(() => setError("Não foi possível carregar os números do acompanhamento.")); }, [loadMetrics]);

  async function submit() {
    if (busy || question.trim().length < 3) return;
    setBusy(true); setError(""); setInsight(null);
    try {
      const r = await ask({ data: { question } });
      setMetrics(r.metrics);
      if (r.ok) setInsight(r.insight); else setError(r.error);
    } catch { setError("Não foi possível concluir a análise agora."); } finally { setBusy(false); }
  }

  const stat = (label: string, value: string | number) => <div className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold">{value}</p></div>;

  return (
    <section aria-labelledby="insights-title" className="mt-8 rounded-xl border bg-card p-5">
      <h2 id="insights-title" className="font-display text-3xl">Como as clientes acompanham</h2>
      <p className="text-sm text-muted-foreground">Últimos 30 dias da página de acompanhamento. Sem nomes nem telefones.</p>
      {metrics && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stat("Pedidos acompanhados", `${metrics.trackedOrders} de ${metrics.orders}`)}
        {stat("Consultas de status", metrics.checks)}
        {stat("PIX que viram “Pago”", `${metrics.pixSawPaid} de ${metrics.pixTracked}`)}
        {stat("1ª consulta após pedir", metrics.avgMinutesToFirstCheck === null ? "—" : `${metrics.avgMinutesToFirstCheck.toLocaleString("pt-BR")} min`)}
      </div>}
      <label htmlFor="insight-q" className="mt-5 block text-sm font-semibold">Pergunte sobre o acompanhamento</label>
      <div className="mt-2 flex flex-wrap gap-2">{SUGGESTED.map((q) => <button key={q} type="button" onClick={() => setQuestion(q)} className="rounded-full border px-3 py-1 text-xs">{q}</button>)}</div>
      <Textarea id="insight-q" value={question} maxLength={500} onChange={(e) => setQuestion(e.target.value)} className="mt-2" rows={2} />
      <Button onClick={submit} disabled={busy} className="mt-3">{busy ? <Loader2 className="motion-safe:animate-spin" /> : <Sparkles />}Analisar com IA</Button>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      {insight && <div className="mt-4 space-y-3 text-sm" aria-live="polite">
        <p>{insight.summary}</p>
        {insight.patterns.length > 0 && <div><h3 className="font-semibold">Padrões</h3><ul className="mt-1 list-disc space-y-1 pl-5">{insight.patterns.map((p) => <li key={p}>{p}</li>)}</ul></div>}
        {insight.suggestions.length > 0 && <div><h3 className="font-semibold">Sugestões</h3><ul className="mt-1 space-y-2">{insight.suggestions.map((s) => <li key={s.title} className="rounded-lg border bg-background p-3"><strong>{s.title}</strong><p className="text-muted-foreground">{s.action}</p></li>)}</ul></div>}
        <p className="text-xs text-muted-foreground">Sugestões geradas por IA a partir dos números acima; confira antes de aplicar.</p>
      </div>}
    </section>
  );
}
