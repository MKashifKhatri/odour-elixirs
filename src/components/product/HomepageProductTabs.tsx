"use client";

import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ProductCard from "./ProductCard";
import { Skeleton } from "../ui/skeleton";

type Tab = "latest" | "trending";

export default function HomepageProductTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("latest");
  const { featuredProducts, loading } = useSelector((state: RootState) => state.user);
  const products = activeTab === "latest"
    ? [...featuredProducts].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    : featuredProducts;

  return (
    <section aria-labelledby="homepage-products-heading" className="rounded-2xl border border-[var(--store-line)] bg-[var(--store-surface)] p-4 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Find your next favorite</p>
          <h2 id="homepage-products-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--store-ink)] sm:text-3xl">The latest edit</h2>
        </div>
        <div role="tablist" aria-label="Product collection" className="flex w-fit rounded-full border border-[var(--store-line)] p-1">
          {(["latest", "trending"] as Tab[]).map((tab) => <button key={tab} id={`home-${tab}-tab`} type="button" role="tab" aria-selected={activeTab === tab} aria-controls="home-products-panel" onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${activeTab === tab ? "bg-[var(--store-ink)] text-[var(--store-bg)]" : "text-[var(--store-muted)] hover:text-[var(--store-ink)]"}`}>{tab === "latest" ? "New arrivals" : "Trending"}</button>)}
        </div>
      </div>
      <div id="home-products-panel" role="tabpanel" aria-labelledby={`home-${activeTab}-tab`} className="mt-5">
        {loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="space-y-3"><Skeleton className="aspect-square w-full rounded-xl" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/3" /></div>)}</div>
          : products.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div>
          : <p className="rounded-xl border border-dashed border-[var(--store-line)] p-8 text-center text-sm text-[var(--store-muted)]">New selections are on their way.</p>}
      </div>
      <Link href="/products" className="mt-5 inline-flex text-sm font-semibold text-[var(--store-ink)] underline decoration-[var(--store-accent)] decoration-2 underline-offset-4 hover:text-[var(--store-muted)]">View all products</Link>
    </section>
  );
}
