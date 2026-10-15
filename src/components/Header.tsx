"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import CartSheet from "@/components/cart/CartSheet";
import MenuSheet from "@/components/MenuSheet";
import SearchSheet from "@/components/SearchSheet";
import { SITE_NAME } from "@/lib/constants";
import { storefrontLinks } from "@/lib/navigation";

export default function Header() {
  const categories = useSelector((state: RootState) => state.user.allCategories);
  const pathname = usePathname();
  return <header className="brand-header">
    <a className="brand-skip" href="#main-content">Skip to content</a>
    <nav aria-label="Main navigation" className="brand-nav brand-container">
      <Link href="/" aria-label={`${SITE_NAME} home`} className="brand-logo"><Image src="/brand/oe-black.svg" alt="" width={138} height={66} priority /></Link>
      <ul className="brand-desktop-links">{storefrontLinks.map((link) => <li key={link.label}><Link href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link></li>)}</ul>
      <div className="brand-nav-actions"><SearchSheet /><CartSheet /><div className="brand-mobile-toggle"><MenuSheet categories={categories || []} /></div></div>
    </nav>
  </header>;
}
