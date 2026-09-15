"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock3,
  Globe2,
  LogOut,
  MapPin,
  Menu,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type LiveLead = { id: string; status: "approved" | "pending" | "failed"; amount: number; createdAt: number; city: string; state: string; product: string };
type Metrics = {
  generatedAt: number;
  source: string;
  totals: { leads: number; approved: number; pending: number; failed: number; revenue: number; averageTicket: number; approvalRate: number };
  funnel: { label: string; value: number; detail: string }[];
  locations: { city: string; state: string; leads: number; approved: number }[];
  products: { name: string; orders: number; revenue: number }[];
  live: LiveLead[];
};

const money = (value: number) => (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dateTime = (value: number) => new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function MetricCard({ icon: Icon, label, value, note, tone, trend }: { icon: typeof Activity; label: string; value: string; note: string; tone: string; trend?: "up" | "down" }) {
  return <article className="admin-metric-card"><div className={`admin-metric-icon ${tone}`}><Icon size={18} /></div><div className="admin-metric-copy"><span>{label}</span><strong>{value}</strong><small>{trend === "up" ? <ArrowUpRight size={13} /> : trend === "down" ? <ArrowDownRight size={13} /> : null}{note}</small></div></article>;
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [login, setLogin] = useState("TB");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login, password }) });
      if (!response.ok) throw new Error();
      onSuccess();
    } catch {
      setError("Login ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };
  return <main className="admin-login-shell"><div className="admin-login-glow admin-login-glow-one" /><div className="admin-login-glow admin-login-glow-two" /><section className="admin-login-card"><div className="admin-login-mark"><ShieldCheck size={21} /></div><span className="admin-kicker">OLYMPIKUS · CONTROLE</span><h1>Área administrativa</h1><p>Entre para acompanhar pedidos, funil e atividade da operação.</p><form onSubmit={submit}><label>Login<input value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" /></label><label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>{error && <div className="admin-login-error">{error}</div>}<button className="admin-primary-button" type="submit" disabled={loading}>{loading ? "Entrando…" : "Entrar no painel"}</button></form><small className="admin-login-foot">Acesso restrito · dados protegidos</small></section></main>;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadMetrics = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/metrics", { cache: "no-store" });
      if (response.status === 401) { setAuthenticated(false); return; }
      const result = await response.json() as Metrics & { error?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível carregar os dados.");
      setMetrics(result);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os dados.");
    } finally {
      setRefreshing(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadMetrics(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const maxFunnel = useMemo(() => Math.max(...(metrics?.funnel.map((item) => item.value) ?? [1]), 1), [metrics]);
  const maxLocation = useMemo(() => Math.max(...(metrics?.locations.map((item) => item.leads) ?? [1]), 1), [metrics]);
  const logout = async () => { await fetch("/api/admin/auth", { method: "DELETE" }); setAuthenticated(false); setMetrics(null); };

  if (checking && !authenticated) return <main className="admin-loading"><RefreshCw size={20} className="admin-spin" /> Carregando painel…</main>;
  if (!authenticated) return <Login onSuccess={() => { setAuthenticated(true); void loadMetrics(); }} />;
  const totals = metrics?.totals;
  return <main className="admin-shell">
    <aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`}><div className="admin-sidebar-head"><div className="admin-brand"><span>O</span><div><b>OLYMPIKUS</b><small>CONTROL ROOM</small></div></div><button className="admin-icon-button admin-mobile-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X size={19} /></button></div><div className="admin-workspace"><span>VISÃO GERAL</span><button className="admin-nav-item active" type="button"><BarChart3 size={17} /> Dashboard</button><button className="admin-nav-item" type="button"><Users size={17} /> Leads e funil</button><button className="admin-nav-item" type="button"><ShoppingBag size={17} /> Pedidos</button><button className="admin-nav-item" type="button"><Globe2 size={17} /> Localização</button></div><div className="admin-sidebar-bottom"><div className="admin-user"><span><UserRound size={16} /></span><div><b>TB</b><small>Administrador</small></div></div><button className="admin-nav-item" type="button" onClick={() => void logout()}><LogOut size={17} /> Sair</button></div></aside>
    <div className="admin-main"><header className="admin-topbar"><button className="admin-icon-button admin-menu-trigger" type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button><div><span className="admin-kicker">PAINEL ADMINISTRATIVO</span><h1>Visão geral</h1></div><div className="admin-top-actions"><span className="admin-live-dot"><i /> Ao vivo</span><button className="admin-refresh" type="button" onClick={() => void loadMetrics()} disabled={refreshing}><RefreshCw size={15} className={refreshing ? "admin-spin" : ""} /> Atualizar</button></div></header>
      {error && <div className="admin-alert"><Activity size={16} /> {error}<button type="button" onClick={() => void loadMetrics()}>Tentar novamente</button></div>}
      <div className="admin-content"><section className="admin-welcome"><div><p>Olá, TB</p><h2>A operação em um só lugar.</h2><span>Pedidos e sinais da sua loja, atualizados pela FlevoPay.</span></div><div className="admin-welcome-badge"><Activity size={18} /><span>Monitoramento ativo<small>{metrics ? `Atualizado às ${dateTime(metrics.generatedAt).split(" ")[1]}` : "Aguardando dados"}</small></span></div></section>
        <section className="admin-metrics-grid"><MetricCard icon={Users} label="Leads / pedidos" value={String(totals?.leads ?? 0)} note="transações recebidas" tone="blue" /><MetricCard icon={PackageCheck} label="Aprovados" value={String(totals?.approved ?? 0)} note={`${((totals?.approvalRate ?? 0) * 100).toFixed(1)}% de aprovação`} tone="green" trend="up" /><MetricCard icon={Clock3} label="Pendentes" value={String(totals?.pending ?? 0)} note="aguardando Pix" tone="gold" /><MetricCard icon={BarChart3} label="Faturamento aprovado" value={money(totals?.revenue ?? 0)} note={`ticket médio ${money(totals?.averageTicket ?? 0)}`} tone="purple" /></section>
        <section className="admin-grid-two"><article className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">CONVERSÃO</span><h3>Onde os leads estão parando</h3></div><span className="admin-panel-source">{metrics?.source ?? "FlevoPay"}</span></div><div className="admin-funnel">{(metrics?.funnel ?? []).map((item, index) => <div className="admin-funnel-row" key={item.label}><div className="admin-funnel-label"><span>{String(index + 1).padStart(2, "0")}</span><div><b>{item.label}</b><small>{item.detail}</small></div><strong>{item.value}</strong></div><div className="admin-funnel-track"><i style={{ width: `${Math.max(4, (item.value / maxFunnel) * 100)}%` }} /></div></div>)}</div><div className="admin-funnel-note"><span><i /> Funil baseado nas transações registradas</span><b>{((totals?.approvalRate ?? 0) * 100).toFixed(1)}% finalizam</b></div></article><article className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">ORIGEM</span><h3>Onde os leads estão</h3></div><MapPin size={18} /></div><div className="admin-location-list">{metrics?.locations.length ? metrics.locations.map((location) => <div className="admin-location-row" key={`${location.city}-${location.state}`}><div className="admin-location-name"><span><MapPin size={14} /></span><div><b>{location.city}</b><small>{location.state} · {location.approved} aprovados</small></div></div><strong>{location.leads}</strong><div className="admin-location-track"><i style={{ width: `${Math.max(5, (location.leads / maxLocation) * 100)}%` }} /></div></div>) : <div className="admin-empty"><MapPin size={22} /><p>As próximas transações com endereço aparecerão aqui.</p></div>}</div><div className="admin-panel-foot"><span>Localização vem do endereço informado no checkout</span></div></article></section>
        <section className="admin-grid-two admin-lower-grid"><article className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">PEDIDOS</span><h3>Produtos com maior faturamento</h3></div><ShoppingBag size={18} /></div>{metrics?.products.length ? <div className="admin-products-list">{metrics.products.map((product, index) => <div className="admin-product-row" key={product.name}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{product.name}</b><small>{product.orders} pedido{product.orders === 1 ? "" : "s"}</small></div><strong>{money(product.revenue)}</strong></div>)}</div> : <div className="admin-empty"><ShoppingBag size={22} /><p>Nenhum pedido aprovado registrado ainda.</p></div>}</article><article className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">ATIVIDADE RECENTE</span><h3>Leads ao vivo</h3></div><span className="admin-live-dot"><i /> live</span></div><div className="admin-live-list">{metrics?.live.length ? metrics.live.slice(0, 6).map((lead) => <div className="admin-live-row" key={lead.id}><span className={`admin-status-dot ${lead.status}`} /><div><b>{lead.city}{lead.state !== "--" ? ` · ${lead.state}` : ""}</b><small>{lead.product} · {dateTime(lead.createdAt)}</small></div><strong>{lead.status === "approved" ? money(lead.amount) : lead.status === "pending" ? "Pendente" : "Falhou"}</strong></div>) : <div className="admin-empty"><Activity size={22} /><p>Nenhuma atividade recente encontrada.</p></div>}</div></article></section>
        <footer className="admin-footer"><span>Fonte: FlevoPay · Métricas transacionais do sistema</span><span>Última consulta {metrics ? dateTime(metrics.generatedAt) : "—"}</span></footer>
      </div>
    </div>
  </main>;
}
