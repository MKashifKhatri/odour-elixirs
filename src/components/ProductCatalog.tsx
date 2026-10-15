"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import ScentProductCard from "@/components/ScentProductCard";
import { demoProducts } from "@/lib/demoCatalog";
import { getAllProducts } from "@/app/services/api";
import type { Product } from "@/lib/types";
import { useStorefrontContent } from "@/lib/useStorefrontContent";
import { isVariantAvailable, preferredVariant } from "@/lib/fragranceAvailability";

export default function ProductCatalog() {
  const content = useStorefrontContent();
  const searchParams = useSearchParams();
  const requestedFamily = searchParams.get("family");
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("All scents");
  const [size, setSize] = useState("All sizes");
  const [inStock, setInStock] = useState(false);
  const sizes = Array.from(new Set(products.flatMap(p => p.variants?.length ? p.variants.filter(v => v.is_active !== false).map(v => v.size) : p.sizes?.length ? p.sizes : (p.size ? [p.size] : []))));
  const [sort, setSort] = useState("featured");
  const [usingPreviewCatalog, setUsingPreviewCatalog] = useState(true);
  const families = useMemo(() => ["All scents", ...Array.from(new Set(products.flatMap((product) => [product.category?.name, product.subcategory]).filter((item): item is string => Boolean(item?.trim())))).sort((a, b) => a.localeCompare(b))], [products]);

  useEffect(() => {
    getAllProducts().then((data) => {
      const items = Array.isArray(data) ? data : data?.products;
      if (Array.isArray(items) && items.length) {
        setProducts(items.filter((product: Product) => product.is_active));
        setUsingPreviewCatalog(false);
      }
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (requestedFamily) setFamily(requestedFamily);
  }, [requestedFamily]);

  const filtered = useMemo(() => products.filter((product) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${product.name} ${product.description} ${product.subcategory || ""} ${(product.fragrance_notes || []).join(" ")} ${Object.values(product.specs || {}).join(" ")}`.toLowerCase().includes(query);
    const matchesFamily = family === "All scents" || [product.subcategory, product.category?.name].some((item) => item?.toLowerCase() === family.toLowerCase());
    const variants = product.variants?.filter(v => v.is_active !== false) || [];
    const stock = variants.length ? variants.some(v => isVariantAvailable(product, v) && (size === "All sizes" || v.size === size)) : isVariantAvailable(product);
    const matchesSize = size === "All sizes" || variants.some(v => v.size === size) || product.sizes?.includes(size) || product.size === size;
    return matchesSearch && matchesFamily && matchesSize && (!inStock || stock);
  }).sort((a, b) => sort === "price-low" ? Number(preferredVariant(a)?.selling_price ?? a.price) - Number(preferredVariant(b)?.selling_price ?? b.price) : sort === "price-high" ? Number(preferredVariant(b)?.selling_price ?? b.price) - Number(preferredVariant(a)?.selling_price ?? a.price) : sort === "newest" ? new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime() : Number(b.featured) - Number(a.featured)), [family, products, search, sort, size, inStock]);

  return <div className="oe-store-page oe-catalog">
    <nav aria-label="Breadcrumb" className="oe-breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Shop</span></nav>
    <section className="oe-catalog-header"><p className="oe-micro-label oe-micro-label-dark"><span />{content.productsEyebrow}</p><h1>{content.productsTitle}</h1><p>{content.productsDescription}</p></section>
    <div className="oe-catalog-controls">
      <label className="oe-catalog-search"><Search aria-hidden="true" size={18} /><input aria-label="Search fragrances" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search fragrances" /></label>
      <div className="oe-catalog-tools">
        <label className="oe-catalog-sort"><span>Sort by</span><select aria-label="Sort fragrances" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="newest">Newest</option></select></label>
      </div>
      <p className="oe-catalog-result-count" role="status">{filtered.length} fragrances</p>
    </div>
    <div className="house-catalog-refine"><label>Family<select value={family} onChange={e => setFamily(e.target.value)}>{families.map(f => <option key={f}>{f}</option>)}</select></label><label>Size<select value={size} onChange={e => setSize(e.target.value)}><option>All sizes</option>{sizes.map(s => <option key={s}>{s}</option>)}</select></label><label className="house-stock-filter"><input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} />In stock only</label></div>
    {usingPreviewCatalog && <p className="oe-catalog-preview-note">Preview collection</p>}
    <div className="oe-catalog-grid">{filtered.map((product, index) => <ScentProductCard key={product.id} product={product} index={index} />)}</div>
    {!filtered.length && <div className="oe-catalog-empty"><h2>No fragrance found</h2><p>Try another scent family or note.</p><button type="button" onClick={() => { setSearch(""); setFamily("All scents"); setSort("featured"); setSize("All sizes"); setInStock(false); }}>Clear filters</button></div>}
  </div>;
}
