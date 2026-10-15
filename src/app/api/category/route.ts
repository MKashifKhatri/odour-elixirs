import { createClient, createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = supabase.from("categories").select("*");

    if (search) {
      query = query.ilike("name", `${search}%`);
    }

    const { data: categories, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching categories:", fetchError);
      return Response.json(error(500, "Something went wrong"));
    }

    if (search) {
      return Response.json(success(200, categories));
    }

    return Response.json(success(200, { allCategory: categories }));
  } catch (err) {
    console.error("Category GET error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Token Expired"), { status: 401 });

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return Response.json(error(401, "Your not Admin"), { status: 401 });
    }

    const { name, description, image, slug, featured } = await request.json();

    if (!name || !description || !image || !slug) {
      return Response.json(error(400, "Please enter all fields"));
    }

    // Check existing
    const { data: existing } = await adminSupabase
      .from("categories")
      .select("id")
      .eq("name", name)
      .single();

    if (existing) {
      return Response.json(error(403, "Category Name Already Taken"));
    }

    const { data: newCategory, error: insertError } = await adminSupabase
      .from("categories")
      .insert({ name, description, image, slug, featured: featured || false })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return Response.json(error(500, "Something went wrong"));
    }

    return Response.json(
      success(200, { newCategory, message: "Category Added Successfully" })
    );
  } catch (err) {
    console.error("Category POST error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Token Expired"), { status: 401 });

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return Response.json(error(401, "Your not Admin"), { status: 401 });
    }

    const { id } = await request.json();
    if (!id) return Response.json(error(400, "Without ID we can't delete category"));

    const { data: category, error: fetchError } = await adminSupabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !category) {
      return Response.json(error(404, "Category Not Found"));
    }

    await adminSupabase.from("categories").delete().eq("id", id);

    return Response.json(
      success(200, { category, message: "Category Deleted Successfully" })
    );
  } catch (err) {
    console.error("Category DELETE error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Token Expired"), { status: 401 });

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return Response.json(error(401, "Your not Admin"), { status: 401 });
    }

    const { id, name, description, image, slug, featured } = await request.json();
    // Support both id and _id for backward compatibility
    const categoryId = id;

    if (!categoryId) {
      return Response.json(error(400, "category ID is required"));
    }

    const { data: category, error: fetchError } = await adminSupabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .single();

    if (fetchError || !category) {
      return Response.json(error(404, "Category Not Found"));
    }

    const updates: Record<string, any> = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (image) updates.image = image;
    if (slug) updates.slug = slug;
    if (featured !== undefined) updates.featured = featured;

    const { data: updatedCategory, error: updateError } = await adminSupabase
      .from("categories")
      .update(updates as any)
      .eq("id", categoryId)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return Response.json(error(500, "Something went wrong"));
    }

    return Response.json(
      success(200, { category: updatedCategory, message: "Category Updated Successfully" })
    );
  } catch (err) {
    console.error("Category PUT error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
