"use client";

import type { Product } from "@/lib/types";
import ScentProductCard from "@/components/ScentProductCard";

export default function ProductCard({ product }: { product: Product }) {
  return <ScentProductCard product={product} />;
}
