"use client";

import Link from "next/link";
import ScentProductCard from "@/components/ScentProductCard";
import type { Product } from "@/lib/types";
import useWishlist from "@/hooks/useWishlist";

export default function WishlistPage() {
  const { items } = useWishlist();
  const savedProducts = items.map((item) => ({ ...item, quantity: 0 }) as Product);

  return (
    <main className="oe-store-page oe-wishlist-page">
      <nav aria-label="Breadcrumb" className="oe-breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Wishlist</span></nav>
      <header className="oe-account-heading"><p className="oe-micro-label"><span />YOUR ACCOUNT</p><h1>Wishlist</h1><p>Your saved fragrances, all in one place.</p></header>
      {savedProducts.length ? <div className="oe-catalog-grid">{savedProducts.map((product, index) => <ScentProductCard key={product.id} product={product} index={index} />)}</div> : <section className="oe-cart-empty"><p>No saved fragrances yet.</p><Link href="/products">Explore fragrances <span aria-hidden="true">→</span></Link></section>}
    </main>
  );
}