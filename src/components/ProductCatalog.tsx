"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import ScentProductCard from "@/components/ScentProductCard";
import { demoProducts } from "@/lib/demoCatalog";
import { getAllProducts } from "@/app/services/api";
import type { Product } from "@/lib/types";
import { useStorefrontContent } from "@/lib/useStorefrontContent";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function ProductCatalog() {
  const content = useStorefrontContent();
  const searchParams = useSearchParams();
  const requestedFamily = searchParams.get("family");
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("All scents");
  const [sort, setSort] = useState("featured");
  const [usingPreviewCatalog, setUsingPreviewCatalog] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const families = useMemo(() => ["All scents", ...Array.from(new Set(["Fresh", "Woody", "Amber", "Gourmand", "Aquatic", ...products.flatMap((product) => [product.category?.name, product.subcategory]).filter((item): item is string => Boolean(item))]))], [products]);

  useEffect(() => {
    getAllProducts().then((data) => {
      const items = Array.isArray(data) ? data : data?.products;
      if (Array.isArray(items) && items.length) { setProducts(items); setUsingPreviewCatalog(false); }
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (requestedFamily) setFamily(requestedFamily);
  }, [requestedFamily]);

  const filtered = useMemo(() => products.filter((product) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${product.name} ${product.description} ${product.subcategory || ""} ${Object.values(product.specs || {}).join(" ")}`.toLowerCase().includes(query);
    const matchesFamily = family === "All scents" || [product.subcategory, product.category?.name].some((item) => item?.toLowerCase() === family.toLowerCase());
    return matchesSearch && matchesFamily;
  }).sort((a, b) => sort === "price-low" ? Number(a.price) - Number(b.price) : sort === "price-high" ? Number(b.price) - Number(a.price) : sort === "newest" ? new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime() : Number(b.featured) - Number(a.featured)), [family, products, search, sort]);

  return <main className="oe-store-page oe-catalog">
    <nav aria-label="Breadcrumb" className="oe-breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Shop</span></nav>
    <section className="oe-catalog-header"><p className="oe-micro-label oe-micro-label-dark"><span />{content.productsEyebrow}</p><h1>{content.productsTitle}</h1><p>{content.productsDescription}</p></section>
    <div className="oe-catalog-controls">
      <label className="oe-catalog-search"><Search aria-hidden="true" size={18} /><input aria-label="Search fragrances" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search fragrances" /></label>
      <div className="oe-catalog-tools">
        <button type="button" className="oe-catalog-filter-trigger" onClick={() => setFiltersOpen(true)} aria-haspopup="dialog"><SlidersHorizontal aria-hidden="true" size={18} />Filter{family !== "All scents" && <span>1</span>}</button>
        <label className="oe-catalog-sort"><span>Sort by</span><select aria-label="Sort fragrances" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="newest">Newest</option></select></label>
      </div>
      <p className="oe-catalog-result-count">{filtered.length} fragrances</p>
    </div>
    {usingPreviewCatalog && <p className="oe-catalog-preview-note">Preview collection</p>}
    <div className="oe-catalog-grid">{filtered.map((product, index) => <ScentProductCard key={product.id} product={product} index={index} />)}</div>
    {!filtered.length && <div className="oe-catalog-empty"><h2>No fragrance found</h2><p>Try another scent family or note.</p><button type="button" onClick={() => { setSearch(""); setFamily("All scents"); setSort("featured"); }}>Clear filters</button></div>}
    <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
      <SheetContent side="right" className="oe-filter-sheet">
        <SheetHeader className="oe-filter-heading"><SheetTitle>Filter fragrances</SheetTitle><SheetDescription>Choose a family to refine the collection.</SheetDescription></SheetHeader>
        <fieldset className="oe-filter-family-list"><legend>Fragrance family</legend>{families.map((item) => <button key={item} type="button" aria-pressed={family === item} className={family === item ? "is-active" : ""} onClick={() => setFamily(item)}><span>{item}</span><span aria-hidden="true" /></button>)}</fieldset>
        <SheetFooter className="oe-filter-footer"><button type="button" className="oe-filter-clear" onClick={() => { setSearch(""); setFamily("All scents"); setSort("featured"); }}>Clear all</button><button type="button" className="oe-filter-apply" onClick={() => setFiltersOpen(false)}>Show {filtered.length} fragrances</button></SheetFooter>
      </SheetContent>
    </Sheet>
  </main>;
}
