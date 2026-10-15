import type { Product, ProductVariant } from "@/lib/types";
export function variantStock(product: Product, variant?: ProductVariant): number {
  const value = Number(variant ? variant.available_quantity ?? variant.stock_quantity ?? variant.stock ?? 0 : product.available_quantity ?? product.quantity ?? product.stock ?? 0);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
export function isVariantAvailable(product: Product, variant?: ProductVariant): boolean {
  if (!variant && product.variants?.length) return false;
  return product.is_active && product.available !== false && variant?.is_active !== false && variant?.available !== false && variantStock(product, variant) > 0;
}
export function preferredVariant(product: Product, size?: string): ProductVariant | undefined {
  const variants = (product.variants || []).filter(v => v.is_active !== false && (!size || v.size === size));
  return variants.find(v => isVariantAvailable(product, v)) || variants[0];
}
