import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MealRecommendations } from "@/components/meal-recommendations";
import hero from "@/assets/hero-picanha.jpg";
import logoAsset from "@/assets/carina-original-logo.jpg.asset.json";
import { Button } from "@/components/ui/button";
import espetinhos from "@/assets/espetinhos.jpg";
import prato from "@/assets/prato.jpg";
import bebidas from "@/assets/bebidas.jpg";
import { ADDRESS, CONTACT, CONTACT_URL, CARD_BRANDS, CATEGORIES, DELIVERY_FEE, MENU, PAYMENT_METHODS, brl, type Category, type PaymentMethod } from "@/lib/menu";
const logo = logoAsset.url;

export const Route = createFileRoute("/")({
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

const catImg: Partial<Record<Category, string>> = {
  Churrasco: prato, Espetinhos: espetinhos, Acompanhamentos: prato, Sucos: bebidas, Refrigerantes: bebidas, Água: bebidas, Sobremesas: prato,
};

type Order = { id: number; items: { name: string; qty: number; price: number }[]; mode: string; name: string; phone: string; address: string; payment: string; subtotal: number; fee: number; total: number; date: string };

function Index() {
  const [cat, setCat] = useState<Category>("Churrasco");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"entrega" | "retirada">("entrega");
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [order, setOrder] = useState<Order | null>(null);

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

  const submit = () => {
    if (!lines.length || !form.name || !form.phone || (mode === "entrega" && !form.address)) return alert("Preencha nome, telefone e endereço.");
    setOrder({
      id: Math.floor(1000 + Math.random() * 9000),
      items: lines.map((l) => ({ name: l.item.name, qty: l.qty, price: l.item.price })),
      mode, ...form, payment: PAYMENT_METHODS.find((p) => p.id === payment)?.label ?? "",
      subtotal, fee, total: subtotal + fee, date: new Date().toLocaleString("pt-BR"),
    });
    setCart({}); setOpen(false);
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
        <div className="sticky top-14 z-20 -mx-5 mt-4 flex gap-2 overflow-x-auto bg-background/90 px-5 py-3 backdrop-blur">
          {CATEGORIES.filter((category) => MENU.some((item) => item.category === category)).map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${cat === c ? "bg-ember text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{c}</button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {MENU.filter((m) => m.category === cat).map((m) => (
            <div key={m.id} className="flex gap-4 rounded-xl border bg-card p-3">
              {catImg[m.category] && <img src={catImg[m.category]} alt={m.name} loading="lazy" width={1024} height={768} className="h-24 w-24 shrink-0 rounded-lg object-cover" />}
              <div className="flex flex-1 flex-col">
                <h3 className="font-bold">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-display text-2xl text-gold">{brl(m.price)}</span>
                  {cart[m.id] ? (
                    <div className="flex items-center gap-3">
                      <button onClick={() => add(m.id, -1)} className="h-8 w-8 rounded-full bg-secondary font-bold">−</button>
                      <span className="font-bold">{cart[m.id]}</span>
                      <button onClick={() => add(m.id, 1)} className="h-8 w-8 rounded-full bg-ember font-bold text-primary-foreground">+</button>
                    </div>
                  ) : (
                    <button onClick={() => add(m.id, 1)} className="rounded-full bg-ember px-4 py-1.5 text-sm font-bold text-primary-foreground">Adicionar</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t px-5 py-8 text-center text-sm text-muted-foreground"><p>© Carina Farias — Churrascaria &amp; Lanchonete</p><p className="mt-2">{ADDRESS}</p><Button asChild variant="outline" className="mt-4"><a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">WhatsApp {CONTACT}</a></Button><p className="mt-3">Água: consulte disponibilidade e preço pelo WhatsApp.</p></footer>

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
              <div key={l.item.id} className="flex items-center justify-between border-b py-3">
                <div><p className="font-semibold">{l.item.name}</p><p className="text-sm text-muted-foreground">{brl(l.item.price)}</p></div>
                <div className="flex items-center gap-3">
                  <button onClick={() => add(l.item.id, -1)} className="h-7 w-7 rounded-full bg-secondary">−</button>{l.qty}
                  <button onClick={() => add(l.item.id, 1)} className="h-7 w-7 rounded-full bg-secondary">+</button>
                </div>
              </div>
            ))}

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

            <h3 className="mt-6 font-bold">Pagamento <span className="text-xs font-normal text-muted-foreground">(pago na entrega · online em breve)</span></h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((p) => (
                <button key={p.id} onClick={() => setPayment(p.id)} className={`rounded-lg border py-3 text-sm font-semibold ${payment === p.id ? "border-primary bg-accent" : ""}`}>{p.label}</button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {CARD_BRANDS.map((b) => <span key={b} className="rounded border px-2 py-0.5 text-xs text-muted-foreground">{b}</span>)}
            </div>

            <div className="mt-6 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
              <div className="flex justify-between"><span>Taxa de entrega</span><span>{brl(fee)}</span></div>
              <div className="flex justify-between font-display text-3xl"><span>Total</span><span className="text-gold">{brl(subtotal + fee)}</span></div>
            </div>
            <button onClick={submit} className="mt-4 w-full rounded-full bg-ember py-4 font-bold text-primary-foreground shadow-ember">Finalizar pedido</button>
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
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => window.print()} className="rounded-full bg-ember py-3 font-bold text-primary-foreground">🖨️ Imprimir nota</button>
              <button onClick={() => setOrder(null)} className="rounded-full border py-3 font-semibold">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
