import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Trash2, FolderOpen, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount } from "./account-context";
import { supabase } from "@/integrations/supabase/client";
import { listSalesHistory, saveSalesHistory, deleteSalesHistory, getOwnerProfile, saveOwnerProfile } from "@/lib/sales-history.functions";
import { salesInputSchema, salesMetrics, type SalesInput } from "@/lib/sales-analysis";
import { profileSchema } from "@/lib/sales-history";
import { brl } from "@/lib/menu";

export function SalesHistory({ sales, editingDraft, onLoad }: { sales: SalesInput; editingDraft: boolean; onLoad: (sales: SalesInput) => void }) {
  const { user, ready } = useAccount();
  const client = useQueryClient(); const navigate = useNavigate();
  const list = useServerFn(listSalesHistory); const save = useServerFn(saveSalesHistory); const remove = useServerFn(deleteSalesHistory);
  const getProfile = useServerFn(getOwnerProfile); const saveProfile = useServerFn(saveOwnerProfile);
  const history = useQuery({ queryKey: ["sales-history", user?.id], queryFn: () => list(), enabled: !!user });
  const profile = useQuery({ queryKey: ["owner-profile", user?.id], queryFn: () => getProfile(), enabled: !!user });
  const [selected, setSelected] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState("");
  const [profileDraft, setProfileDraft] = useState<{ display_name: string; avatar_url: string } | null>(null);
  const [search, setSearch] = useState("");
  async function persist(copy = false) {
    if (busy) return;
    if (editingDraft) { setNotice("Registre ou cancele o pedido em edição antes de salvar."); return; }
    const parsed = salesInputSchema.safeParse(sales);
    if (!parsed.success) { setNotice("Informe o período e registre pelo menos um pedido antes de salvar."); return; }
    setBusy(true); setNotice("");
    try { const id = !copy && selected ? selected : crypto.randomUUID(); await save({ data: { id, sales: parsed.data } }); setSelected(id); await history.refetch(); setNotice("Vendas salvas no histórico."); }
    catch { setNotice("Não foi possível salvar. Os dados desta página foram mantidos."); }
    finally { setBusy(false); }
  }
  if (!ready) return <p className="mb-8 text-sm text-muted-foreground">Conferindo acesso ao histórico…</p>;
  if (!user) return <section className="mb-8 border-y py-5"><h2 className="font-display text-3xl">Histórico privado</h2><p className="mt-2 text-sm text-muted-foreground">Entre para salvar e consultar suas vendas. Cada conta vê somente seu próprio histórico.</p><Button asChild variant="outline" className="mt-3"><Link to="/auth">Entrar para salvar vendas</Link></Button></section>;
  const draft = profileDraft ?? profile.data ?? { display_name: "", avatar_url: "" };
  return <section aria-label="Histórico privado" className="mb-10 border-y py-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-3xl">Histórico privado</h2><Button variant="ghost" size="sm" onClick={async () => { await client.cancelQueries(); client.clear(); await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); }}><LogOut />Sair</Button></div>
    <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold">Perfil{profile.data?.display_name ? ` · ${profile.data.display_name}` : ""}</summary><div className="mt-4 grid items-end gap-3 sm:grid-cols-3">
      <div><Label htmlFor="profile-name">Nome</Label><Input id="profile-name" className="mt-2" value={draft.display_name} onChange={(e) => setProfileDraft({ ...draft, display_name: e.target.value })} /></div>
      <div><Label htmlFor="profile-photo">Endereço da foto (HTTPS)</Label><Input id="profile-photo" className="mt-2" type="url" value={draft.avatar_url} onChange={(e) => setProfileDraft({ ...draft, avatar_url: e.target.value })} /></div>
      <Button variant="outline" disabled={busy} onClick={async () => { const parsed = profileSchema.safeParse(draft); if (!parsed.success) { setNotice("Confira o nome e o endereço HTTPS da foto."); return; } setBusy(true); try { await saveProfile({ data: parsed.data }); await profile.refetch(); setProfileDraft(null); setNotice("Perfil salvo."); } catch { setNotice("Não foi possível salvar o perfil."); } finally { setBusy(false); } }}><UserRound />Salvar perfil</Button>
    </div>{profile.data?.avatar_url && <img src={profile.data.avatar_url} alt="Foto do perfil" referrerPolicy="no-referrer" width={64} height={64} className="mt-3 size-16 rounded-full object-cover" />}</details>
    <div className="mt-5 flex flex-wrap gap-3"><Button disabled={busy || !sales.orders.length} onClick={() => persist()}><Save />{selected ? "Atualizar período salvo" : "Salvar no histórico"}</Button>{selected && <><Button variant="outline" disabled={busy} onClick={() => persist(true)}>Salvar como novo período</Button><Button variant="ghost" disabled={busy} onClick={() => { if (window.confirm("Começar outro período? Alterações não salvas serão descartadas.")) { setSelected(null); onLoad({ period: "", orders: [] }); setNotice(""); } }}>Novo período</Button></>}</div>
    <p role="status" className="mt-3 text-sm text-muted-foreground">{notice || "Alterações só ficam guardadas após salvar o período."}</p>
    <div className="mt-5"><Label htmlFor="history-search">Consultar períodos salvos</Label><Input id="history-search" className="mt-2 max-w-md" placeholder="Buscar período" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
    {history.isPending && <p className="mt-3 text-sm">Carregando histórico…</p>}
    {(history.isError || profile.isError) && <div role="alert" className="mt-3 text-sm text-destructive">Não foi possível consultar os dados. <Button size="sm" variant="outline" onClick={() => { history.refetch(); profile.refetch(); }}>Tentar novamente</Button></div>}
    <div className="mt-3 max-h-80 overflow-y-auto divide-y">{history.data?.filter((row) => row.sales.period.toLowerCase().includes(search.toLowerCase())).map((row) => { const metrics = salesMetrics(row.sales); return <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="font-semibold break-words">{row.sales.period}{selected === row.id ? " · Em edição" : ""}</p><p className="mt-1 text-sm text-muted-foreground">{metrics.orderCount} pedidos · {brl(metrics.revenue)} · {new Date(row.updated_at).toLocaleDateString("pt-BR")}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" disabled={busy} onClick={() => { if ((sales.orders.length || editingDraft) && !window.confirm("Abrir este período? Alterações não salvas serão descartadas.")) return; setSelected(row.id); onLoad(row.sales); setNotice("Período carregado para consulta ou nova análise."); }}><FolderOpen />Abrir período</Button><Button size="icon" variant="ghost" disabled={busy} aria-label={`Excluir período ${row.sales.period}`} onClick={async () => { if (!window.confirm("Excluir este período do histórico?")) return; setBusy(true); try { await remove({ data: { id: row.id } }); if (selected === row.id) setSelected(null); await history.refetch(); setNotice("Período excluído do histórico."); } catch { setNotice("Não foi possível excluir o período."); } finally { setBusy(false); } }}><Trash2 /></Button></div></div>; })}</div>
    {history.data?.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Nenhum período salvo ainda.</p>}
  </section>;
}