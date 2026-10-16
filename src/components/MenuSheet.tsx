"use client";
import type { Category } from "@/lib/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { userNotExist } from "@/store/reducer/userReducer";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrandIcon, MenuIcon } from "@/components/ui/brand-icons";
import BrandLogo from "@/components/BrandLogo";
import { storefrontLinks } from "@/lib/navigation";
import { SITE_NAME } from "@/lib/constants";

export default function MenuSheet({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    // Close the modal when rotating to desktop; do not leave hidden focus traps.
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  const signOut = async () => {
    setSigningOut(true);
    setError("");
    try {
      const { axiosClient } = await import("@/utils/axiosClient");
      const { removeItem, KEY_ACCESS_TOKEN } = await import("@/utils/localStorageManager");
      await axiosClient.get("/logout");
      removeItem(KEY_ACCESS_TOKEN);
      dispatch(userNotExist());
      setOpen(false);
      window.location.href = "/";
    } catch { setError("We couldn’t sign you out. Please try again."); }
    finally { setSigningOut(false); }
  };
  // Radix supplies focus trapping, background isolation, Escape and focus return.
  return <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild><button type="button" className="brand-icon-button" aria-label="Open menu"><MenuIcon open={open} /></button></SheetTrigger>
    <SheetContent side="top" hideClose className="brand-menu-panel" aria-describedby={undefined} onOpenAutoFocus={(event) => { event.preventDefault(); closeRef.current?.focus(); }}>
      <div className="brand-menu-top brand-container"><SheetTitle className="brand-menu-title"><SheetClose asChild><Link href="/" aria-label={`${SITE_NAME} home`} className="brand-menu-brand"><BrandLogo priority /></Link></SheetClose></SheetTitle><SheetClose asChild><button ref={closeRef} type="button" className="brand-icon-button brand-sheet-close" aria-label="Close menu"><BrandIcon name="close" /></button></SheetClose></div>
      <div className="brand-menu-body brand-container">
        <nav aria-label="Mobile navigation"><ul className="brand-menu-links">{storefrontLinks.map((link) => <li key={link.label}><SheetClose asChild><Link href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}<BrandIcon name="chevron" /></Link></SheetClose></li>)}</ul></nav>
        {!!categories.length && <section className="brand-menu-families" aria-labelledby="menu-families"><h2 id="menu-families">Browse by scent family</h2><div>{categories.slice(0, 8).map((category) => <SheetClose asChild key={category.id}><Link href={`/category/${category.slug}`}>{category.name}</Link></SheetClose>)}</div></section>}
        <nav className="brand-menu-account" aria-label="Account and more">
          <SheetClose asChild><Link href={user ? "/profile" : "/login"}><BrandIcon name="user" />{user ? "Account details" : "Sign in to your account"}</Link></SheetClose>
          <SheetClose asChild><Link href="/wishlist"><BrandIcon name="heart" />Wishlist</Link></SheetClose>
          <SheetClose asChild><Link href="/orders"><BrandIcon name="bag" />My order requests</Link></SheetClose>
          <SheetClose asChild><Link href="/journal">The journal</Link></SheetClose>
          <SheetClose asChild><Link href="/contact">Contact</Link></SheetClose>
          {user && <button type="button" onClick={signOut} disabled={signingOut}>{signingOut ? "Signing out…" : "Sign out"}</button>}
          {error && <p role="alert">{error}</p>}
        </nav>
      </div>
    </SheetContent>
  </Sheet>;
}
