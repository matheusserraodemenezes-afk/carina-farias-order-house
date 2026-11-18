import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ArrowLeft, Check, RefreshCw } from "lucide-react";
import { getOrderTracking } from "@/lib/order-tracking.functions";
import { recordStatusCheck } from "@/lib/tracking-insights.functions";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, paymentLabel, type OrderStatus, type PaymentStatus } from "@/lib/payments";
import { PixPayment } from "@/components/pix-payment";
import { CONTACT_URL, brl } from "@/lib/menu";
import { orderEta } from "@/lib/order-eta";

const hhmm = (d: Date) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Belem" });

const trackingQuery = (id: string) => queryOptions({
  queryKey: ["order-tracking", id],
  queryFn: () => getOrderTracking({ data: { id } }),
  refetchInterval: 15_000, // atualiza sozinho quando a loja muda o status
});

export const Route = createFileRoute("/pedido/$id")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "Acompanhe seu pedido — Carina Farias" },
    { name: "description", content: "Veja o pagamento e o andamento do seu pedido na Carina Farias." },
    { property: "og:title", content: "Acompanhe seu pedido — Carina Farias" },
    { property: "og:description", content: "Pagamento e andamento do pedido em tempo real." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(trackingQuery(params.id)),
  component: TrackingPage,
  errorComponent: ({ error }) => {
    const router = useRouter();
    return <Shell><p role="alert">{error instanceof Error && !error.message.includes("uuid") ? error.message : "Link de pedido inválido."}</p><button className="mt-3 underline" onClick={() => router.invalidate()}>Tentar de novo</button></Shell>;
  },
  notFoundComponent: () => <Shell><p>Pedido não encontrado.</p></Shell>,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> Voltar ao cardápio</Link>
      {children}
    </main>
  );
}

const STEPS: OrderStatus[] = ["novo", "em_preparo", "pronto", "saiu_entrega", "entregue"];

function TrackingPage() {
  const { id } = Route.useParams();
  const { data: order, isFetching, refetch } = useSuspenseQuery(trackingQuery(id));
  const statusKey = order ? `${order.paymentStatus}|${order.status}` : "none";
  // Registra cada status que a cliente viu (uma vez por combinação, não a cada atualização automática).
  const lastTracked = useRef<string | null>(null);
  useEffect(() => {
    if (!order || lastTracked.current === statusKey) return;
    lastTracked.current = statusKey;
    recordStatusCheck({ data: { id } }).catch(() => {});
    window.__lovableEvents?.track?.("project.order_status_viewed", { payment_status: order.paymentStatus, order_status: order.status, mode: order.mode, payment_method: order.paymentMethod });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusKey]);
  if (!order) return <Shell><h1 className="font-display text-4xl">Pedido não encontrado</h1><p className="mt-2 text-muted-foreground">Confira o link ou fale com a loja pelo WhatsApp.</p></Shell>;

  const steps = STEPS.filter((s) => order.mode === "entrega" || s !== "saiu_entrega");
  const current = steps.indexOf(order.status as OrderStatus);
  const paid = order.paymentStatus === "pago";
  const cancelled = order.status === "cancelado";
  const eta = orderEta(order.createdAt, order.mode, order.status);

  return (
    <Shell>
      <h1 className="font-display text-4xl text-ember">Pedido #{order.number}</h1>
      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString("pt-BR", { timeZone: "America/Belem" })} · {order.mode === "entrega" ? "Entrega" : "Retirada na loja"}</p>

      {eta && (
        <section className="mt-6 rounded-xl border border-primary bg-card p-4" aria-live="polite">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Previsão</h2>
          <p className="mt-1 text-sm">Pronto por volta de <strong className="text-lg">{hhmm(eta.readyAt)}</strong></p>
          {eta.arriveAt && <p className="text-sm">Chega até você por volta de <strong className="text-lg text-primary">{hhmm(eta.arriveAt)}</strong></p>}
          <p className="mt-2 text-xs text-muted-foreground">{eta.late ? "Está levando um pouco mais que o normal. Qualquer dúvida, fale com a loja." : "Horário estimado; pode variar com o movimento."}</p>
        </section>
      )}

      <section className="mt-4 rounded-xl border bg-card p-4" aria-live="polite">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Pagamento · {paymentLabel(order.paymentMethod)}</h2>
        <p className={`mt-1 text-2xl font-bold ${paid ? "text-gold" : "text-primary"}`}>{PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus] ?? order.paymentStatus}</p>
        {!paid && order.paymentMethod === "pix" && order.paymentStatus === "pendente" && (
          <><p className="mt-1 text-sm text-muted-foreground">Assim que a loja confirmar o seu PIX, esta página muda para "Pago".</p><div className="mt-3"><PixPayment amount={order.total} reference={`Pedido ${order.number}`} /></div></>
        )}
      </section>

      <section className="mt-4 rounded-xl border bg-card p-4" aria-live="polite">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Andamento</h2>
        {cancelled ? <p className="mt-2 text-xl font-bold text-destructive">Pedido cancelado</p> : (
          <ol className="mt-3 space-y-3">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className={`flex size-7 items-center justify-center rounded-full border text-xs ${i <= current ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{i < current ? <Check className="size-4" /> : i + 1}</span>
                <span className={i === current ? "font-bold" : i < current ? "" : "text-muted-foreground"}>{ORDER_STATUS_LABELS[s]}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-4 rounded-xl border bg-card p-4 text-sm">
        {order.items.map((i) => <p key={i.name} className="flex justify-between"><span>{i.qty}x {i.name}</span><span>{brl(i.qty * i.price)}</span></p>)}
        {order.mode === "entrega" && <p className="mt-2 flex justify-between text-muted-foreground"><span>Entrega</span><span>{brl(order.fee)}</span></p>}
        <p className="mt-2 flex justify-between font-bold"><span>Total</span><span>{brl(order.total)}</span></p>
      </section>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"><RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Atualizar</button>
        <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" className="text-sm underline">Falar com a loja</a>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Esta página se atualiza sozinha a cada 15 segundos.</p>
    </Shell>
  );
}
