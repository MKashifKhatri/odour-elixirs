"use client";
import { useId, useState, type ReactNode } from "react";
import { BrandIcon } from "./brand-icons";

export function Accordion({ items, defaultOpen = [] }: { items: { id: string; title: string; content: ReactNode; disabled?: boolean }[]; defaultOpen?: string[] }) {
  const prefix = useId();
  const [open, setOpen] = useState(defaultOpen);
  return <div className="ds-accordion">{items.map((item) => {
    const expanded = open.includes(item.id);
    const id = `${prefix}-${item.id}`;
    return <section key={item.id}><h3><button type="button" id={`${id}-trigger`} disabled={item.disabled} aria-expanded={expanded} aria-controls={`${id}-panel`} onClick={() => setOpen((current) => expanded ? current.filter((key) => key !== item.id) : [...current, item.id])}>{item.title}<BrandIcon name={expanded ? "minus" : "plus"} /></button></h3><div id={`${id}-panel`} role="region" aria-labelledby={`${id}-trigger`} hidden={!expanded}>{item.content}</div></section>;
  })}</div>;
}
