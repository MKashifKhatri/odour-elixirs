import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { ArrowUpRight } from "lucide-react";
import FeaturedScents from "@/components/FeaturedScents";
import FragranceFamilies from "@/components/FragranceFamilies";
import HomeFaq from "@/components/HomeFaq";
import ProductVisual from "@/components/ProductVisual";

import { createAdminClient } from "@/lib/supabase/server";
import { defaultSiteContent, type SiteContent } from "@/lib/siteContent";

export const dynamic = "force-dynamic";

const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return defaultSiteContent;
  try {
    const supabase = createAdminClient() as any;
    const { data } = await supabase.from("site_content").select("content").eq("id", "storefront").maybeSingle();
    return { ...defaultSiteContent, ...(data?.content || {}) };
  } catch {
    return defaultSiteContent;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return { title: { absolute: content.seoTitle }, description: content.seoDescription, openGraph: { title: content.seoTitle, description: content.seoDescription, type: "website" } };
}

export default async function Home() {
  const content = await getSiteContent();
  const whatsappNumber = String(content.whatsappNumber || "919427868790").replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Odour Elixirs, please help me find a fragrance.")}`;
  return <div className="house-home">
    <section className="house-hero" aria-labelledby="home-title">
      <figure className="house-hero-image"><ProductVisual src={content.heroImage || "/brand/oe-campaign-hero.jpg"} alt="Odour Elixirs fragrance, a study in light and amber" name="Odour Elixirs" priority sizes="100vw" /></figure>
      <div className="house-hero-copy"><p className="eyebrow">{content.heroEyebrow}</p><h1 id="home-title">{content.heroTitle}</h1><p>{content.heroDescription}</p><Link href="/products" className="house-button">{content.primaryCta}<ArrowUpRight size={18} /></Link></div>
      <div className="house-hero-caption"><span>ODOUR ELIXIRS</span><span>Fragrance. A personal expression.</span></div>
    </section>
    {content.showDiscovery && <FragranceFamilies eyebrow={content.discoveryEyebrow} title={content.discoveryTitle} />}
    <FeaturedScents eyebrow={content.collectionEyebrow} title={content.collectionTitle} description={content.collectionDescription} />
    {content.showStory && <section className="house-story"><div><p className="eyebrow">{content.storyEyebrow}</p><h2>{content.storyTitle}</h2><p>{content.storyDescription}</p><Link href="/about" className="house-link">{content.storyLinkLabel}<ArrowUpRight size={18} /></Link></div><figure><ProductVisual src={content.storyImage || content.heroImage} alt="A closer look at the house of Odour Elixirs" sizes="(max-width: 760px) 100vw, 45vw" /></figure></section>}
    {content.showTestimonials && content.testimonials.length > 0 && <section className="house-quotes" aria-label={content.testimonialTitle}>{content.testimonials.slice(0, 3).map((item, index) => <figure key={index}><blockquote>“{item.quote}”</blockquote><figcaption>{item.name}{item.location && ' / '+item.location}</figcaption></figure>)}</section>}
    {content.showFaq && content.faq.length > 0 && <HomeFaq items={content.faq} title={content.faqTitle} actionLabel={content.faqActionLabel} whatsappUrl={whatsappUrl} />}
  </div>;
}
