"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ScentProductCard from "@/components/ScentProductCard";
import Reveal from "@/components/Reveal";
import { demoProducts } from "@/lib/demoCatalog";
import { getAllProducts } from "@/app/services/api";
import type { Product } from "@/lib/types";
import ProductVisual from "@/components/ProductVisual";

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
      setProducts((featured.length ? [...featured, ...available.filter((p: Product) => !p.featured)] : available).slice(0, 4));
      setLoadedFromStore(true);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const featured = products[0];
  const supportingProducts = products.slice(0, 4);
  const featuredVariant = featured?.variants?.find((variant) => variant.is_active !== false);
  const featuredPrice = Number(featuredVariant?.selling_price ?? featured?.price ?? 0);
  const featuredSize = featuredVariant?.size || featured?.size || featured?.sizes?.[0];

  return <section className="oe-featured-edit" id="collection" aria-labelledby="collection-title">
    <Reveal className="oe-featured-edit-heading">
      <div><p className="oe-lux-eyebrow"><span aria-hidden="true" />{eyebrow}</p><h2 id="collection-title">{title}</h2></div>
      <p>{description}</p>
      <Link href="/products" className="oe-lux-text-link">View the collection<ArrowUpRight size={16} strokeWidth={1.4} /></Link>
    </Reveal>
    {featured && <Reveal className="oe-featured-campaign">
      <Link href={`/product/${featured.slug}`} className="oe-featured-campaign-image" aria-label={`Discover ${featured.name}`}><ProductVisual src={featured.image} alt={`${featured.name} fragrance`} name={featured.name} sizes="(max-width: 760px) 100vw, 58vw" /></Link>
      <div className="oe-featured-campaign-copy">
        <p className="oe-featured-index">01 / FEATURED SCENT</p>
        <p className="oe-featured-family">{featured.subcategory || featured.category?.name || "Fine fragrance"}</p>
        <h3>{featured.name}</h3>
        {featured.description && <p className="oe-featured-description">{featured.description}</p>}
        <dl><div><dt>Size</dt><dd>{featuredSize || "Available sizes"}</dd></div><div><dt>Price</dt><dd>₹{featuredPrice.toLocaleString("en-IN")}</dd></div></dl>
        <Link href={`/product/${featured.slug}`} className="oe-featured-action">Discover the fragrance<ArrowUpRight size={17} strokeWidth={1.5} /></Link>
      </div>
    </Reveal>}
    {supportingProducts.length > 0 && <div className="oe-featured-rail">{supportingProducts.map((product, index) => <Reveal key={product.id} delay={index * 0.05}><ScentProductCard product={product} index={index + 1} /></Reveal>)}</div>}
    {!loadedFromStore && <p className="oe-lux-preview-note">A preview collection is shown until your live catalogue is available.</p>}
  </section>;
}
