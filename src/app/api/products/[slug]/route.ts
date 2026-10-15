import { createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";
import { toStorefrontProduct } from "@/lib/storefrontProduct";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createAdminClient();

    // Find category by slug
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.slug)
      .single();

    if (!category) {
      return Response.json(success(200, []));
    }

    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("category_id", category.id)
      .eq("is_active", true);

    if (fetchError) {
      console.error("Error fetching products:", fetchError);
      return Response.json(error(500, "Something went wrong"));
    }

    return Response.json(success(200, (products || []).map((product) => toStorefrontProduct(product))));
  } catch (err) {
    console.error("Products by slug error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
