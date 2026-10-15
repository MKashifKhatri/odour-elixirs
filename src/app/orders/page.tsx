"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, PackageSearch } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { useStorefrontContent } from "@/lib/useStorefrontContent";

type SavedOrder = { id: string; status: string; payment_status: string; estimated_total: number; created_at: string; items: { product_name_snapshot: string; quantity: number; requested_unit_price: number; size_snapshot?: string }[] };

export default function MyOrdersPage() {
  const content = useStorefrontContent();
  const whatsappNumber = (content.whatsappNumber || WHATSAPP_NUMBER).replace(/\D/g, "");
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/customer-orders", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Sign in to view your saved order requests.");
      setOrders(data.orders || []);
    }).catch((error) => setMessage(error instanceof Error ? error.message : "Could not load your requests.")).finally(() => setLoading(false));
  }, []);
  return <div className="oe-store-page oe-orders-page"><header className="oe-account-heading"><p className="oe-micro-label oe-micro-label-dark"><span />YOUR ACCOUNT</p><h1>Your order requests</h1><p>Your WhatsApp cart requests and their progress appear here when you are signed in.</p></header>
    {loading ? <p className="oe-orders-loading">Loading your requests…</p> : message ? <section className="oe-orders-message"><p>{message}</p><Link href="/login?redirect=%2Forders">Sign in <ArrowRight className="h-4 w-4" /></Link></section> : orders.length ? <div className="oe-orders-list">{orders.map((order) => <article key={order.id} className="oe-order-card"><div className="oe-order-heading"><div><p className="oe-order-reference">Request {order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p><h2>{order.status}</h2></div><div className="oe-order-total"><p>₹{Number(order.estimated_total).toLocaleString("en-IN")}</p><span>Estimate · payment confirmed directly</span></div></div><div className="oe-order-items">{order.items.map((item, index) => <p key={`${item.product_name_snapshot}-${index}`}>{item.product_name_snapshot}{item.size_snapshot ? ` · ${item.size_snapshot}` : ""} × {item.quantity}</p>)}</div></article>)}</div> : <section className="oe-orders-empty"><PackageSearch className="mx-auto h-8 w-8" /><h2>No requests yet</h2><p>Your next fragrance inquiry will be saved here.</p><Link href="/products">Explore fragrances <ArrowRight className="h-4 w-4" /></Link><a href={`https://wa.me/${whatsappNumber}`}><MessageCircle className="h-4 w-4" /> Talk to us</a></section>}
  </div>;
}
