import { createClient, createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";
import { toStorefrontProduct } from "@/lib/storefrontProduct";
import { normalizeProductVariants, productVariantsSchema } from "@/lib/productVariants";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const authClient = createClient();
    const { data: { user } } = await authClient.auth.getUser();
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      isAdmin = profile?.is_admin === true;
    }
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = supabase.from("products").select("*, category:categories(*)");

    if (!isAdmin) query = query.eq("is_active", true);

    if (search) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data: products, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching products:", fetchError);
      return Response.json(error(500, "Something went wrong"));
    }

    const visibleProducts = isAdmin ? products : (products || []).map((product) => toStorefrontProduct(product));

    if (search) return Response.json(success(200, { products: visibleProducts }));

    return Response.json(success(200, visibleProducts));
  } catch (err) {
    console.error("Product GET error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Unauthorized | Token expired"));

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return Response.json(error(401, "You are not authorized to perform this action"));
    }

    const {
      name, description, image, categoryId, featured,
      price, quantity, slug, images,
      size, fabric, color, weight, brand, subcategory, sizes,
      compare_at_price, compareAtPrice, specs, warranty, variants,
    } = await request.json();

    const normalizedVariants = normalizeProductVariants(variants, { selling_price: Number(price) || 0, stock_quantity: Number(quantity) || 0 });
    const variantValidation = productVariantsSchema.safeParse(normalizedVariants);
    if (!variantValidation.success) {
      return Response.json(error(400, variantValidation.error.issues[0]?.message || "Please check the product variants."), { status: 400 });
    }
    const hasVariants = normalizedVariants.length > 0;
    const basePrice = hasVariants ? Math.min(...normalizedVariants.filter((variant) => variant.is_active).map((variant) => Number(variant.selling_price))) : Number(price);
    const totalStock = hasVariants ? normalizedVariants.reduce((sum, variant) => sum + Number(variant.stock_quantity), 0) : Number(quantity);
    const baseCost = hasVariants ? Math.min(...normalizedVariants.map((variant) => Number(variant.cost_price))) : 0;

    if (!name || !description || !image || !categoryId || !Number.isFinite(basePrice) || basePrice <= 0 || !Number.isInteger(totalStock) || totalStock < 0 || !slug || !Array.isArray(images) || (Array.isArray(variants) && variants.length === 0)) {
      return Response.json(error(400, "Please enter all required fields"));
    }

    // Check existing product name
    const { data: existProduct } = await adminSupabase
      .from("products")
      .select("id")
      .eq("name", name)
      .single();

    if (existProduct) {
      return Response.json(error(403, "Product Name Already Taken"));
    }

    // Verify category exists
    const { data: category } = await adminSupabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .single();

    if (!category) {
      return Response.json(error(404, "Category Not Found"));
    }

    const { data: newProduct, error: insertError } = await adminSupabase
      .from("products")
      .insert({
        name,
        description,
        image,
        category_id: categoryId,
        featured: featured || false,
        price: basePrice,
        cost_price: baseCost,
        quantity: totalStock,
        slug,
        images: images || [],
        brand: brand || null,
        subcategory: subcategory || null,
        sizes: hasVariants ? normalizedVariants.map((variant) => variant.size) : Array.isArray(sizes) ? sizes : (typeof size === "string" ? size.split(/[ ,]+/).filter(Boolean) : []),
        compare_at_price: compare_at_price ?? compareAtPrice ?? null,
        specs: specs && typeof specs === "object" && !Array.isArray(specs) ? specs : {},
        warranty: warranty || null,
        variants: normalizedVariants,
        ...(hasVariants ? { size: normalizedVariants[0].size } : size && { size }),
        ...(fabric && { fabric }),
        ...(color && { color }),
        ...(weight && { weight }),
      })
      .select("*, category:categories(*)")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return Response.json(error(500, "Something went wrong"));
    }

    return Response.json(
      success(200, { newProduct, message: "Product Added Successfully" })
    );
  } catch (err) {
    console.error("Product POST error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Unauthorized | Token expired"));

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return Response.json(error(401, "You are not authorized to perform this action"));
    }

    const { id } = await request.json();
    if (!id) return Response.json(error(400, "Without ID we can't delete product"));

    const { data: product, error: fetchError } = await adminSupabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !product) {
      return Response.json(error(404, "Product Not Found"));
    }

    await adminSupabase.from("products").delete().eq("id", id);

    return Response.json(
      success(200, { product, message: "Product Deleted Successfully" })
    );
  } catch (err) {
    console.error("Product DELETE error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Unauthorized | Token expired"));

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return Response.json(error(401, "You are not authorized to perform this action"));
    }

    const payload = await request.json();
    const {
      id, name, description, image, categoryId, category_id, featured,
      price, quantity, slug, images, size, fabric, color, weight,
      brand, subcategory, sizes, compare_at_price, compareAtPrice, specs, warranty, variants,
    } = payload;

    const resolvedCategoryId = categoryId ?? category_id;

    const productId = id;
    if (!productId) return Response.json(error(400, "product ID is required"));

    const { data: product, error: fetchError } = await adminSupabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      return Response.json(error(404, "product Not Found"));
    }

    // Check for name uniqueness if name is being changed
    if (name && name !== product.name) {
      const { data: existProduct } = await adminSupabase
        .from("products")
        .select("id")
        .eq("name", name)
        .single();

      if (existProduct) {
        return Response.json(error(403, "Product Name Already Taken"));
      }
    }

    const updates: Record<string, any> = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (image) updates.image = image;
    if (price !== undefined) updates.price = price;
    if (quantity !== undefined) updates.quantity = quantity;
    if (slug) updates.slug = slug;
    if (size) updates.size = size;
    if (fabric) updates.fabric = fabric;
    if (weight) updates.weight = weight;
    if (brand !== undefined) updates.brand = brand || null;
    if (subcategory !== undefined) updates.subcategory = subcategory || null;
    if (sizes !== undefined) updates.sizes = Array.isArray(sizes) ? sizes : [];
    else if (size !== undefined) updates.sizes = typeof size === "string" ? size.split(/[ ,]+/).filter(Boolean) : [];
    if (compare_at_price !== undefined || compareAtPrice !== undefined) updates.compare_at_price = compare_at_price ?? compareAtPrice ?? null;
    if (specs !== undefined) updates.specs = specs && typeof specs === "object" && !Array.isArray(specs) ? specs : {};
    if (warranty !== undefined) updates.warranty = warranty || null;
    if (variants !== undefined) {
      if (!Array.isArray(variants)) return Response.json(error(400, "Variants must be a list."), { status: 400 });
      const normalizedVariants = normalizeProductVariants(variants, { cost_price: Number((product as { cost_price?: number }).cost_price) || 0, selling_price: Number(product.price) || 0, stock_quantity: Number(product.quantity) || 0 });
      const variantValidation = productVariantsSchema.safeParse(normalizedVariants);
      if (!variantValidation.success) {
        return Response.json(error(400, variantValidation.error.issues[0]?.message || "Please check the product variants."), { status: 400 });
      }
      updates.variants = normalizedVariants;
      updates.quantity = normalizedVariants.reduce((sum, variant) => sum + Number(variant.stock_quantity), 0);
      updates.sizes = normalizedVariants.map((variant) => variant.size);
      updates.size = normalizedVariants[0]?.size || null;
      if (normalizedVariants.length) {
        const activePrices = normalizedVariants.filter((variant) => variant.is_active).map((variant) => Number(variant.selling_price));
        if (activePrices.length) updates.price = Math.min(...activePrices);
        updates.cost_price = Math.min(...normalizedVariants.map((variant) => Number(variant.cost_price)));
      }
    }
    if (featured !== undefined) updates.featured = featured;
    if (resolvedCategoryId) updates.category_id = resolvedCategoryId;

    if (color) {
      if (Array.isArray(color)) {
        updates.color = color;
      } else if (typeof color === "string") {
        updates.color = [...(product.color || []), color];
      }
    }

    if (images) {
      if (Array.isArray(images)) {
        updates.images = images;
      } else if (typeof images === "string") {
        updates.images = [...(product.images || []), images];
      }
    }

    const { data: updatedProduct, error: updateError } = await adminSupabase
      .from("products")
      .update(updates as any)
      .eq("id", productId)
      .select("*, category:categories(*)")
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return Response.json(error(500, "Something went wrong"));
    }

    return Response.json(
      success(200, { product: updatedProduct, message: "Product Updated Successfully" })
    );
  } catch (err) {
    console.error("Product PUT error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
