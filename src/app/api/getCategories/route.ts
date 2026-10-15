import { createAdminClient } from "@/lib/supabase/server";
import { success, error as apiError } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    const { data: allCategory, error: fetchError } = await supabase
      .from("categories")
      .select("*");

    if (fetchError) {
      console.error("Error fetching categories:", fetchError);
      return Response.json(apiError(500, "Something went wrong"));
    }

    return Response.json(success(200, { allCategory }));
  } catch (err) {
    console.error("getCategories error:", err);
    return Response.json(apiError(500, "Something went wrong"));
  }
}
