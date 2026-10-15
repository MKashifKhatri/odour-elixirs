"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { ArrowUpRight } from "lucide-react";
import type { RootState } from "@/store/store";
import CartSheet from "@/components/cart/CartSheet";
import MenuSheet from "@/components/MenuSheet";
import SearchSheet from "@/components/SearchSheet";
import { BrandIcon } from "@/components/ui/brand-icons";
import BrandLogo from "@/components/BrandLogo";
import { SITE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import { storefrontLinks } from "@/lib/navigation";
import { useStorefrontContent } from "@/lib/useStorefrontContent";

export default function Header() {
  const content = useStorefrontContent();
  const categories = useSelector((state: RootState) => state.user.allCategories);
  const user = useSelector((state: RootState) => state.user.user);
  const pathname = usePathname();
  const whatsappNumber = (content.whatsappNumber || WHATSAPP_NUMBER).replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Odour Elixirs, please help me find a fragrance.")}`;
  return <header className="brand-header">
    <a className="brand-skip" href="#main-content">Skip to content</a>
    {content.announcement && <a className="brand-announcement" href={whatsappUrl} target="_blank" rel="noreferrer"><span>{content.announcement}</span><span>Talk with us <ArrowUpRight size={13} /></span></a>}
    <nav aria-label="Main navigation" className="brand-nav brand-container">
      <div className="brand-mobile-toggle"><MenuSheet categories={categories || []} /></div><Link href="/" aria-label={`${SITE_NAME} home`} className="brand-logo"><BrandLogo priority /></Link>
      <ul className="brand-desktop-links">{storefrontLinks.map((link) => <li key={link.label}><Link href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link></li>)}</ul>
      <div className="brand-nav-actions"><span className="brand-header-search"><SearchSheet /></span><Link href={user ? "/profile" : "/login"} className="brand-icon-button brand-account-action" aria-label={user ? "Your account" : "Sign in"} title={user ? "Your account" : "Sign in"}><BrandIcon name="user" /></Link><span className="brand-header-bag"><CartSheet /></span></div>
    </nav>
  </header>;
}
