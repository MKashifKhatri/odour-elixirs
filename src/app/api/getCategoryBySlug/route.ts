import { createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return Response.json(error(400, "Slug is required"));
    }

    const decodedSlug = decodeURIComponent(slug);
    const supabase = createAdminClient();

    // Find category by slug
    const { data: category, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", decodedSlug)
      .single();

    if (fetchError || !category) {
      return Response.json(error(404, "Category not found"));
    }

    // Count products in this category
    const { count: productCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", category.id);

    return Response.json(success(200, { category, productCount: productCount || 0 }));
  } catch (err) {
    console.error("Error fetching category by slug:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
