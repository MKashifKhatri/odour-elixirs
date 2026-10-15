import type { SVGProps } from "react";

export type BrandIconName = "bag" | "search" | "user" | "heart" | "chevron" | "plus" | "minus" | "check" | "close";
type IconProps = SVGProps<SVGSVGElement>;

// Original paths on a 20-unit canvas. Decorative by default: label the control.
const paths: Record<BrandIconName, React.ReactNode> = {
  bag: <><path d="M4 6.5h12l1 11H3l1-11Z" /><path d="M7 7V5a3 3 0 0 1 6 0v2" /></>,
  search: <><circle cx="8.5" cy="8.5" r="5.5" /><path d="m12.5 12.5 4.5 4.5" /></>,
  user: <><circle cx="10" cy="6" r="3" /><path d="M3.5 17c.5-3.5 2.5-5 6.5-5s6 1.5 6.5 5" /></>,
  heart: <path d="M10 17 3.5 10.5C-1 6 5 0 10 5c5-5 11 1 6.5 5.5L10 17Z" />,
  chevron: <path d="m7 4 6 6-6 6" />,
  plus: <path d="M4 10h12M10 4v12" />,
  minus: <path d="M4 10h12" />,
  check: <path d="m3.5 10 4 4 9-9" />,
  close: <path d="m4 4 12 12M16 4 4 16" />,
};

export function BrandIcon({ name, className = "", ...props }: IconProps & { name: BrandIconName }) {
  return <svg viewBox="0 0 20 20" className={`brand-icon ${className}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{paths[name]}</svg>;
}

export function MenuIcon({ open = false, className = "", ...props }: IconProps & { open?: boolean }) {
  return <svg viewBox="0 0 20 20" className={`brand-icon brand-menu-icon ${className}`} data-open={open} fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true" focusable="false" {...props}><path className="brand-menu-line-first" d="M3 7h14" /><path className="brand-menu-line-last" d="M3 13h14" /></svg>;
}

// The parent button announces the exact count; this visual badge is decorative.
export function BagIcon({ count = 0 }: { count?: number }) {
  const quantity = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return <span className="brand-bag" aria-hidden="true"><BrandIcon name="bag" />{quantity > 0 && <span className="brand-bag-count">{quantity > 99 ? "99+" : quantity}</span>}</span>;
}
