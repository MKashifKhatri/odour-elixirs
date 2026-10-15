import { createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";
import { toStorefrontProduct } from "@/lib/storefrontProduct";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { slug, page = 1, limit = 6 } = await request.json();
    if (typeof slug !== "string" || !slug.trim()) {
      return Response.json(error(400, "Category slug is required"), { status: 400 });
    }

    const supabase = createAdminClient();
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit) || 6)));
    const start = (safePage - 1) * safeLimit;

    const { data: products, count: total, error: fetchError } = await supabase
      .from("products")
      .select("*, category:categories!inner(*)", { count: "exact" })
      .eq("category.slug", slug.trim())
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(start, start + safeLimit - 1);

    if (fetchError) {
      console.error("Error fetching products:", fetchError);
      return Response.json(error(500, "Something went wrong"));
    }

    return Response.json(
      success(200, {
        products: (products || []).map((product) => toStorefrontProduct(product)),
        total: total || 0,
        page: safePage,
        limit: safeLimit,
      })
    );
  } catch (err) {
    console.error("getProductByCategorySlug error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
