"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import { useStorefrontContent } from "@/lib/useStorefrontContent";
import NewsletterForm from "@/components/NewsletterForm";
import BrandLogo from "@/components/BrandLogo";
export default function Footer() {
 const content = useStorefrontContent();
 const whatsappHref = `https://wa.me/${(content.whatsappNumber || WHATSAPP_NUMBER).replace(/\D/g, "")}`;
 return <footer className="brand-footer"><div className="brand-container">
  {content.showNewsletter && <NewsletterForm eyebrow={content.newsletterEyebrow} title={content.newsletterTitle} buttonLabel={content.newsletterButtonLabel}/>}
  <div className="brand-footer-intro"><Link href="/" aria-label={`${SITE_NAME} home`} className="brand-logo"><BrandLogo /></Link><p>{content.footerTagline}</p></div>
  <div className="brand-footer-columns"><nav aria-label="Explore"><h2>Explore</h2><Link href="/products">The collection</Link><Link href="/#collections">Fragrance discovery</Link><Link href="/about">The house</Link><Link href="/journal">Journal</Link></nav><nav aria-label="Customer care"><h2>Customer care</h2><Link href="/profile">Your account</Link><Link href="/orders">Order requests</Link><Link href="/wishlist">Saved fragrances</Link><Link href="/#faq">Questions & answers</Link></nav><nav aria-label="Contact"><h2>Let’s talk</h2><a href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={14}/></a><Link href="/contact">Contact the house</Link><a href="https://www.instagram.com/odourelixirs/" target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={14}/></a></nav></div>
  <div className="brand-footer-legal"><small>© {new Date().getFullYear()} {SITE_NAME}</small><small>Fragrance for your own kind of presence.</small><Link href="/privacy-policy">Privacy policy</Link></div>
 </div></footer>;
}
