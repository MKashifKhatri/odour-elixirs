"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Product, ProductVariant } from "@/lib/types";
import AddToCartButton from "../cart/AddToCartButton";
import ProductCarousel from "./ProductCarousel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { preferredVariant, isVariantAvailable, variantStock as getStock } from "@/lib/fragranceAvailability";
import { Label } from "@/components/ui/label";

export default function ProductDetailCard({ product }: { product: Product; isLoading?: boolean }) {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const activeVariants = (product.variants || []).filter((variant) => variant.is_active !== false);
  const variantsBySize = new Map<string, ProductVariant>();
  activeVariants.forEach((variant) => { if (!variantsBySize.has(variant.size) || isVariantAvailable(product, variant)) variantsBySize.set(variant.size, preferredVariant(product, variant.size)!); });
  const sizes = activeVariants.length ? Array.from(variantsBySize.keys()) : product.sizes?.length ? product.sizes : (product.size ? [product.size] : []);
  const hasSizes = sizes.length > 0;
  const idVariant = activeVariants.find((variant) => variant.id === selectedVariantId);
  const activeSize = selectedSize || idVariant?.size || preferredVariant(product)?.size || sizes[0] || product.size || "";
  const variantsForSize = activeVariants.filter((variant) => variant.size === activeSize);
  const variantColors = Array.from(new Set(variantsForSize.map((variant) => variant.color).filter((color): color is string => Boolean(color))));
  const hasColors = variantColors.length > 0 || (Array.isArray(product.color) && product.color.length > 0);
  const activeColor = selectedColor || idVariant?.color || preferredVariant(product, activeSize)?.color || variantColors[0] || product.color?.[0] || "";
  const selectedVariant = variantsForSize.find((variant) => !variantColors.length || variant.color === activeColor) || variantsForSize[0];
  const displayedPrice = Number(selectedVariant?.selling_price ?? product.price);
  const stockCount = getStock(product, selectedVariant);
  const isAvailable = isVariantAvailable(product, selectedVariant);
  const isOutOfStock = !isAvailable;
  const canAddToCart = (!hasSizes || Boolean(activeSize)) && (!hasColors || Boolean(activeColor)) && !isOutOfStock && quantity <= stockCount;
  const availabilityLabel = !isAvailable ? "Out of stock" : stockCount <= 5 ? "Limited availability" : "In stock";
  const noteGroups = useMemo(() => {
    const specs = Object.entries(product.specs || {});
    return ["top", "heart", "base"].map((group) => ({ label: group, value: specs.find(([key]) => key.toLowerCase().includes(group))?.[1] || "" })).filter((group) => group.value);
  }, [product.specs]);
  const ingredientEntry = Object.entries(product.specs || {}).find(([key]) => key.toLowerCase().includes("ingredient"));
  const initialVariantId = preferredVariant(product)?.id || "";

  useEffect(() => {
    setSelectedSize("");
    setSelectedColor("");
    setSelectedVariantId(initialVariantId);
    setQuantity(1);
  }, [product.id, initialVariantId]);

  const selectSize = (size: string) => {
    const nextVariant = activeVariants.find((variant) => variant.size === size && variant.color === selectedColor && isVariantAvailable(product, variant)) || preferredVariant(product, size);
    setSelectedSize(size);
    setSelectedVariantId(nextVariant?.id || "");
    setSelectedColor(nextVariant?.color || "");
    setQuantity(1);
  };
  const selectColor = (color: string) => {
    const nextVariant = variantsForSize.find((variant) => variant.color === color);
    setSelectedColor(color);
    setSelectedVariantId(nextVariant?.id || "");
    setQuantity(1);
  };
  const cartProduct = { ...product, price: displayedPrice, color: hasColors ? [activeColor] : [], size: hasSizes ? activeSize : "", variant_id: selectedVariant?.id, variantStock: stockCount };

  return (
    <section className="oe-v2-product-detail">
      <div className="oe-v2-product-gallery"><ProductCarousel product={product} /></div>
      <div className="oe-v2-product-information"><Link href="/products" className="house-back">Collection / Fragrance</Link>
        <p className="oe-v2-kicker">{product.category?.name || product.subcategory || "Eau de parfum"}</p>
        <h1>{product.name}</h1>
        {product.brand && product.brand !== "Odour Elixirs" && <p className="oe-v2-product-brand">{product.brand} / {product.name}</p>}
        <div className="oe-v2-detail-price"><strong>₹{displayedPrice.toLocaleString("en-IN")}</strong>{activeSize && <span>{activeSize}</span>}</div>
        <p className={`oe-v2-stock${!isAvailable ? " is-out" : stockCount <= 5 ? " is-low" : ""}`}><i className={isOutOfStock ? "is-out" : ""} />{availabilityLabel}</p>

        {hasSizes && <div className="oe-v2-option"><div><span>Choose your size</span><span>Size / price</span></div><div className="oe-v2-option-list oe-product-size-options" role="group" aria-label="Choose a size">{sizes.map((size) => {
          const variant = variantsBySize.get(size);
          const sizePrice = Number(variant?.selling_price ?? product.price);
                    const sizeAvailable = isVariantAvailable(product, variant);
          const selected = activeSize === size;
          return <button key={size} type="button" className="oe-product-size-choice" aria-pressed={selected} aria-label={`${size}, ₹${sizePrice.toLocaleString("en-IN")}${sizeAvailable ? "" : ", out of stock"}`} disabled={!sizeAvailable} onClick={() => selectSize(size)}><span>{size}</span><strong>₹{sizePrice.toLocaleString("en-IN")}</strong><small>{sizeAvailable ? "Available" : "Sold out"}</small></button>;
        })}</div></div>}
        {hasColors && <div className="oe-v2-option"><div><span>Colour</span><span>{activeColor || "Select a colour"}</span></div><RadioGroup value={activeColor} onValueChange={selectColor} className="oe-v2-option-list">{(variantColors.length ? variantColors : product.color).map((color) => { const id = `color-${product.id}-${color}`; return <div key={color} className="oe-v2-option-item"><RadioGroupItem value={color} id={id} /><Label htmlFor={id}>{color}</Label></div>; })}</RadioGroup></div>}

        <div className="house-purchase-controls"><div className="oe-v2-quantity"><span>Quantity</span><div><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><output aria-live="polite">{quantity}</output><button type="button" aria-label="Increase quantity" disabled={quantity >= stockCount} onClick={() => setQuantity((value) => Math.min(stockCount, value + 1))}><Plus size={14} /></button></div></div>

        <div className="oe-v2-buy-actions"><AddToCartButton product={cartProduct} variant={selectedVariant} disabled={!canAddToCart} quantity={quantity} /><Link href="/cart" className="oe-v2-whatsapp-link">Continue to WhatsApp order <ArrowRight size={15} /></Link></div>
        </div><p className="oe-v2-detail-note">No online payment. We’ll confirm availability, delivery and payment with you directly.</p>

        <div className="oe-v2-accordions">
          <details open><summary><span>Description</span><i /></summary><div>{product.description || "Product details will be added soon."}</div></details>
          <details><summary><span>Fragrance notes</span><i /></summary><div>{product.fragrance_notes?.length ? <ul>{product.fragrance_notes.map((note) => <li key={note}>{note}</li>)}</ul> : noteGroups.length ? <dl className="oe-v2-note-list">{noteGroups.map((group) => <div key={group.label}><dt>{group.label}</dt><dd>{group.value}</dd></div>)}</dl> : "Fragrance notes will be added soon."}</div></details>
          {(product.concentration || product.longevity) && <details><summary><span>Fragrance profile</span><i /></summary><div><dl className="oe-v2-note-list">{product.concentration && <div><dt>Concentration</dt><dd>{product.concentration}</dd></div>}{product.longevity && <div><dt>Longevity</dt><dd>{product.longevity}</dd></div>}</dl></div></details>}
          {ingredientEntry && <details><summary><span>Ingredients</span><i /></summary><div>{ingredientEntry[1]}</div></details>}
          <details><summary><span>Shipping & returns</span><i /></summary><div>Delivery availability, timing and return details are confirmed directly with you on WhatsApp before your request is finalised.</div></details>
        </div>
      </div>
      <div className="oe-v2-mobile-buy"><span>₹{displayedPrice.toLocaleString("en-IN")}</span><div><AddToCartButton product={cartProduct} variant={selectedVariant} disabled={!canAddToCart} quantity={quantity} /></div></div>
    </section>
  );
}
