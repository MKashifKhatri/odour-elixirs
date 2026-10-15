"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { readWishlist, wishlistEvent, writeWishlist, type WishlistItem } from "@/lib/wishlist";

export default function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readWishlist());
    sync();
    window.addEventListener(wishlistEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(wishlistEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((product: Product) => {
    const current = readWishlist();
    const next = current.some((item) => item.id === product.id)
      ? current.filter((item) => item.id !== product.id)
      : [...current, {
          id: product.id,
          category_id: product.category_id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          images: product.images,
          size: product.size,
          brand: product.brand,
          subcategory: product.subcategory,
          sizes: product.sizes,
          color: product.color,
          specs: product.specs,
          price: product.price,
          description: product.description,
          featured: product.featured,
          is_active: product.is_active,
          category: product.category,
          available: product.available ?? Number(product.stock ?? product.quantity ?? 0) > 0,
        }];
    writeWishlist(next);
    setItems(next);
  }, []);

  const has = useCallback((productId: string) => items.some((item) => item.id === productId), [items]);
  return { items, has, toggle };
}