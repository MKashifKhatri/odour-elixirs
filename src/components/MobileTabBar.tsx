"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, House, Search, ShoppingBag, UserRound } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const tabs = [
  { label: "Home", href: "/", icon: House },
  { label: "Shop", href: "/products", icon: Grid2X2 },
  { label: "Search", href: "/search", icon: Search },
  { label: "Cart", href: "/cart", icon: ShoppingBag },
  { label: "Account", href: "/profile", icon: UserRound },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const totalItems = useSelector((state: RootState) => state.cart.totalItems);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-40 mx-auto max-w-lg md:hidden"
    >
      <div className="grid grid-cols-5 rounded-2xl border border-[var(--store-line)] bg-[var(--store-surface)]/95 p-1.5 text-[var(--store-muted)] shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-accent)] ${
                active
                  ? "bg-[var(--store-accent)] font-semibold text-[var(--store-accent-foreground)] shadow-sm"
                  : "hover:bg-[var(--store-bg-soft)] hover:text-[var(--store-ink)]"
              }`}
            >
              <span className="relative">
                <Icon aria-hidden="true" className="h-[19px] w-[19px]" strokeWidth={active ? 2.25 : 1.8} />
                {label === "Cart" && totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--store-danger)] px-1 text-[9px] font-bold leading-none text-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
