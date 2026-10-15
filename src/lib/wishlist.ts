import type { Product } from "@/lib/types";

export type WishlistItem = Pick<Product, "id" | "category_id" | "name" | "slug" | "image" | "images" | "size" | "brand" | "subcategory" | "sizes" | "color" | "specs" | "price" | "description" | "featured" | "is_active" | "category" | "available">;

const wishlistKey = "oe_wishlist_v1";
export const wishlistEvent = "oe:wishlist-change";

export function readWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(wishlistKey) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeWishlist(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(wishlistKey, JSON.stringify(items));
  window.dispatchEvent(new Event(wishlistEvent));
}