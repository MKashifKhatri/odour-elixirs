const publicProductFields = [
  "id",
  "category_id",
  "name",
  "slug",
  "image",
  "images",
  "size",
  "fabric",
  "color",
  "weight",
  "brand",
  "subcategory",
  "sizes",
  "compare_at_price",
  "specs",
  "fragrance_notes",
  "concentration",
  "longevity",
  "warranty",
  "price",
  "description",
  "featured",
  "is_active",
] as const;

const publicCategoryFields = ["id", "name", "slug", "description", "featured", "image"] as const;

type RecordValue = Record<string, unknown>;

function pickFields(record: RecordValue, fields: readonly string[]) {
  return Object.fromEntries(fields.filter((field) => field in record).map((field) => [field, record[field]]));
}

export function toStorefrontCategory(category: unknown) {
  if (!category || typeof category !== "object" || Array.isArray(category)) return category;
  return pickFields(category as RecordValue, publicCategoryFields);
}

export function toStorefrontProduct(product: RecordValue) {
  const variants = Array.isArray(product.variants)
    ? product.variants.filter((variant) => (variant as RecordValue).is_active !== false).map((variant) => {
        const value = variant as RecordValue;
        const availableQuantity = Math.max(0, Number(value.stock_quantity ?? value.stock) || 0);
        return {
          id: value.id,
          size: value.size,
          size_ml: value.size_ml ?? null,
          color: value.color,
          selling_price: Number(value.selling_price ?? value.price ?? product.price) || 0,
          available: availableQuantity > 0,
          available_quantity: availableQuantity,
        };
      })
    : [];
  const hasVariantData = Array.isArray(product.variants) && product.variants.length > 0;
  const startingVariant = [...variants].sort((left, right) => left.selling_price - right.selling_price)[0];
  const legacyAvailableQuantity = Math.max(0, Number(product.quantity ?? product.stock ?? 0) || 0);

  return {
    ...pickFields(product, publicProductFields),
    size: startingVariant?.size ?? product.size ?? null,
    sizes: Array.from(new Set(variants.map((variant) => variant.size))),
    price: startingVariant?.selling_price ?? (Number(product.price) || 0),
    available: hasVariantData ? variants.some((variant) => variant.available) : legacyAvailableQuantity > 0,
    available_quantity: hasVariantData ? variants.reduce((sum, variant) => sum + variant.available_quantity, 0) : legacyAvailableQuantity,
    variants,
    ...(product.category ? { category: toStorefrontCategory(product.category) } : {}),
  };
}