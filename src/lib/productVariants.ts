import { z } from "zod";
import type { ProductVariant } from "@/lib/types";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const productVariantSchema = z.object({
  id: z.string().uuid(),
  size: z.string().trim().min(1, "Size is required").max(48),
  size_ml: z.number().positive().nullable(),
  color: z.string().trim().max(80),
  cost_price: z.number().finite().min(0),
  selling_price: z.number().finite().positive(),
  stock_quantity: z.number().int().min(0).max(1000000),
  sku: z.string().trim().max(100),
  is_active: z.boolean(),
});

export const productVariantsSchema = z.array(productVariantSchema).superRefine((variants, context) => {
  const seen = new Set<string>();
  variants.forEach((variant, index) => {
    const sizeKey = variant.size_ml === null ? variant.size.trim().toLowerCase() : String(variant.size_ml);
    const key = `${sizeKey}|${variant.color.trim().toLowerCase()}`;
    if (seen.has(key)) context.addIssue({ code: z.ZodIssueCode.custom, path: [index, "size"], message: "Duplicate size and color variant" });
    seen.add(key);
  });
});

type VariantFallbacks = { cost_price?: number; selling_price?: number; stock_quantity?: number; is_active?: boolean };

export function normalizeProductVariants(input: unknown, fallbacks: VariantFallbacks = {}): ProductVariant[] {
  if (!Array.isArray(input)) return [];
  return input.map((entry) => {
    const variant = entry && typeof entry === "object" ? entry as Record<string, unknown> : {};
    const size = String(variant.size ?? "").trim();
    const suppliedSizeMl = Number(variant.size_ml);
    const parsedSize = size.match(/^\s*(\d+(?:\.\d+)?)\s*(?:ml)?\s*$/i);
    const sizeMl = Number.isFinite(suppliedSizeMl) && suppliedSizeMl > 0 ? suppliedSizeMl : parsedSize ? Number(parsedSize[1]) : null;
    const id = typeof variant.id === "string" && uuidPattern.test(variant.id) ? variant.id : globalThis.crypto.randomUUID();
    const asNumber = (value: unknown, fallback: number) => value === undefined || value === null || value === "" ? fallback : Number(value);

    return {
      id,
      size,
      size_ml: sizeMl,
      color: String(variant.color ?? ""),
      cost_price: asNumber(variant.cost_price, fallbacks.cost_price ?? 0),
      selling_price: asNumber(variant.selling_price ?? variant.price, fallbacks.selling_price ?? 0),
      stock_quantity: asNumber(variant.stock_quantity ?? variant.stock, fallbacks.stock_quantity ?? 0),
      sku: String(variant.sku ?? ""),
      is_active: variant.is_active === undefined ? (fallbacks.is_active ?? true) : variant.is_active === true,
    };
  });
}