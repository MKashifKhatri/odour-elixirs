import type { Metadata } from "next";
import { MessageCircle, MapPin, ArrowUpRight } from "lucide-react";
import { SITE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/server";
import { defaultSiteContent } from "@/lib/siteContent";

export const metadata: Metadata = { title: "Contact", description: "Talk with Odour Elixirs for fragrance guidance and order support." };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  let number = WHATSAPP_NUMBER;
  let content = defaultSiteContent;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createAdminClient() as any;
      const { data } = await supabase.from("site_content").select("content").eq("id", "storefront").maybeSingle();
      content = { ...defaultSiteContent, ...(data?.content || {}) };
      number = String(content.whatsappNumber || defaultSiteContent.whatsappNumber).replace(/\D/g, "");
    } catch { /* Use the configured public business number. */ }
  }
  const wa = `https://wa.me/${number}?text=${encodeURIComponent("Hello Odour Elixirs, I have a question.")}`;
  const formattedNumber = number.startsWith("91") ? "+91 " + number.slice(2) : "+" + number;
  return <div className="oe-store-page oe-contact-page"><section className="oe-contact-copy"><p className="oe-micro-label oe-micro-label-dark"><span />{content.contactEyebrow}</p><h1>{content.contactTitle}</h1><p>{content.contactDescription}</p><a href={wa} target="_blank" rel="noreferrer"><MessageCircle size={15} />{content.contactButtonLabel}<ArrowUpRight size={15} /></a></section><aside className="oe-contact-details"><p className="oe-micro-label oe-micro-label-dark"><span />{content.contactCardEyebrow}</p><h2>{SITE_NAME}</h2><p><MapPin size={15} />{content.businessAddress}</p><a href={wa} target="_blank" rel="noreferrer">WhatsApp <span>{formattedNumber}</span><ArrowUpRight size={14} /></a></aside></div>;
}
