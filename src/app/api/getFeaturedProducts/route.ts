import { createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { toStorefrontProduct } from "@/lib/storefrontProduct";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();

    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("featured", true)
      .eq("is_active", true);

    if (fetchError) {
      console.error("Error fetching featured products:", fetchError);
      return Response.json(error(500, "Something went wrong"));
    }

    return Response.json(success(200, (products || []).map((product) => toStorefrontProduct(product))));
  } catch (err) {
    console.error("getFeaturedProducts error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
