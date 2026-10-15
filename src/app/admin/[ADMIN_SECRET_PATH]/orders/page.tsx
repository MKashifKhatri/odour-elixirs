"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle, RefreshCw } from "lucide-react";

type Inquiry = { id: string; status: string; payment_status: string; estimated_total: number; created_at: string; customer?: { name: string; phone: string; email?: string }; items?: { product_name_snapshot: string; quantity: number; requested_unit_price: number; size_snapshot?: string }[] };
const statuses = ["new", "contacted", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try { const response = await fetch("/api/admin/customer-orders", { cache: "no-store" }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Could not load inquiries."); setOrders(data.orders || []); setMessage(""); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not load inquiries."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try { const response = await fetch("/api/admin/customer-orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Could not update order."); setOrders((items) => items.map((item) => item.id === id ? { ...item, status } : item)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not update order."); }
    finally { setUpdating(""); }
  };
  return <div className="mx-auto max-w-7xl space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">WhatsApp requests</p><h1 className="mt-2 font-display text-4xl font-medium tracking-[-.05em]">Order inquiries</h1><p className="mt-2 text-sm text-[var(--store-muted)]">Review requested items, contact customers and track the conversation.</p></div><button type="button" onClick={() => void load()} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--store-line)] px-4 text-sm font-semibold"><RefreshCw className="h-4 w-4" /> Refresh</button></header>
    {message && <p role="status" className="rounded-xl bg-[#eee7dc] p-4 text-sm">{message}</p>}
    {loading ? <div className="rounded-2xl border border-[var(--store-line)] bg-[var(--store-surface)] p-12 text-center text-sm text-[var(--store-muted)]">Loading order inquiries…</div> : orders.length ? <div className="space-y-4">{orders.map((order) => <article key={order.id} className="rounded-2xl border border-[var(--store-line)] bg-[var(--store-surface)] p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--store-muted)]">{new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p><h2 className="mt-1 font-display text-xl font-semibold">{order.customer?.name || "Customer"}</h2><p className="mt-1 text-xs text-[var(--store-muted)]">{order.customer?.phone}{order.customer?.email ? ` · ${order.customer.email}` : ""}</p><a href={`https://wa.me/${(order.customer?.phone || "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#356c50]"><MessageCircle className="h-3.5 w-3.5" /> Contact on WhatsApp</a></div><div className="flex items-center gap-3"><div className="text-right"><p className="text-[10px] uppercase tracking-wider text-[var(--store-muted)]">Estimate</p><p className="font-semibold">₹{Number(order.estimated_total).toLocaleString("en-IN")}</p><p className="mt-1 text-[10px] capitalize text-[var(--store-muted)]">Payment: {order.payment_status}</p></div><label className="sr-only" htmlFor={`status-${order.id}`}>Inquiry status</label><select id={`status-${order.id}`} disabled={updating === order.id} value={order.status} onChange={(event) => void updateStatus(order.id, event.target.value)} className="h-10 rounded-lg border border-[var(--store-line)] bg-[var(--store-bg)] px-3 text-xs font-semibold capitalize">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div></div><div className="mt-5 grid gap-2 border-t border-[var(--store-line)] pt-4 sm:grid-cols-2 lg:grid-cols-3">{(order.items || []).map((item, index) => <div key={`${item.product_name_snapshot}-${index}`} className="rounded-lg bg-[var(--store-bg)] px-3 py-2 text-xs"><p className="font-semibold">{item.product_name_snapshot} {item.size_snapshot ? `· ${item.size_snapshot}` : ""}</p><p className="mt-1 text-[var(--store-muted)]">Qty {item.quantity} · ₹{Number(item.requested_unit_price).toLocaleString("en-IN")} each</p></div>)}</div></article>)}</div> : <div className="rounded-2xl border border-dashed border-[var(--store-line)] bg-[var(--store-surface)] px-6 py-16 text-center"><h2 className="font-display text-2xl">No order inquiries yet</h2><p className="mt-2 text-sm text-[var(--store-muted)]">Customer WhatsApp cart requests will appear here when Supabase is connected.</p></div>}
  </div>;
}
