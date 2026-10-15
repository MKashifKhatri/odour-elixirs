import type { Metadata } from "next";
import ProductCatalog from "@/components/ProductCatalog";

export const metadata: Metadata = {
  title: "Shop Perfumes & Fine Fragrances",
  description: "Explore the Odour Elixirs fragrance collection. Discover warm woods, fresh citrus and expressive floral scents, then order directly on WhatsApp.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() { return <ProductCatalog />; }
