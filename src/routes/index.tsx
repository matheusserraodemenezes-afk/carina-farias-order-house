import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { MealRecommendations } from "@/components/meal-recommendations";
import { CartExtras } from "@/components/cart-extras";
import { productImages } from "@/lib/product-images";
import hero from "@/assets/hero-picanha.jpg";
import logoAsset from "@/assets/carina-original-logo.jpg.asset.json";
import { Button } from "@/components/ui/button";
import espetinhos from "@/assets/espetinhos.jpg";
import prato from "@/assets/prato.jpg";
import bebidas from "@/assets/bebidas.jpg";
import { createOrder } from "@/lib/orders.functions";
import { whatsappUrl } from "@/lib/whatsapp";
import { PAYMENT_OPTIONS, PAYMENT_STATUS_LABELS, paymentLabel, type PaymentId } from "@/lib/payments";
import { PixPayment } from "@/components/pix-payment";
import { ADDRESS, CONTACT, CONTACT_URL, CATEGORIES, DELIVERY_FEE, MENU, brl, type Category } from "@/lib/menu";
const logo = logoAsset.url;

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Carina Farias — Churrascaria & Lanchonete no Jurunas" },
      { name: "description", content: "Cardápio da Carina Farias: churrascos, lanches, sopa, sucos de 400ml e refrigerantes no Jurunas. Consulte a loja pelo WhatsApp." },
      { property: "og:title", content: "Carina Farias — Churrascaria" },
      { property: "og:description", content: "Churrasco na brasa que dá água na boca. Peça com entrega ou retirada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Order = { id: number; items: { name: string; qty: number; price: number }[]; mode: string; name: string; phone: string; address: string; payment: string; paymentId: PaymentId; changeFor: number | null; trackingId: string | undefined; subtotal: number; fee: number; total: number; date: string; saved: boolean };

const orderWhatsApp = (order: Order) => whatsappUrl({ number: order.id, mode: order.mode, name: order.name, phone: order.phone, address: order.address, payment: order.payment, paymentStatus: PAYMENT_STATUS_LABELS.pendente, notes: order.changeFor ? `Troco para ${brl(order.changeFor)}` : undefined, trackingUrl: order.trackingId ? `${window.location.origin}/pedido/${order.trackingId}` : undefined, items: order.items, subtotal: order.subtotal, fee: order.fee, total: order.total });

function Index() {
  const [cat, setCat] = useState<Category>("Churrasco");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"entrega" | "retirada">("entrega");
  const [payment, setPayment] = useState<PaymentId>("pix");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [change, setChange] = useState("");
  const saveOrder = useServerFn(createOrder);

  const add = (id: string, d: number) => setCart((c) => { const n = Math.max(0, (c[id] ?? 0) + d); const x = { ...c, [id]: n }; if (!n) delete x[id]; return x; });
  const lines = useMemo(() => Object.entries(cart).flatMap(([id, qty]) => { const item = MENU.find((m) => m.id === id); return item ? [{ item, qty }] : []; }), [cart]);
  const addCombination = (items: { id: string; qty: number }[]) => setCart((current) => {
    const next = { ...current };
    for (const item of items) if (MENU.some((entry) => entry.id === item.id)) next[item.id] = (next[item.id] ?? 0) + item.qty;
    return next;
  });
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.item.price, 0);
  const fee = mode === "entrega" && subtotal > 0 ? DELIVERY_FEE : 0;

  const submit = async () => {
    if (busy) return;
    if (!lines.length || !form.name || !form.phone || (mode === "entrega" && !form.address)) return alert("Preencha nome, telefone e endereço.");
    const changeFor = payment === "dinheiro" && change.trim() ? Number(change.replace(",", ".")) : null;
    if (changeFor !== null && (!Number.isFinite(changeFor) || changeFor < subtotal + fee)) return alert("Informe um valor de troco maior que o total.");
    setBusy(true);
    // Abre a aba do WhatsApp já no clique (navegadores bloqueiam abrir depois de esperar o servidor).
    const waWindow = window.open("", "_blank");
    // Se o registro no sistema falhar, o pedido NÃO se perde: a nota abre igual e o cliente envia pelo WhatsApp.
    let id = Math.floor(1000 + Math.random() * 9000);
    let saved = false;
    let trackingId: string | undefined;
    try {
      const result = await saveOrder({ data: { mode, name: form.name, phone: form.phone, address: mode === "entrega" ? form.address : "", payment, changeFor, items: lines.map((l) => ({ id: l.item.id, qty: l.qty })) } });
      id = result.number; saved = true; trackingId = result.id;
    } catch (error) { console.error("Pedido não registrado:", error); }
    const placed: Order = {
      id, saved, trackingId, paymentId: payment, changeFor,
      items: lines.map((l) => ({ name: l.item.name, qty: l.qty, price: l.item.price })),
      mode, ...form, payment: paymentLabel(payment),
      subtotal, fee, total: subtotal + fee, date: new Date().toLocaleString("pt-BR"),
    };
    setOrder(placed);
    if (waWindow) waWindow.location.href = orderWhatsApp(placed);
    setCart({}); setOpen(false); setBusy(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <span className="flex items-center gap-2">
            <img src={logo} alt="Churrascaria e Lanchonete da Carina" width={200} height={140} className="h-12 w-16 object-contain" />
            <span className="font-display text-2xl tracking-wide">Carina <span className="text-ember">Farias</span></span>
          </span>
          <button onClick={() => setOpen(true)} className="relative rounded-full bg-ember px-4 py-2 text-sm font-bold text-primary-foreground shadow-ember">
            Carrinho {count > 0 && <span className="ml-1 rounded-full bg-background px-2 text-foreground">{count}</span>}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden">
        <img src={hero} alt="Carnes na brasa da churrascaria Carina Farias" width={1088} height={1600} className="absolute inset-0 h-full w-full object-cover scale-105 animate-in fade-in zoom-in-110 duration-1000" />
        <div className="absolute inset-0 bg-fade" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-32">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-gold">Direto da brasa pra sua mesa</p>
          <h1 className="font-display text-7xl leading-[0.9] md:text-9xl">Carina<br /><span className="text-ember">Farias</span></h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">Churrascaria &amp; Lanchonete. Carne, calabresa e frango na brasa, lanches e sopa da Carina.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#cardapio" className="rounded-full bg-ember px-8 py-4 text-lg font-bold text-primary-foreground shadow-ember transition hover:scale-105">Pedir agora</a>
            <a href="#cardapio" className="rounded-full border border-foreground/30 px-8 py-4 text-lg font-semibold backdrop-blur">Ver cardápio</a>
            <Button asChild variant="outline" size="lg"><a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">Falar com a Carina</a></Button>
          </div>
          <div className="mt-10 flex gap-8 text-sm text-muted-foreground">
            <div><b className="font-display text-3xl text-foreground">100%</b><br />na brasa</div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-16 md:grid-cols-3">
        {[{ src: espetinhos, t: "Espetinhos no ponto" }, { src: prato, t: "Marmita completa" }, { src: bebidas, t: "Bebidas geladas" }].map((g) => (
          <div key={g.t} className="group relative h-72 overflow-hidden rounded-xl">
            <img src={g.src} alt={g.t} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-fade" />
            <span className="absolute bottom-4 left-4 font-display text-3xl">{g.t}</span>
          </div>
        ))}
      </section>

      {/* Menu */}
      <MealRecommendations onAdd={addCombination} />
      <section id="cardapio" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-32">
        <h2 className="font-display text-6xl">Cardápio</h2>
        <p className="mt-2 text-sm text-muted-foreground">Imagens ilustrativas geradas por IA. A apresentação dos produtos e as embalagens podem variar.</p>
        <div className="sticky top-14 z-20 -mx-5 mt-4 flex gap-2 overflow-x-auto bg-background/90 px-5 py-3 backdrop-blur">
          {CATEGORIES.filter((category) => MENU.some((item) => item.category === category)).map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${cat === c ? "bg-ember text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{c}</button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MENU.filter((m) => m.category === cat).map((m) => (
            <article key={m.id} data-product-id={m.id} className="flex overflow-hidden rounded-lg border bg-card flex-col">
              <img src={productImages[m.id]} alt={`Imagem ilustrativa: ${m.name}`} loading="lazy" width={640} height={640} className={`aspect-[4/3] w-full ${m.category === "Refrigerantes" || m.category === "Sucos" ? "object-contain bg-secondary" : "object-cover"}`} />
              <div className="flex min-w-0 flex-1 flex-col p-4">
                <h3 className="font-bold">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-display text-2xl text-gold">{brl(m.price)}</span>
                  {cart[m.id] ? (
                    <div className="flex items-center gap-3">
                      <Button size="icon" variant="secondary" aria-label={`Remover uma unidade de ${m.name}`} onClick={() => add(m.id, -1)} className="size-8">−</Button>
                      <span className="font-bold">{cart[m.id]}</span>
                      <Button size="icon" aria-label={`Adicionar ${m.name}`} onClick={() => add(m.id, 1)} className="size-8">+</Button>
                    </div>
                  ) : (
                    <Button size="sm" aria-label={`Adicionar ${m.name}`} onClick={() => add(m.id, 1)}>Adicionar</Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 flex items-center gap-4 border-t pt-6">
          <img src={productImages["water"]} alt="Imagem ilustrativa de água mineral" loading="lazy" width={384} height={384} className="size-24 shrink-0 rounded-lg object-contain bg-secondary" />
          <div className="min-w-0"><h3 className="font-bold">Água</h3><p className="mt-1 text-sm text-muted-foreground">Consulte disponibilidade e preço com a loja.</p><Button asChild size="sm" variant="outline" className="mt-3"><a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">Consultar no WhatsApp</a></Button></div>
        </div>
      </section>

      <footer className="border-t px-5 py-8 text-center text-sm text-muted-foreground"><p>© Carina Farias — Churrascaria &amp; Lanchonete</p><p className="mt-2">{ADDRESS}</p><Button asChild variant="outline" className="mt-4"><a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">WhatsApp {CONTACT}</a></Button><p className="mt-3">Água: consulte disponibilidade e preço pelo WhatsApp.</p><Button asChild variant="ghost" size="sm" className="mt-4"><Link to="/vendas">Vendas e promoções</Link></Button><Button asChild variant="ghost" size="sm" className="mt-4"><Link to="/admin">Painel de pedidos</Link></Button></footer>

      {count > 0 && !open && (
        <button onClick={() => setOpen(true)} className="fixed inset-x-5 bottom-5 z-30 mx-auto max-w-md rounded-full bg-ember py-4 font-bold text-primary-foreground shadow-ember">
          Ver pedido ({count}) · {brl(subtotal)}
        </button>
      )}

      {/* Checkout drawer */}
      {open && (
        <div className="fixed inset-0 z-40 flex justify-end bg-background/70" onClick={() => setOpen(false)}>
          <div className="h-full w-full max-w-md overflow-y-auto bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="font-display text-4xl">Seu pedido</h2><button onClick={() => setOpen(false)} className="text-2xl">×</button></div>
            {!lines.length && <p className="mt-6 text-muted-foreground">Carrinho vazio.</p>}
            {lines.map((l) => (
              <div key={l.item.id} className="flex items-center justify-between gap-3 border-b py-3">
                <img src={productImages[l.item.id]} alt={`Imagem ilustrativa: ${l.item.name}`} loading="lazy" width={64} height={64} className="size-14 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1"><p className="font-semibold">{l.item.name}</p><p className="text-sm text-muted-foreground">{brl(l.item.price)}</p></div>
                <div className="flex shrink-0 items-center gap-3">
                  <button onClick={() => add(l.item.id, -1)} className="h-7 w-7 rounded-full bg-secondary">−</button>{l.qty}
                  <button onClick={() => add(l.item.id, 1)} className="h-7 w-7 rounded-full bg-secondary">+</button>
                </div>
              </div>
            ))}

            {lines.length > 0 && <CartExtras cart={cart} onChange={add} />}

            <h3 className="mt-6 font-bold">Modalidade</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["entrega", "retirada"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`rounded-lg border py-3 font-semibold capitalize ${mode === m ? "border-primary bg-accent" : ""}`}>{m === "entrega" ? "🛵 Entrega" : "🏪 Retirada"}</button>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <input placeholder="Seu nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-3" />
              <input placeholder="Telefone / WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-3" />
              {mode === "entrega" && <textarea placeholder="Endereço completo" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-3" />}
            </div>

            <h3 className="mt-6 font-bold">Pagamento</h3>
            <div className="mt-2 grid gap-2" role="radiogroup" aria-label="Forma de pagamento">
              {PAYMENT_OPTIONS.map((p) => (
                <button key={p.id} type="button" role="radio" aria-checked={payment === p.id} onClick={() => setPayment(p.id)} className={`rounded-lg border px-3 py-3 text-left ${payment === p.id ? "border-primary bg-accent" : ""}`}><span className="block text-sm font-semibold">{p.label}</span><span className="block text-xs text-muted-foreground">{p.description}</span></button>
              ))}
            </div>
            {payment === "pix" && <div className="mt-3"><PixPayment amount={subtotal + fee} /></div>}
            {payment === "dinheiro" && <input inputMode="decimal" placeholder="Troco para quanto? (opcional)" value={change} onChange={(e) => setChange(e.target.value)} className="mt-3 w-full rounded-lg border bg-background px-3 py-3" />}

            <div className="mt-6 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
              <div className="flex justify-between"><span>Taxa de entrega</span><span>{brl(fee)}</span></div>
              <div className="flex justify-between font-display text-3xl"><span>Total</span><span className="text-gold">{brl(subtotal + fee)}</span></div>
            </div>
            <button onClick={submit} disabled={busy} className="mt-4 w-full rounded-full bg-ember py-4 font-bold text-primary-foreground shadow-ember disabled:opacity-60">{busy ? "Enviando pedido..." : "Finalizar pedido"}</button>
          </div>
        </div>
      )}

      {/* Receipt */}
      {order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-5">
          <div className="w-full max-w-sm rounded-xl bg-card p-5">
            <h2 className="font-display text-4xl text-ember">Pedido recebido! 🔥</h2>
            <div id="receipt" className="mt-4 rounded-lg border bg-background p-4 font-mono text-xs">
              <p className="text-center font-bold">CARINA FARIAS — CHURRASCARIA</p>
              <p className="text-center">Pedido #{order.id} — {order.date}</p>
              <p>--------------------------------</p>
              {order.items.map((i) => <p key={i.name} className="flex justify-between"><span>{i.qty}x {i.name}</span><span>{brl(i.qty * i.price)}</span></p>)}
              <p>--------------------------------</p>
              <p className="flex justify-between"><span>Subtotal</span><span>{brl(order.subtotal)}</span></p>
              <p className="flex justify-between"><span>Entrega</span><span>{brl(order.fee)}</span></p>
              <p className="flex justify-between font-bold"><span>TOTAL</span><span>{brl(order.total)}</span></p>
              <p>--------------------------------</p>
              <p>Cliente: {order.name}</p><p>Tel: {order.phone}</p>
              <p>Modalidade: {order.mode.toUpperCase()}</p>
              {order.mode === "entrega" && <p>End.: {order.address}</p>}
              <p>Pagamento: {order.payment}</p>
              {order.changeFor && <p>Troco para: {brl(order.changeFor)}</p>}
              <p>Status: {PAYMENT_STATUS_LABELS.pendente.toUpperCase()}</p>
            </div>
            {order.paymentId === "pix" && <div className="mt-3"><PixPayment amount={order.total} reference={`Pedido ${order.id}`} /></div>}
            {!order.saved && <p role="alert" className="mt-3 text-xs text-destructive">Não conseguimos registrar o pedido no sistema agora. Envie pelo WhatsApp para garantir que a loja receba.</p>}
            {order.trackingId && <Link to="/pedido/$id" params={{ id: order.trackingId }} className="mt-3 block rounded-full border border-primary py-3 text-center font-bold text-primary">📍 Acompanhar pedido</Link>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={orderWhatsApp(order)} target="_blank" rel="noopener noreferrer" className="col-span-2 rounded-full bg-green-600 py-3 text-center font-bold text-white">📲 Enviar pedido pelo WhatsApp</a>
              <button onClick={() => window.print()} className="rounded-full bg-ember py-3 font-bold text-primary-foreground">🖨️ Imprimir nota</button>
              <button onClick={() => setOrder(null)} className="rounded-full border py-3 font-semibold">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
