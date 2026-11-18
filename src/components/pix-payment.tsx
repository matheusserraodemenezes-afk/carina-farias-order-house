import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { buildPixPayload, PIX_CITY, PIX_KEY, PIX_RECEIVER } from "@/lib/payments";
import { brl } from "@/lib/menu";

export function PixPayment({ amount, reference }: { amount: number; reference?: string }) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const payload = PIX_KEY && amount > 0 ? buildPixPayload({ key: PIX_KEY, receiver: PIX_RECEIVER, city: PIX_CITY, amount, reference: reference ?? "" }) : "";
  useEffect(() => {
    if (!payload) return;
    let active = true;
    import("qrcode").then((QR) => QR.toDataURL(payload, { margin: 1, width: 220 })).then((url) => { if (active) setQr(url); }).catch(() => setQr(""));
    return () => { active = false; };
  }, [payload]);
  if (!PIX_KEY) return <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">A loja envia a chave PIX pelo WhatsApp junto com a confirmação do pedido. O pedido fica aguardando pagamento até a confirmação.</p>;
  return (
    <div className="rounded-lg border p-3 text-sm">
      <p className="font-semibold">Pague {brl(amount)} via PIX</p>
      {qr && <img src={qr} alt="QR Code PIX" width={180} height={180} className="mx-auto my-3 rounded bg-foreground p-1" />}
      <p className="text-xs text-muted-foreground">Chave: <span className="break-all font-mono text-foreground">{PIX_KEY}</span> · {PIX_RECEIVER}</p>
      <button type="button" onClick={() => { navigator.clipboard?.writeText(payload); setCopied(true); }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border py-2 font-semibold">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "Código copiado" : "Copiar PIX copia e cola"}</button>
      <p className="mt-2 text-xs text-muted-foreground">Status: aguardando pagamento até a loja confirmar o recebimento.</p>
    </div>
  );
}
