"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandIcon } from "@/components/ui/brand-icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ProductVisual from "@/components/ProductVisual";
import { getAllProducts } from "@/app/services/api";
import { demoProducts } from "@/lib/demoCatalog";
import type { Product } from "@/lib/types";

export default function SearchSheet() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(demoProducts);

  useEffect(() => {
    if (!open) return;
    let active = true;
    getAllProducts().then((data) => {
      const items = Array.isArray(data) ? data : data?.products;
      if (active && Array.isArray(items) && items.length) setProducts(items.filter((item: Product) => item.is_active));
    }).catch(() => undefined);
    return () => { active = false; };
  }, [open]);

  const results = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return products.slice(0, 4);
    return products.filter((product) => `${product.name} ${product.subcategory || ""} ${product.category?.name || ""} ${product.description} ${Object.values(product.specs || {}).join(" ")}`.toLowerCase().includes(search)).slice(0, 6);
  }, [products, query]);

  return (
    <Sheet open={open} onOpenChange={(value) => { setOpen(value); if (!value) setQuery(""); }}>
      <SheetTrigger asChild><Button type="button" variant="ghost" aria-label="Search fragrances" title="Search fragrances" className="brand-icon-button"><BrandIcon name="search" /></Button></SheetTrigger>
      <SheetContent side="top" hideClose aria-describedby={undefined} className="oe-search-panel">
        <SheetHeader className="oe-search-heading"><SheetTitle>Search Odour Elixirs</SheetTitle><SheetClose asChild><Button type="button" variant="ghost" size="icon" aria-label="Close search" className="brand-icon-button"><BrandIcon name="close" /></Button></SheetClose></SheetHeader>
        <div className="oe-search-body">
          <label htmlFor="global-fragrance-search" className="brand-search-label">Search fragrances</label><div className="oe-search-field"><BrandIcon name="search" /><input id="global-fragrance-search" autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by fragrance, note or family" /></div>
          <p className="oe-v2-kicker">{query.trim() ? "Matching fragrances" : "Popular fragrances"}</p>
          {results.length ? <div className="oe-search-results">{results.map((product, index) => <Link href={`/product/${product.slug}`} key={product.id} onClick={() => setOpen(false)} className="oe-search-result"><span className="oe-search-result-visual"><ProductVisual src={product.image} alt={`${product.name} fragrance`} name={product.name} sizes="120px" /></span><span><small>{product.subcategory || product.category?.name || "Eau de parfum"}</small><strong>{product.name}</strong><small>₹{Number(product.price).toLocaleString("en-IN")}</small></span><ArrowUpRight size={16} /></Link>)}</div> : <p className="oe-search-no-results">No fragrance found. Try another note or name.</p>}
          <SheetClose asChild><Link href="/products" className="oe-v2-text-link">Browse all fragrances <ArrowUpRight size={14} /></Link></SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
