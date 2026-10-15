import { createAdminClient, createClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";
import { toStorefrontCategory, toStorefrontProduct } from "@/lib/storefrontProduct";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return Response.json(error(400, "Slug is required"));
    }

    const decodedSlug = decodeURIComponent(slug);
    const supabase = createAdminClient();
    const authClient = createClient();
    const { data: { user } } = await authClient.auth.getUser();
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      isAdmin = profile?.is_admin === true;
    }
    // Find product by slug
    let productQuery = supabase.from("products").select("*").eq("slug", decodedSlug);
    if (!isAdmin) productQuery = productQuery.eq("is_active", true);
    const { data: product, error: productError } = await productQuery.single();

    if (productError || !product) {
      return Response.json(error(404, "Product not found"));
    }

    // Get the category
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", product.category_id)
      .single();

    if (categoryError || !category) {
      return Response.json(error(404, "Category not found"));
    }

    return Response.json(success(200, {
      product: isAdmin ? product : toStorefrontProduct({ ...product, category }),
      category: isAdmin ? category : toStorefrontCategory(category),
    }));
  } catch (err) {
    console.error("getProductBySlug error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
