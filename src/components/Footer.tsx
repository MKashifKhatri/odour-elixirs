"use client";
import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import { useStorefrontContent } from "@/lib/useStorefrontContent";
import NewsletterForm from "@/components/NewsletterForm";

export default function Footer() {
  const content = useStorefrontContent();
  const whatsappHref = `https://wa.me/${(content.whatsappNumber || WHATSAPP_NUMBER).replace(/\D/g, "")}`;
  return <footer className="brand-footer"><div className="brand-container">
    {content.showNewsletter && <NewsletterForm eyebrow={content.newsletterEyebrow} title={content.newsletterTitle} buttonLabel={content.newsletterButtonLabel} />}
    <div className="brand-footer-intro"><Link href="/" aria-label={`${SITE_NAME} home`} className="brand-logo"><Image src="/brand/oe-black.svg" alt="" width={154} height={72} /></Link><p>{content.footerTagline}</p></div>
    <div className="brand-footer-columns">
      <nav aria-label="Footer shop"><h2>Shop</h2><Link href="/products">All fragrances</Link><Link href="/#collection">Featured fragrances</Link><Link href="/#collections">Collections</Link><Link href="/contact">Gifts</Link></nav>
      <nav aria-label="Footer support"><h2>Support</h2><Link href="/contact">Contact</Link><Link href="/orders">Order requests</Link><a href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp<span className="sr-only"> (opens in a new tab)</span></a><Link href="/privacy-policy">Privacy</Link></nav>
      <nav aria-label="Footer account"><h2>Account</h2><Link href="/login">Sign in</Link><Link href="/profile">Account details</Link><Link href="/wishlist">Wishlist</Link><Link href="/cart">Your bag</Link></nav>
      <nav aria-label="Footer company"><h2>Company</h2><Link href="/about">Our house</Link><Link href="/journal">Journal</Link><a href="https://www.instagram.com/odourelixirs/" target="_blank" rel="noreferrer">Instagram<span className="sr-only"> (opens in a new tab)</span></a></nav>
    </div>
    <div className="brand-footer-legal"><small>© {new Date().getFullYear()} {SITE_NAME}</small><small>Fragrance for your own kind of presence.</small><Link href="/privacy-policy">Privacy</Link></div>
  </div></footer>;
}
