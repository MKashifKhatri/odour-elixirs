import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { defaultSiteContent } from "@/lib/siteContent";

const contentSchema = z.object({
  seoTitle: z.string().max(180), seoDescription: z.string().max(320),
  aboutEyebrow: z.string().max(120), aboutTitle: z.string().max(180), aboutTitleAccent: z.string().max(180), aboutDescription: z.string().max(1000), aboutCta: z.string().max(80),
  aboutValueOneTitle: z.string().max(120), aboutValueOneText: z.string().max(500), aboutValueTwoTitle: z.string().max(120), aboutValueTwoText: z.string().max(500), aboutValueThreeTitle: z.string().max(120), aboutValueThreeText: z.string().max(500),
  productsEyebrow: z.string().max(120), productsTitle: z.string().max(180), productsDescription: z.string().max(500),
  contactEyebrow: z.string().max(120), contactTitle: z.string().max(180), contactDescription: z.string().max(500), contactButtonLabel: z.string().max(100), contactCardEyebrow: z.string().max(120), businessAddress: z.string().max(240),
  heroEyebrow: z.string().max(120), heroTitle: z.string().min(5).max(160), heroDescription: z.string().max(500),
  heroImage: z.string().max(500), primaryCta: z.string().max(80), secondaryCta: z.string().max(80), announcement: z.string().max(180), collectionEyebrow: z.string().max(120), collectionTitle: z.string().max(160), collectionDescription: z.string().max(500), storyEyebrow: z.string().max(120), storyTitle: z.string().max(160), storyDescription: z.string().max(1000), storyImage: z.string().max(500), storyCardOne: z.string().max(180), storyCardTwo: z.string().max(180), brandPointsEyebrow: z.string().max(120), brandPointsTitle: z.string().max(160), testimonialEyebrow: z.string().max(120), helpTitle: z.string().max(160), helpDescription: z.string().max(500), footerTagline: z.string().max(180), testimonialTitle: z.string().max(160), faqEyebrow: z.string().max(120), faqTitle: z.string().max(160), ctaEyebrow: z.string().max(120), ctaTitle: z.string().max(180), ctaDescription: z.string().max(500), ctaButtonLabel: z.string().max(100), faqActionLabel: z.string().max(80), storyLinkLabel: z.string().max(80),
  discoveryEyebrow: z.string().max(120), discoveryTitle: z.string().max(180), craftEyebrow: z.string().max(120), craftTitle: z.string().max(180), craftDescription: z.string().max(500),
  newsletterEyebrow: z.string().max(120), newsletterTitle: z.string().max(180), newsletterButtonLabel: z.string().max(80),
  showStory: z.boolean(), showBrandPoints: z.boolean(), showTestimonials: z.boolean(), showFaq: z.boolean(), showClosingCta: z.boolean(), showDiscovery: z.boolean(), showCraft: z.boolean(), showNewsletter: z.boolean(),
  whatsappNumber: z.string().regex(/^\+?\d{10,15}$/),
  brandPoints: z.array(z.object({ title: z.string().min(2).max(120), description: z.string().min(3).max(500) })).max(6),
  houseStats: z.array(z.object({ value: z.string().min(1).max(16), label: z.string().min(2).max(80) })).max(4),
  craftSteps: z.array(z.object({ number: z.string().min(1).max(8), title: z.string().min(2).max(80), description: z.string().min(3).max(500) })).max(6),
  faq: z.array(z.object({ question: z.string().min(3).max(200), answer: z.string().min(3).max(1200) })).max(20),
  testimonials: z.array(z.object({ name: z.string().min(2).max(100), location: z.string().max(100), quote: z.string().min(5).max(1200) })).max(20),
});

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ success: true, content: defaultSiteContent });
  try {
    const supabase = createClient() as any;
    const { data } = await supabase.from("site_content").select("content").eq("id", "storefront").maybeSingle();
    return NextResponse.json({ success: true, content: { ...defaultSiteContent, ...(data?.content || {}) } });
  } catch {
    return NextResponse.json({ success: true, content: defaultSiteContent });
  }
}

export async function PUT(request: NextRequest) {
  const parsed = contentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Please review the content fields." }, { status: 400 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ success: false, message: "Supabase is not connected yet." }, { status: 503 });
  try {
    const session = createClient();
    const { data: { user } } = await session.auth.getUser();
    if (!user) return NextResponse.json({ success: false, message: "Sign in as an admin first." }, { status: 401 });
    const admin = createAdminClient() as any;
    const { data: profile } = await admin.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    if (!profile?.is_admin) return NextResponse.json({ success: false, message: "Admin access is required." }, { status: 403 });
    const content = { ...parsed.data, whatsappNumber: parsed.data.whatsappNumber.replace(/\D/g, "") };
    const { error } = await admin.from("site_content").upsert({ id: "storefront", content, updated_at: new Date().toISOString() });
    if (error) throw error;
    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Site content update failed:", error);
    return NextResponse.json({ success: false, message: "Could not publish storefront content." }, { status: 500 });
  }
}
