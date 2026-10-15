import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const subscriptionSchema = z.object({ email: z.string().trim().email().max(254) });

export async function POST(request: NextRequest) {
  const parsed = subscriptionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ success: false, message: "Email sign-up is not connected yet. Please contact us on WhatsApp." }, { status: 503 });
  }

  try {
    const supabase = createAdminClient() as any;
    const { error } = await supabase.from("newsletter_subscribers").upsert(
      { email: parsed.data.email.toLowerCase() },
      { onConflict: "email", ignoreDuplicates: true },
    );
    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205") {
        return NextResponse.json({ success: false, message: "Email sign-up is being set up. Please contact us on WhatsApp for now." }, { status: 503 });
      }
      throw error;
    }
    return NextResponse.json({ success: true, message: "You’re on the list. Look out for a note from the house." });
  } catch (error) {
    console.error("Newsletter subscription failed:", error);
    return NextResponse.json({ success: false, message: "We could not add your email just now. Please try again later." }, { status: 500 });
  }
}
