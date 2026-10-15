"use client";

import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import useWishlist from "@/hooks/useWishlist";

export default function WishlistButton({ product, className = "" }: { product: Product; className?: string }) {
  const { has, toggle } = useWishlist();
  const saved = has(product.id);

  return (
    <button
      type="button"
      className={`oe-wishlist-button ${className}`}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      aria-pressed={saved}
      onClick={() => toggle(product)}
    >
      <Heart aria-hidden="true" size={19} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}