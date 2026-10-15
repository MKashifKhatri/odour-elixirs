import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { ArrowRight, ArrowUpRight, Heart, MessageCircle, Sparkles } from "lucide-react";
import FeaturedScents from "@/components/FeaturedScents";
import FragranceFamilies from "@/components/FragranceFamilies";
import ProductVisual from "@/components/ProductVisual";
import Reveal from "@/components/Reveal";
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
  const promises = [Sparkles, Heart, MessageCircle];

  return (
    <div className="oe-lux-home">
      <section className="oe-lux-hero" aria-labelledby="home-title">
        <div className="oe-lux-hero-copy">
          <p className="oe-lux-eyebrow"><span aria-hidden="true" />{content.heroEyebrow}</p>
          <h1 id="home-title">{content.heroTitle}</h1>
          <p className="oe-lux-hero-description">{content.heroDescription}</p>
          <div className="oe-lux-hero-actions">
            <Link className="oe-lux-button" href="/products">{content.primaryCta}<ArrowUpRight size={16} strokeWidth={1.6} /></Link>
            <Link className="oe-lux-secondary-link" href="/about">{content.secondaryCta}<ArrowUpRight size={15} strokeWidth={1.5} /></Link>
          </div>
          {content.announcement.trim() && <div className="oe-lux-hero-note"><MessageCircle size={14} strokeWidth={1.5} /><span>{content.announcement}</span></div>}
        </div>
        <figure className="oe-lux-hero-photo">
          <ProductVisual src={content.heroImage || "/brand/oe-campaign-hero.jpg"} alt="Amber fragrance on a sunlit limestone plinth" name="Odour Elixirs" priority sizes="(max-width: 760px) 100vw, 65vw" />
          <figcaption><span>OD / ELIXIRS</span><span>THE HOUSE CAMPAIGN · 01</span></figcaption>
        </figure>
        <span className="oe-lux-hero-index" aria-hidden="true">O / E</span>
      </section>

      {content.houseStats.length > 0 && <Reveal className="oe-lux-promises">
        {content.houseStats.slice(0, 3).map((stat, index) => {
          const Icon = promises[index] || Sparkles;
          return <article key={`${stat.value}-${index}`}><Icon size={18} strokeWidth={1.35} /><div><span>{stat.value}</span><p>{stat.label}</p></div></article>;
        })}
      </Reveal>}

      <FeaturedScents eyebrow={content.collectionEyebrow} title={content.collectionTitle} description={content.collectionDescription} />

      {content.showStory && <section className="oe-lux-story" aria-labelledby="house-story-title">
        <Reveal className="oe-lux-story-heading"><p className="oe-lux-eyebrow"><span aria-hidden="true" />{content.storyEyebrow}</p><h2 id="house-story-title">{content.storyTitle}</h2></Reveal>
        <Reveal className="oe-lux-story-copy" delay={0.1}><p>{content.storyDescription}</p><div><span>{content.storyCardOne}</span><span>{content.storyCardTwo}</span></div><Link href="/about" className="oe-lux-text-link">{content.storyLinkLabel}<ArrowRight size={16} strokeWidth={1.4} /></Link></Reveal>
        <figure className="oe-lux-story-photo"><ProductVisual src={content.storyImage || content.heroImage} alt="A detail from the Odour Elixirs fragrance house" name="Odour Elixirs" sizes="(max-width: 760px) 100vw, 45vw" /></figure>
      </section>}

      <section className="oe-lux-statement" aria-label="Brand statement"><p>THE ART OF</p><h2>LEAVING A TRACE.</h2><span>Odour Elixirs · Fragrance for your own kind of presence</span></section>

      {content.showDiscovery && <FragranceFamilies eyebrow={content.discoveryEyebrow} title={content.discoveryTitle} />}

      {content.showBrandPoints && <section className="oe-lux-values"><div><p className="oe-lux-eyebrow"><span aria-hidden="true" />{content.brandPointsEyebrow}</p><h2>{content.brandPointsTitle}</h2></div><div>{content.brandPoints.slice(0, 3).map((point, index) => <article key={`${point.title}-${index}`}><span>0{index + 1}</span><h3>{point.title}</h3><p>{point.description}</p></article>)}</div></section>}

      {content.showCraft && <section className="oe-lux-craft"><div className="oe-lux-craft-intro"><p className="oe-lux-eyebrow"><span aria-hidden="true" />{content.craftEyebrow}</p><h2>{content.craftTitle}</h2><p>{content.craftDescription}</p></div><div>{content.craftSteps.slice(0, 4).map((step, index) => <article key={`${step.number}-${index}`}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></article>)}</div></section>}

      {content.showTestimonials && content.testimonials.length > 0 && <section className="oe-lux-testimonials"><div><p className="oe-lux-eyebrow"><span aria-hidden="true" />{content.testimonialEyebrow}</p><h2>{content.testimonialTitle}</h2></div><div>{content.testimonials.slice(0, 3).map((item, index) => <figure key={`${item.name}-${index}`}><blockquote>“{item.quote}”</blockquote><figcaption>{item.name}{item.location && <span>{item.location}</span>}</figcaption></figure>)}</div></section>}

      {content.showFaq && content.faq.length > 0 && <section className="oe-lux-faq" id="faq">
        <Reveal className="oe-lux-faq-heading"><p className="oe-lux-eyebrow"><span aria-hidden="true" />A little clarity</p><h2>{content.faqTitle}</h2><p>Good fragrance begins with the right questions.</p><a href={whatsappUrl} target="_blank" rel="noreferrer">{content.faqActionLabel}<ArrowUpRight size={15} /></a></Reveal>
        <div className="oe-lux-faq-list">{content.faq.slice(0, 4).map((item, index) => <details key={`${item.question}-${index}`}><summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong><i aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div>
      </section>}

      {content.showClosingCta && <section className="oe-lux-contact"><div><Sparkles size={19} strokeWidth={1.3} /><p className="oe-lux-eyebrow">A personal recommendation</p><h2>{content.ctaTitle}</h2><p>{content.ctaDescription}</p></div><a href={whatsappUrl} target="_blank" rel="noreferrer">{content.ctaButtonLabel}<ArrowUpRight size={16} /></a></section>}

    </div>
  );
}
