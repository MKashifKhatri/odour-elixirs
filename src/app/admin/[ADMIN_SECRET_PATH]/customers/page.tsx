"use client";

import { FormEvent, useEffect, useState } from "react";
import { Search, UserPlus, Users, RefreshCw } from "lucide-react";

type Customer = { id: string; name: string; phone: string; email?: string | null; city?: string | null; source: string; created_at: string };
const blank = { name: "", phone: "", email: "", address: "", city: "", state: "", postal_code: "", notes: "" };
const inputClass = "h-11 w-full rounded-xl border border-[var(--store-line)] bg-[var(--store-surface)] px-3 text-sm outline-none focus:border-[#8d6d4e] focus:ring-2 focus:ring-[#8d6d4e]/10";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState(blank);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/customers", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load customers.");
      setCustomers(data.customers || []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load customers."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save the customer.");
      setMessage("Customer saved to your customer list."); setForm(blank); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save the customer."); }
    finally { setSaving(false); }
  };

  const visible = customers.filter((customer) => `${customer.name} ${customer.phone} ${customer.email || ""}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Customer relationships</p><h1 className="mt-2 font-display text-4xl font-medium tracking-[-.05em]">Customers</h1><p className="mt-2 text-sm text-[var(--store-muted)]">Guest inquiries and manually added customer records, all in one place.</p></div><button type="button" onClick={() => void load()} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--store-line)] px-4 text-sm font-semibold"><RefreshCw className="h-4 w-4" /> Refresh</button></header>
    <div className="grid gap-6 xl:grid-cols-[.82fr_1.18fr]">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-[var(--store-line)] bg-[var(--store-surface)] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#eee7dc]"><UserPlus className="h-5 w-5" /></span><div><h2 className="font-display text-xl font-semibold">Add a customer</h2><p className="text-xs text-[var(--store-muted)]">Save an in-store, WhatsApp or referral customer.</p></div></div>
        <label className="block text-xs font-semibold">Full name<input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-semibold">Phone / WhatsApp<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${inputClass} mt-1.5`} placeholder="+91 98765 43210" /></label><label className="block text-xs font-semibold">Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputClass} mt-1.5`} /></label></div>
        <label className="block text-xs font-semibold">Address<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
        <div className="grid gap-3 sm:grid-cols-3">{(["city", "state", "postal_code"] as const).map((field) => <label key={field} className="block text-xs font-semibold capitalize">{field.replace("_", " ")}<input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className={`${inputClass} mt-1.5`} /></label>)}</div>
        <label className="block text-xs font-semibold">Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputClass} mt-1.5 h-20 py-3`} placeholder="Scent preferences, follow-up notes…" /></label>
        {message && <p role="status" className="rounded-lg bg-[#eee7dc] px-3 py-2 text-xs">{message}</p>}<button disabled={saving} className="h-11 w-full rounded-full bg-[#211814] text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save customer"}</button>
      </form>
      <section className="min-w-0 rounded-2xl border border-[var(--store-line)] bg-[var(--store-surface)] p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Users className="h-4 w-4 text-[var(--store-muted)]" /><h2 className="font-display text-xl font-semibold">Customer list</h2></div><p className="mt-1 text-xs text-[var(--store-muted)]">{customers.length} saved records</p></div><label className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--store-muted)]" /><input value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} pl-9`} placeholder="Search customers" /></label></div>
        {loading ? <p className="py-12 text-center text-sm text-[var(--store-muted)]">Loading customer records…</p> : visible.length ? <div className="mt-5 divide-y divide-[var(--store-line)]">{visible.map((customer) => <article key={customer.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><h3 className="text-sm font-semibold">{customer.name}</h3><p className="mt-1 text-xs text-[var(--store-muted)]">{customer.phone}{customer.email ? ` · ${customer.email}` : ""}</p></div><div className="text-right"><span className="rounded-full bg-[#eee7dc] px-2.5 py-1 text-[10px] font-semibold capitalize">{customer.source.replace("_", " ")}</span><p className="mt-2 text-[10px] text-[var(--store-muted)]">{customer.city || "Location not set"}</p></div></article>)}</div> : <div className="py-14 text-center"><Users className="mx-auto h-8 w-8 text-[var(--store-muted)]" /><p className="mt-3 text-sm font-semibold">{message || "No matching customers yet"}</p><p className="mt-1 text-xs text-[var(--store-muted)]">Connect Supabase to save and view customer records.</p></div>}
      </section>
    </div>
  </div>;
}
