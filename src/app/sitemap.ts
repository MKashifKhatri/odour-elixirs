import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL.replace(/\/$/, "");

  // Base static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const supabase = createAdminClient();
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from("products").select("slug, updated_at").limit(100),
      supabase.from("categories").select("slug, updated_at").limit(50),
    ]);

    const productRoutes: MetadataRoute.Sitemap = (productsRes.data || []).map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = (categoriesRes.data || []).map((c) => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (err) {
    console.error("Failed to generate sitemap:", err);
    return staticRoutes;
  }
}

