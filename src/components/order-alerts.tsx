import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Volume2, VolumeX, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "./account-context";
import { checkAdmin, getNewOrderAlerts } from "@/lib/admin-orders.functions";
import { mergeOrderAlerts, type OrderAlert } from "@/lib/order-alerts";
import { brl } from "@/lib/menu";

export function OrderAlerts() {
  const { user } = useAccount();
  const check = useServerFn(checkAdmin);
  const fetchAlerts = useServerFn(getNewOrderAlerts);
  const [allowed, setAllowed] = useState(false);
  const [alerts, setAlerts] = useState<OrderAlert[]>([]);
  const [error, setError] = useState(false);
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const soundEnabled = useRef(false);
  const beep = useCallback(() => {
    const context = audio.current;
    if (!context || !soundEnabled.current) return;
    void context.resume().then(() => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.12, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
      oscillator.start(); oscillator.stop(context.currentTime + 0.5);
    }).catch(() => {});
  }, []);
  useEffect(() => {
    let active = true;
    let cursor: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setAllowed(false); setAlerts([]); setError(false);
    if (!user) return;
    async function poll() {
      try {
        const result = await fetchAlerts({ data: { after: cursor } });
        if (!active) return;
        cursor = result.cursor; setError(false);
        if (result.orders.length) {
          setAlerts((previous) => mergeOrderAlerts(previous, result.orders));
          beep();
          window.dispatchEvent(new Event("admin:new-orders"));
        }
      } catch { if (active) setError(true); }
      finally { if (active) timer = setTimeout(poll, 10000); }
    }
    void check().then((result) => { if (active && result.admin) { setAllowed(true); void poll(); } }).catch(() => {});
    return () => { active = false; if (timer) clearTimeout(timer); };
  }, [user?.id, check, fetchAlerts, beep]);
  useEffect(() => () => { void audio.current?.close(); }, []);
  if (!allowed) return null;
  function toggleSound() {
    try {
      if (!audio.current) audio.current = new AudioContext();
      soundEnabled.current = !sound;
      setSound(!sound); beep();
    } catch { setSound(false); soundEnabled.current = false; }
  }
  return <aside aria-label="Notificações de pedidos" className="mx-auto max-w-5xl px-5 pt-5">
    <div className="flex flex-wrap items-center gap-3 border-b pb-3">
      <Bell className="size-5 text-primary" /><p className="mr-auto text-sm font-semibold" role="status" aria-live="polite">{alerts.length ? `${alerts.length} ${alerts.length === 1 ? "novo pedido" : "novos pedidos"}` : "Aguardando novos pedidos"}</p>
      <Button variant="outline" size="icon" onClick={toggleSound} title={sound ? "Desativar som" : "Ativar som"} aria-label={sound ? "Desativar som" : "Ativar som"} aria-pressed={sound}>{sound ? <Volume2 /> : <VolumeX />}</Button>
      {!!alerts.length && <Button variant="outline" size="sm" onClick={() => setAlerts([])}><Check />Marcar como vistos</Button>}
    </div>
    {error && <p role="alert" className="mt-2 text-sm text-destructive">Alertas temporariamente indisponíveis. Tentando reconectar…</p>}
    {!!alerts.length && <div className="mt-3 max-h-60 overflow-y-auto border-l-2 border-primary pl-3">
      {alerts.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm"><span className="font-semibold">Novo pedido #{order.number}</span><span>{order.mode === "entrega" ? "Entrega" : "Retirada"} · {brl(order.total)}</span></div>)}
      <Button asChild variant="ghost" size="sm" className="mt-2"><Link to="/admin">Ver pedidos<ArrowRight /></Link></Button>
    </div>}
  </aside>;
}