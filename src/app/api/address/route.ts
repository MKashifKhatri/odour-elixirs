import { createClient, createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";

// Fetch address of authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Token Expired"), { status: 401 });

    const adminSupabase = createAdminClient();
    const { data: addresses, error: fetchError } = await adminSupabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("Error fetching addresses:", fetchError);
      return Response.json(error(500, "Something went wrong"));
    }

    return Response.json(success(200, addresses));
  } catch (err) {
    console.error("Address GET error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Token Expired"), { status: 401 });

    const data = await request.json();
    const adminSupabase = createAdminClient();

    // Check if user already has an address
    const { data: existingAddress } = await adminSupabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existingAddress) {
      // Update existing address
      const { data: updatedAddress, error: updateError } = await adminSupabase
        .from("addresses")
        .update({
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          zip_code: data.zipCode || data.zip_code,
          phone_number: data.phoneNumber || data.phone_number,
          is_default: data.is_default ?? existingAddress.is_default,
        })
        .eq("id", existingAddress.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        return Response.json(error(500, "Something went wrong"));
      }

      return Response.json(
        success(200, { updatedAddress, message: "Address updated successfully" })
      );
    } else {
      // Create new address
      const { data: newAddress, error: insertError } = await adminSupabase
        .from("addresses")
        .insert({
          user_id: user.id,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          zip_code: data.zipCode || data.zip_code,
          phone_number: data.phoneNumber || data.phone_number,
          is_default: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return Response.json(error(500, "Something went wrong"));
      }

      return Response.json(
        success(200, { newAddress, message: "Address added successfully" })
      );
    }
  } catch (err) {
    console.error("Address POST error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Token Expired"), { status: 401 });

    const { id } = await request.json();
    if (!id) return Response.json(error(400, "Without ID we can't delete address"));

    const adminSupabase = createAdminClient();
    const { data: address, error: fetchError } = await adminSupabase
      .from("addresses")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !address) {
      return Response.json(error(404, "Address Not Found"));
    }

    await adminSupabase.from("addresses").delete().eq("id", id);

    return Response.json(
      success(200, { address, message: "Address Deleted Successfully" })
    );
  } catch (err) {
    console.error("Address DELETE error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Token Expired"), { status: 401 });

    const data = await request.json();
    const id = data.id;

    const adminSupabase = createAdminClient();

    const updates: Record<string, any> = {};
    if (data.address) updates.address = data.address;
    if (data.city) updates.city = data.city;
    if (data.state) updates.state = data.state;
    if (data.country) updates.country = data.country;
    if (data.zipCode || data.zip_code) updates.zip_code = data.zipCode || data.zip_code;
    if (data.phoneNumber || data.phone_number) updates.phone_number = data.phoneNumber || data.phone_number;
    if (data.is_default !== undefined) updates.is_default = data.is_default;

    const { data: address, error: updateError } = await adminSupabase
      .from("addresses")
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return Response.json(error(500, "Something went wrong"));
    }

    return Response.json(
      success(200, { address, message: "Address Has been Updated Successfully" })
    );
  } catch (err) {
    console.error("Address PUT error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
