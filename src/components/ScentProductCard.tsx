"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandIcon } from "@/components/ui/brand-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import type { Product } from "@/lib/types";
import { addToCart } from "@/store/reducer/cartReducer";
import { preferredVariant, isVariantAvailable, variantStock as getStock } from "@/lib/fragranceAvailability";
import ProductVisual from "@/components/ProductVisual";
import WishlistButton from "@/components/WishlistButton";

export default function ScentProductCard({ product, index = 0, editorial = false, preview = false }: { product: Product; index?: number; editorial?: boolean; preview?: boolean }) {
  const [saved, setSaved] = useState(false);
  const secondaryImage = product.images?.find((image) => image && image !== product.image);
  const dispatch = useDispatch();
  const variants = product.variants?.filter((variant) => variant.is_active !== false) || [];
  const defaultVariant = preferredVariant(product);
  const variantStock = getStock(product, defaultVariant);
  const available = isVariantAvailable(product, defaultVariant);
  const needsChoice = variants.length > 1 || (product.sizes?.length || 0) > 1 || (product.color?.length || 0) > 0;
  const add = () => {
    if (!available || variantStock <= 0) return;
    if (preview) { toast.success("Demo: added to bag. Your real bag is unchanged."); return; }
    dispatch(addToCart({ id: product.id, name: product.name, slug: product.slug, price: Number(defaultVariant?.selling_price ?? product.price), image: product.image, quantity: 1, color: defaultVariant?.color || "", size: defaultVariant?.size || product.size || "", variantId: defaultVariant?.id, variantStock }));
    toast.success("Added to your selection");
  };

  return (
    <article className={`ds-product-card${editorial ? " ds-product-card-editorial" : ""}`}>
      <Link href={`/product/${product.slug}`} aria-label={`Discover ${product.name}`} className="ds-product-media" onClick={preview ? (event) => event.preventDefault() : undefined}>
        <ProductVisual src={product.image} alt={`${product.name} fragrance`} name={product.name} sizes="(max-width: 640px) 46vw, (max-width: 1000px) 45vw, 30vw" />
        {secondaryImage && <span className="ds-product-secondary" aria-hidden="true"><ProductVisual src={secondaryImage} alt="" name={product.name} sizes="(max-width: 640px) 100vw, 30vw" /></span>}
        {!available && <Badge className="ds-product-status">Unavailable</Badge>}
      </Link>
      {preview ? <Button type="button" variant="secondary" size="icon" className="ds-product-wishlist" aria-label={saved ? "Remove demo fragrance from wishlist" : "Save demo fragrance"} aria-pressed={saved} onClick={() => setSaved(!saved)}><BrandIcon name="heart" fill={saved ? "currentColor" : "none"} /></Button> : <WishlistButton product={product} className="ds-product-wishlist" />}
      <div className="ds-product-copy"><p>{product.subcategory || product.category?.name || "Eau de parfum"}</p><h3><Link href={`/product/${product.slug}`} onClick={preview ? (event) => event.preventDefault() : undefined}>{product.name}</Link></h3><p className="ds-product-size">{defaultVariant?.size || product.size || product.sizes?.join(" · ") || "Size on request"}<span>{available ? "In stock" : "Sold out"}</span></p><div className="ds-product-purchase"><strong className="ds-product-price">₹{Number(defaultVariant?.selling_price ?? product.price).toLocaleString("en-IN")}</strong>
      {needsChoice ? <Button asChild variant="secondary"><Link href={`/product/${product.slug}`} onClick={preview ? (event) => event.preventDefault() : undefined}>Select size<BrandIcon name="chevron" /></Link></Button> : <Button type="button" variant="secondary" onClick={add} disabled={!available} aria-label={available ? `Add ${product.name} to your selection` : `${product.name} is unavailable`}><BrandIcon name="plus" />{available ? "Add to bag" : "Unavailable"}</Button>}</div></div>
    </article>
  );
}
