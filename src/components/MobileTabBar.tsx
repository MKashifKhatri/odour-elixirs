"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, Heart, House, Search } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { BagIcon } from "@/components/ui/brand-icons";

const tabs = [
  { label: "Home", href: "/", icon: House },
  { label: "Shop", href: "/products", icon: Grid2X2 },
  { label: "Search", href: "/search", icon: Search },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Bag", href: "/cart", icon: null },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const totalItems = useSelector((state: RootState) => state.cart.totalItems);

  return (
    <nav aria-label="Mobile shortcuts" className="oe-mobile-tab-bar">
      <div className="oe-mobile-tab-bar-inner">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = href === "/"
            ? pathname === "/"
            : href === "/products"
              ? ["/products", "/product/", "/category/"].some((prefix) => pathname.startsWith(prefix))
              : pathname.startsWith(href);
          const count = label === "Bag" ? totalItems : 0;

          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label === "Bag" && count > 0 ? `Bag, ${count} ${count === 1 ? "item" : "items"}` : label}
              className={`oe-mobile-tab${active ? " is-active" : ""}`}
            >
              <span className="oe-mobile-tab-icon">
                {Icon ? <Icon aria-hidden="true" strokeWidth={active ? 2.1 : 1.7} /> : <BagIcon count={count} />}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
