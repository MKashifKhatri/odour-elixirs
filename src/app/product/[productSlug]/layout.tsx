import type { Metadata } from "next";
import { demoProducts } from "@/lib/demoCatalog";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: { productSlug: string } }): Promise<Metadata> {
  let product = demoProducts.find((item) => item.slug === params.productSlug);
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const db = createAdminClient() as any;
      const { data } = await db.from("products").select("name,description,image").eq("slug", params.productSlug).maybeSingle();
      if (data) product = { ...product, ...data } as typeof product;
    } catch { /* Keep the local preview product metadata. */ }
  }
  if (!product) return { title: "Fragrance", description: `Discover the fragrance collection from ${SITE_NAME}.` };
  const title = `${product.name} | ${SITE_NAME}`;
  return { title: { absolute: title }, description: product.description, alternates: { canonical: `${SITE_URL.replace(/\/$/, "")}/product/${params.productSlug}` }, openGraph: { type: "website", title, description: product.description, images: product.image ? [product.image] : [] } };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) { return children; }
