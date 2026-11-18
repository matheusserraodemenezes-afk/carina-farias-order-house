import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, LoaderCircle, Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recommendMeal } from "@/lib/recommendations.functions";
import { brl } from "@/lib/menu";
import { preferencesSchema, type Preferences, type Suggestions } from "@/lib/recommendations";

const meats: Preferences["meat"][] = ["Qualquer", "Carne", "Frango", "Calabresa", "Bisteca", "Coração"];
const drinks: Preferences["drink"][] = ["Qualquer", "Goiaba", "Acerola", "Caju", "Sem bebida"];
const occasions: Preferences["occasion"][] = ["Dia a dia", "Família", "Amigos", "Aniversário", "Futebol", "Trabalho"];
const diets: Preferences["diet"] = ["Sem carne vermelha", "Sem carne suína", "Mais leve"];
const exclusions: Preferences["avoid"] = ["Carne", "Frango", "Calabresa", "Bisteca", "Coração"];

export function MealRecommendations({ onAdd }: { onAdd: (items: { id: string; qty: number }[]) => void }) {
  const [preferences, setPreferences] = useState<Preferences>({ occasion: "Dia a dia", diet: [], people: 1, budget: null, meat: "Qualquer", drink: "Qualquer", avoid: [], notes: "" });
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Suggestions | null>(null);
  const [added, setAdded] = useState<number | null>(null);
  const pending = useRef(false);
  const request = useServerFn(recommendMeal);

  const update = (change: Partial<Preferences>) => {
    setPreferences((current) => ({ ...current, ...change }));
    setResult(null); setError(""); setAdded(null);
  };
  async function generate(event: React.FormEvent) {
    event.preventDefault();
    if (pending.current) return;
    const parsed = preferencesSchema.safeParse({ ...preferences, budget: budget.trim() ? Number(budget.replace(",", ".")) : null });
    if (!parsed.success) { setError("Informe um orçamento entre R$ 1 e R$ 2.000 e até 500 caracteres nas observações."); return; }
    pending.current = true; setLoading(true); setError(""); setResult(null); setAdded(null);
    try {
      const response = await request({ data: parsed.data });
      if (response.ok) setResult(response.suggestions);
      else setError(response.error);
    } catch {
      setError("Não conseguimos conectar às sugestões. Suas preferências foram mantidas.");
    } finally { pending.current = false; setLoading(false); }
  }

  return (
    <section id="sugestoes" aria-labelledby="suggestion-heading" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-14">
      <div className="flex items-center gap-3"><Sparkles className="size-7 text-primary" /><h2 id="suggestion-heading" className="font-display text-4xl sm:text-5xl">Uma combinação do seu jeito</h2></div>
      <form onSubmit={generate} className="mt-6 border-y border-border py-6">
        <fieldset disabled={loading} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div><label id="occasion-label" className="mb-2 block text-sm font-semibold">Qual a ocasião?</label><Select disabled={loading} value={preferences.occasion} onValueChange={(value) => { const occasion = occasions.find((item) => item === value); if (occasion) update({ occasion }); }}><SelectTrigger aria-labelledby="occasion-label"><SelectValue /></SelectTrigger><SelectContent>{occasions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          <div className="sm:col-span-2 lg:col-span-3"><p className="mb-3 text-sm font-semibold">Preferências alimentares</p><div className="flex flex-wrap gap-x-5 gap-y-3">{diets.map((diet) => <label key={diet} className="flex items-center gap-2 text-sm"><Checkbox disabled={loading} checked={preferences.diet.includes(diet)} onCheckedChange={(checked) => update({ diet: checked ? [...preferences.diet, diet] : preferences.diet.filter((item) => item !== diet) })} />{diet}</label>)}</div></div>
          <div><label className="mb-2 block text-sm font-semibold">Quantas pessoas?</label><div className="flex h-10 items-center gap-4"><Button type="button" size="icon" variant="outline" aria-label="Menos pessoas" disabled={loading || preferences.people === 1} onClick={() => update({ people: preferences.people - 1 })}><Minus /></Button><output aria-live="polite" className="w-6 text-center font-bold">{preferences.people}</output><Button type="button" size="icon" variant="outline" aria-label="Mais pessoas" disabled={loading || preferences.people === 10} onClick={() => update({ people: preferences.people + 1 })}><Plus /></Button></div></div>
          <div><label htmlFor="meal-budget" className="mb-2 block text-sm font-semibold">Orçamento total (R$)</label><Input id="meal-budget" inputMode="decimal" placeholder="Sem limite definido" value={budget} onChange={(event) => { setBudget(event.target.value); setResult(null); setError(""); setAdded(null); }} /><p className="mt-1 text-xs text-muted-foreground">Somente produtos, sem entrega.</p></div>
          <div><label id="meat-label" className="mb-2 block text-sm font-semibold">Carne preferida</label><Select disabled={loading} value={preferences.meat} onValueChange={(value) => { const meat = meats.find((item) => item === value); if (meat) update({ meat }); }}><SelectTrigger aria-labelledby="meat-label"><SelectValue /></SelectTrigger><SelectContent>{meats.map((meat) => <SelectItem key={meat} value={meat}>{meat === "Qualquer" ? "Surpreenda-me" : meat}</SelectItem>)}</SelectContent></Select></div>
          <div><label id="drink-label" className="mb-2 block text-sm font-semibold">Bebida preferida</label><Select disabled={loading} value={preferences.drink} onValueChange={(value) => { const drink = drinks.find((item) => item === value); if (drink) update({ drink }); }}><SelectTrigger aria-labelledby="drink-label"><SelectValue /></SelectTrigger><SelectContent>{drinks.map((drink) => <SelectItem key={drink} value={drink}>{drink === "Qualquer" ? "Qualquer suco" : drink}</SelectItem>)}</SelectContent></Select></div>
          <div className="sm:col-span-2"><p className="mb-3 text-sm font-semibold">Prefiro evitar</p><div className="flex flex-wrap gap-x-5 gap-y-3">{exclusions.map((meat) => <label key={meat} className="flex items-center gap-2 text-sm"><Checkbox disabled={loading} checked={preferences.avoid.includes(meat)} onCheckedChange={(checked) => update({ avoid: checked ? [...preferences.avoid, meat] : preferences.avoid.filter((item) => item !== meat) })} />{meat}</label>)}</div></div>
          <div className="sm:col-span-2"><label htmlFor="meal-notes" className="mb-2 block text-sm font-semibold">Outras preferências</label><Textarea id="meal-notes" maxLength={500} placeholder="Ex.: gosto de sabores mais cítricos" value={preferences.notes} onChange={(event) => update({ notes: event.target.value })} /></div>
        </fieldset>
        <div className="mt-5 flex flex-wrap items-center gap-4"><Button type="submit" disabled={loading} className="h-11 px-6">{loading ? <LoaderCircle className="motion-safe:animate-spin" /> : <Sparkles />}{loading ? "Preparando sugestões…" : "Sugerir combinações"}</Button><p className="max-w-xl text-xs text-muted-foreground">Acompanhamentos não confirmados no cardápio. Em caso de alergia, confirme os ingredientes com a churrascaria.</p></div>
      </form>
      <div aria-live="polite" aria-busy={loading}>
        {loading && <p role="status" className="mt-5 text-muted-foreground">Escolhendo churrascos e bebidas para você…</p>}
        {error && <p role="alert" className="mt-5 text-destructive">{error}</p>}
        {result && <><p className="mt-5 text-sm text-muted-foreground">{result.message || (result.combinations.length ? "Sugestões para o seu pedido" : "Não encontramos uma combinação para essas preferências.")}</p><div className="mt-4 grid gap-4 md:grid-cols-3">{result.combinations.map((combo, index) => <article key={`${index}-${combo.title}`} className="flex flex-col rounded-lg border border-border bg-card p-5"><h3 className="text-lg font-bold">{combo.title}</h3><p className="mt-2 text-sm text-muted-foreground">{combo.reason}</p><ul className="my-4 space-y-2 text-sm">{combo.items.map((item) => <li key={item.id} className="flex justify-between gap-3"><span>{item.qty}× {item.name}</span><span className="shrink-0">{brl(item.qty * item.price)}</span></li>)}</ul><div className="mt-auto border-t pt-4"><div className="mb-3 flex justify-between"><span>Total dos produtos</span><strong className="text-gold">{brl(combo.total)}</strong></div><Button type="button" className="w-full" disabled={added === index} onClick={() => { onAdd(combo.items); setAdded(index); }}>{added === index ? <Check /> : <ShoppingBag />}{added === index ? "Adicionado ao carrinho" : "Adicionar combinação"}</Button></div></article>)}</div></>}
      </div>
    </section>
  );
}