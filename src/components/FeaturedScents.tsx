"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ScentProductCard from "@/components/ScentProductCard";
import Reveal from "@/components/Reveal";
import { demoProducts } from "@/lib/demoCatalog";
import { getAllProducts } from "@/app/services/api";
import type { Product } from "@/lib/types";

export default function FeaturedScents({ title = "Featured fragrances", description = "A closer look at the scents people return to.", eyebrow = "The collection" }: { title?: string; description?: string; eyebrow?: string }) {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [loadedFromStore, setLoadedFromStore] = useState(false);

  useEffect(() => {
    let active = true;
    getAllProducts().then((data) => {
      const list = Array.isArray(data) ? data : data?.products;
      if (!active || !Array.isArray(list) || !list.length) return;
      const available = list.filter((product: Product) => product.is_active);
      const featured = available.filter((product: Product) => product.featured);
      setProducts((featured.length ? featured : available).slice(0, 4));
      setLoadedFromStore(true);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <section className="oe-lux-collection" id="collection">
      <Reveal className="oe-lux-section-heading">
        <div><p className="oe-lux-eyebrow"><span aria-hidden="true" />{eyebrow}</p><h2>{title}</h2><p>{description}</p></div>
        <Link href="/products" className="oe-lux-text-link">Explore all fragrances<ArrowUpRight size={16} strokeWidth={1.4} /></Link>
      </Reveal>
      <div className="oe-lux-product-grid">
        {products.slice(0, 4).map((product, index) => <Reveal key={product.id} delay={index * 0.05}><ScentProductCard product={product} index={index} /></Reveal>)}
      </div>
      {!loadedFromStore && <p className="oe-lux-preview-note">A preview collection is shown until your live catalogue is available.</p>}
    </section>
  );
}
