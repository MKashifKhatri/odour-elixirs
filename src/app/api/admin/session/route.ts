import { NextResponse } from "next/server";
import { requireAdmin } from "@/helpers/requireUser";

export async function GET() {
  const profile = await requireAdmin();
  return NextResponse.json({ authenticated: Boolean(profile), name: profile?.name || "" }, { status: profile ? 200 : 401 });
}
