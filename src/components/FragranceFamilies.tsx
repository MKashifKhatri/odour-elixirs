"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { demoProducts } from "@/lib/demoCatalog";
import { getAllProducts } from "@/app/services/api";
import type { Product } from "@/lib/types";
export default function FragranceFamilies({ eyebrow, title }: { eyebrow: string; title: string }) {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  useEffect(() => { let active = true; getAllProducts().then(data => { const items = Array.isArray(data) ? data : data?.products; if (active && Array.isArray(items) && items.length) setProducts(items.filter((product: Product) => product.is_active)); }).catch(() => undefined); return () => { active = false; }; }, []);
  const families = Array.from(new Set(products.filter(p => p.is_active).map(p => p.subcategory || p.category?.name).filter(Boolean)));
  if (!families.length) return null;
  return <section className="house-discovery" id="collections" aria-labelledby="family-title"><header><p className="eyebrow">{eyebrow}</p><h2 id="family-title">{title}</h2><p>Follow a familiar note.<br />Or find something unexpected.</p></header><nav aria-label="Explore fragrance families">{families.map((family,index) => <Link key={family} href={`/products?family=${encodeURIComponent(family!)}`}><span className="house-index">{String(index+1).padStart(2,"0")}</span><span>{family}</span><ArrowUpRight size={22} /></Link>)}</nav></section>;
}
