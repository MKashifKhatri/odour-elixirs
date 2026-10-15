"use client";
import { Button } from "./button";
import { BrandIcon } from "./brand-icons";

export function Pagination({ page, pageCount, onPageChange, disabled = false, label = "Pagination" }: { page: number; pageCount: number; onPageChange: (page: number) => void; disabled?: boolean; label?: string }) {
  const count = Number.isFinite(pageCount) ? Math.max(1, Math.floor(pageCount)) : 1;
  const current = Number.isFinite(page) ? Math.max(1, Math.min(count, Math.floor(page))) : 1;
  const pages = Array.from(new Set([1, current - 1, current, current + 1, count])).filter((item) => item >= 1 && item <= count).sort((a, b) => a - b);
  return <nav className="ds-pagination" aria-label={label}><Button type="button" variant="secondary" size="icon" aria-label="Previous page" disabled={disabled || current === 1} onClick={() => onPageChange(current - 1)}><BrandIcon name="chevron" className="ds-chevron-back" /></Button>{pages.map((item, index) => <span key={item}>{index > 0 && item - pages[index - 1] > 1 && <span aria-hidden="true" className="ds-pagination-gap">…</span>}<Button type="button" size="icon" variant={item === current ? "primary" : "ghost"} aria-label={`Page ${item}`} aria-current={item === current ? "page" : undefined} disabled={disabled} onClick={() => onPageChange(item)}>{item}</Button></span>)}<Button type="button" variant="secondary" size="icon" aria-label="Next page" disabled={disabled || current === count} onClick={() => onPageChange(current + 1)}><BrandIcon name="chevron" /></Button><span className="sr-only" role="status">Page {current} of {count}</span></nav>;
}
