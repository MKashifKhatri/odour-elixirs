"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import type { RootState } from "@/store/store";
import { addToCart, clearCart, deleteFromCart, removeFromCart } from "@/store/reducer/cartReducer";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { useStorefrontContent } from "@/lib/useStorefrontContent";
import ProductVisual from "@/components/ProductVisual";

type CustomerForm = { name: string; phone: string; email: string; address: string; city: string; state: string; postalCode: string; note: string };
const emptyForm: CustomerForm = { name: "", phone: "", email: "", address: "", city: "", state: "", postalCode: "", note: "" };

export default function CartPage() {
  const dispatch = useDispatch();
  const { cart, totalAmount, totalItems } = useSelector((state: RootState) => state.cart);
  const user = useSelector((state: RootState) => state.user.user);
  const content = useStorefrontContent();
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"bag" | "details">("bag");
  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [cart]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("oe_customer_details");
      if (saved) setForm((current) => ({ ...current, ...JSON.parse(saved) }));
    } catch { /* Ignore invalid saved form data. */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    const address = user.addresses?.find((item) => item.is_default) || user.addresses?.[0];
    setForm((current) => ({ ...current, name: current.name || user.name || "", email: current.email || user.email || "", phone: current.phone || address?.phone_number || "", address: current.address || address?.address || "", city: current.city || address?.city || "", state: current.state || address?.state || "", postalCode: current.postalCode || address?.zip_code || "" }));
  }, [user]);

  const change = (key: keyof CustomerForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const sendOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart.length) return;
    setSubmitting(true);
    const popup = window.open("about:blank", "_blank");
    const payload = {
      customer: { ...form, postal_code: form.postalCode, source: "website" },
      items: cart.map((item) => ({ id: item.id, variant_id: item.variantId, name: item.name, slug: item.slug, price: item.price, quantity: item.quantity, size: item.size, color: item.color, image: item.image })),
      total,
    };
    let orderNumber = "";
    try {
      localStorage.setItem("oe_customer_details", JSON.stringify(form));
      const response = await fetch("/api/whatsapp-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (response.status === 409) {
        popup?.close();
        toast.error(result.message || "Availability changed. Review your bag and try again.");
        setSubmitting(false);
        return;
      }
      if (result?.success && result?.orderId) orderNumber = result.orderId;
    } catch { /* WhatsApp ordering remains available while Supabase is not connected. */ }

    const lines = cart.map((item) => `• ${item.name}${item.size ? ` (${item.size})` : ""} × ${item.quantity} — ₹${(Number(item.price) * item.quantity).toLocaleString("en-IN")}`);
    const message = ["Hello Odour Elixirs, I would like to enquire about this order.", "", `Name: ${form.name}`, `Phone: ${form.phone}`, form.email ? `Email: ${form.email}` : "", `Address: ${form.address}, ${form.city}, ${form.state} ${form.postalCode}`, form.note ? `Note: ${form.note}` : "", "", "Items:", ...lines, "", `Estimated total: ₹${total.toLocaleString("en-IN")}`, orderNumber ? `Inquiry reference: ${orderNumber}` : "", "Please confirm availability, final total and payment details with me."].filter(Boolean).join("\n");
    const whatsappNumber = (content.whatsappNumber || WHATSAPP_NUMBER).replace(/\D/g, "");
    const target = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    if (popup) popup.location.href = target;
    else window.location.href = target;
    dispatch(clearCart());
    setSubmitting(false);
    toast.success(orderNumber ? "Your inquiry is saved. WhatsApp is opening." : "WhatsApp is opening with your order. Save your Supabase connection to store inquiries.");
  };

  const inputClass = "oe-form-field";

  return <div className="oe-store-page oe-cart-page">
    <Link href="/products" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-[var(--store-muted)] hover:text-[var(--store-ink)]"><ArrowLeft className="h-4 w-4" /> Continue shopping</Link>
    <header className={`oe-cart-intro${step === "details" ? " is-checkout-intro" : ""}`}><p className="oe-micro-label oe-micro-label-dark"><span />{step === "bag" ? "Your selection" : "Checkout · Step 2 of 2"}</p><h1>{step === "bag" ? "Your bag." : "Checkout."}</h1><p>{step === "bag" ? "Review your choices once, then send a considered request. We’ll confirm availability, delivery and payment with you on WhatsApp." : "Add your delivery details. No online payment is required."}</p></header>

    {!cart.length ? <section className="oe-cart-empty"><p>Your bag is waiting for a signature scent.</p><Link href="/products">Explore fragrances <ArrowRight className="h-4 w-4" /></Link></section> : <div className={`oe-cart-layout ${step === "details" ? "is-checkout" : ""}`}><nav className="house-cart-steps" aria-label="Order progress"><button type="button" className={step === "bag" ? "is-current" : "is-complete"} aria-current={step === "bag" ? "step" : undefined} onClick={() => setStep("bag")}><span>01</span>Your selection</button><span className="house-cart-step-line" aria-hidden="true" /><span className={step === "details" ? "is-current" : ""} aria-current={step === "details" ? "step" : undefined}><span>02</span>Your details</span></nav>
      <section className="oe-cart-items-panel"><div className="oe-cart-panel-heading"><h2>Selected fragrances</h2><span>{totalItems} {totalItems === 1 ? "item" : "items"}</span></div>
        <div className="oe-cart-lines">{cart.map((item) => <article key={`${item.id}-${item.variantId || item.size}-${item.color}`} className="oe-cart-line"><div className="oe-cart-thumb"><ProductVisual src={item.image} alt={`${item.name} fragrance`} name={item.name} sizes="80px" /></div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><div><h3>{item.name}</h3><p>{item.size || "Fine fragrance"}</p></div><button type="button" onClick={() => dispatch(deleteFromCart(item))} aria-label={`Remove ${item.name}`}><Trash2 className="h-4 w-4" /></button></div><div className="oe-cart-line-bottom"><div className="oe-cart-quantity"><button type="button" aria-label="Decrease quantity" onClick={() => dispatch(removeFromCart(item))}><Minus className="h-3.5 w-3.5" /></button><span>{item.quantity}</span><button type="button" aria-label="Increase quantity" disabled={item.variantStock !== undefined && item.quantity >= item.variantStock} onClick={() => dispatch(addToCart(item))}><Plus className="h-3.5 w-3.5" /></button></div><span>₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</span></div></div></article>)}</div>
        <div className="flex justify-between border-t border-[var(--store-line)] pt-4 text-sm"><span className="text-[var(--store-muted)]">Subtotal</span><strong>₹{totalAmount.toLocaleString("en-IN")}</strong></div><p className="mt-3 text-sm leading-5 text-[var(--store-muted)]">This is an estimate. We’ll confirm stock, delivery and the final amount directly with you.</p>
      </section>

      {step === "bag" ? <aside className="house-cart-summary"><p className="eyebrow">Order summary</p><div><span>Subtotal</span><strong>₹{total.toLocaleString("en-IN")}</strong></div><p>Delivery and the final total are confirmed personally on WhatsApp.</p><button type="button" className="house-button" onClick={() => { setStep("details"); requestAnimationFrame(() => document.getElementById("delivery-heading")?.focus()); }}>Continue to delivery details<ArrowRight size={18}/></button><Link href="/products" className="house-link">Continue shopping</Link></aside> : <>
        <section className="oe-cart-details-panel">
          <div className="oe-checkout-heading"><h2 id="delivery-heading" tabIndex={-1}>Delivery details</h2><p>Your details are only used to confirm this request and delivery.</p>{!user && <Link href="/login?redirect=%2Fcart">Sign in to use saved details</Link>}</div>
          <form onSubmit={sendOrder} className="oe-checkout-form">
            <fieldset className="oe-checkout-fieldset">
              <legend>Contact</legend>
              <label className="oe-checkout-field">Full name<input required autoComplete="name" value={form.name} onChange={(e) => change("name", e.target.value)} className={inputClass} placeholder="Your name" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="oe-checkout-field">Phone / WhatsApp<input required type="tel" autoComplete="tel" minLength={10} value={form.phone} onChange={(e) => change("phone", e.target.value)} className={inputClass} placeholder="+91 98765 43210" /></label>
                <label className="oe-checkout-field">Email <span className="font-normal text-[var(--store-muted)]">(optional)</span><input type="email" autoComplete="email" value={form.email} onChange={(e) => change("email", e.target.value)} className={inputClass} placeholder="you@example.com" /></label>
              </div>
            </fieldset>
            <fieldset className="oe-checkout-fieldset">
              <legend>Delivery address</legend>
              <label className="oe-checkout-field">Street address<input required autoComplete="street-address" value={form.address} onChange={(e) => change("address", e.target.value)} className={inputClass} placeholder="House, street, area" /></label>
              <div className="grid gap-4 sm:grid-cols-6">
                <label className="oe-checkout-field sm:col-span-2">City<input required autoComplete="address-level2" value={form.city} onChange={(e) => change("city", e.target.value)} className={inputClass} /></label>
                <label className="oe-checkout-field sm:col-span-2">State<input required autoComplete="address-level1" value={form.state} onChange={(e) => change("state", e.target.value)} className={inputClass} /></label>
                <label className="oe-checkout-field sm:col-span-2">PIN code<input required autoComplete="postal-code" inputMode="numeric" value={form.postalCode} onChange={(e) => change("postalCode", e.target.value)} className={inputClass} /></label>
              </div>
            </fieldset>
            <label className="oe-checkout-field">Note <span className="font-normal text-[var(--store-muted)]">(optional)</span><textarea value={form.note} onChange={(e) => change("note", e.target.value)} className={`${inputClass} min-h-20 py-3`} placeholder="Delivery preference, gift note, scent question…" /></label>
            <button type="submit" disabled={submitting} className="oe-whatsapp-submit mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 px-5 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-60"><MessageCircle className="h-4 w-4" />{submitting ? "Preparing your WhatsApp message…" : "Send order on WhatsApp"}<ArrowRight className="h-4 w-4" /></button>
            <p className="oe-checkout-payment-note">No online payment. We’ll confirm availability, delivery and payment with you on WhatsApp.</p>
          </form>
        </section>
        <aside className="oe-checkout-summary" aria-label="Order summary">
          <p className="eyebrow">Your selection</p>
          <div className="oe-checkout-summary-items">{cart.map((item) => <div className="oe-checkout-summary-item" key={`${item.id}-${item.variantId || item.size}-${item.color}`}>
            <div className="oe-checkout-summary-image"><ProductVisual src={item.image} alt="" name={item.name} sizes="56px" /></div>
            <div><strong>{item.name}</strong><span>{[item.size, item.color].filter(Boolean).join(" · ") || "Fine fragrance"} · Qty {item.quantity}</span></div>
            <strong>₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</strong>
          </div>)}</div>
          <div className="oe-checkout-summary-total"><span>Estimated total</span><strong>₹{total.toLocaleString("en-IN")}</strong></div>
          <p>Final delivery and total will be confirmed with you directly.</p>
          <button type="button" className="oe-checkout-edit" onClick={() => setStep("bag")}><ArrowLeft size={15} />Edit your selection</button>
        </aside>
      </>}
    </div>}
  </div>;
}
