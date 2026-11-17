import { useState } from "react";
import { Plus, Minus, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MENU, CATEGORIES, brl, type Category } from "@/lib/menu";
import { cartSuggestions } from "@/lib/cart-suggestions";
import { productImages } from "@/lib/product-images";

export function CartExtras({ cart, onChange }: { cart: Record<string, number>; onChange: (id: string, delta: number) => void }) {
  const [browse, setBrowse] = useState(false);
  const [category, setCategory] = useState<Category>("Sucos");
  const [lastAdded, setLastAdded] = useState("");
  const suggestions = cartSuggestions(cart);
  const items = browse ? MENU.filter((item) => item.category === category) : suggestions;

  return (
    <section aria-label="Complementar pedido" className="mt-6 border-y border-border py-5">
      <div className="flex items-center gap-2">
        <ShoppingBag className="size-5 text-primary" />
        <h3 className="font-display text-2xl">Que tal completar seu pedido?</h3>
      </div>
      <p role="status" aria-live="polite" className="mt-1 min-h-5 text-xs text-muted-foreground">{lastAdded ? `${lastAdded} adicionado ao pedido.` : "Mais sabores da Carina"}</p>
      <Button variant="outline" className="mt-3 w-full" onClick={() => setBrowse(!browse)} aria-expanded={browse}>
        {browse ? "Ver sugestões" : "Escolher outros produtos"}{browse ? <ChevronUp /> : <ChevronDown />}
      </Button>
      {browse && <div className="mt-3 flex flex-wrap gap-2" aria-label="Categorias no carrinho">
        {CATEGORIES.filter((cat) => MENU.some((item) => item.category === cat)).map((cat) => (
          <Button key={cat} size="sm" variant={category === cat ? "default" : "secondary"} aria-pressed={category === cat} onClick={() => setCategory(cat)}>{cat}</Button>
        ))}
      </div>}
      <div className={`mt-3 ${browse ? "max-h-72 overflow-y-auto" : ""}`}>
        {items.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border/50 py-3 last:border-0" data-extra-id={item.id}>
          <img src={productImages[item.id]} alt={`Imagem ilustrativa: ${item.name}`} loading="lazy" width={64} height={64} className="size-14 shrink-0 rounded-md object-cover" />
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">{item.category === "Sucos" ? item.desc : item.category}</p><p className="mt-1 text-sm font-bold text-gold">{brl(item.price)}</p></div>
          <div className="flex shrink-0 items-center gap-2">
            {(cart[item.id] ?? 0) > 0 && <><Button size="icon" className="size-8" variant="secondary" aria-label={`Remover uma unidade de ${item.name}`} onClick={() => onChange(item.id, -1)}><Minus /></Button><span className="w-4 text-center text-sm font-bold">{cart[item.id]}</span></>}
            <Button size="icon" className="size-8" aria-label={`Adicionar ${item.name}`} title={`Adicionar ${item.name}`} onClick={() => { onChange(item.id, 1); setLastAdded(item.name); }}><Plus /></Button>
          </div>
        </div>)}
      </div>
    </section>
  );
}