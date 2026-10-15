"use client";
import { ArrowUpRight, Plus, Minus } from "lucide-react";
import { useId, useState } from "react";
type FaqItem = { question: string; answer: string };
function category(question: string) {
  if (/return|refund|exchange/i.test(question)) return "Returns";
  if (/ship|deliver/i.test(question)) return "Delivery";
  if (/order|payment|whatsapp/i.test(question)) return "Orders";
  if (/stor|last|wear|apply/i.test(question)) return "Fragrance care";
  return "Fragrances";
}
export default function HomeFaq({ items, actionLabel, whatsappUrl, title }: { items: FaqItem[]; actionLabel: string; whatsappUrl: string; title: string }) {
  const id = useId();
  const [open, setOpen] = useState<Set<number>>(new Set());
  const groups = Array.from(new Set(items.map(item => category(item.question))));
  return <section className="house-faq" id="faq" aria-labelledby={`${id}-title`}>
    <header><p className="eyebrow">Good to know</p><h2 id={`${id}-title`}>{title}</h2><p>A few answers before you find your fragrance.</p><a className="house-link" href={whatsappUrl} target="_blank" rel="noreferrer">{actionLabel}<ArrowUpRight size={18} /></a></header>
    <div className="house-faq-groups">{groups.map(group => <section key={group} aria-label={group}><h3>{group}</h3>{items.map((item,index) => category(item.question) === group && <article key={index} className={open.has(index) ? "is-open" : ""}>
      <h4><button id={`${id}-q-${index}`} type="button" aria-expanded={open.has(index)} aria-controls={`${id}-a-${index}`} onClick={() => setOpen(current => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; })}>{item.question}{open.has(index) ? <Minus aria-hidden="true" size={20} /> : <Plus aria-hidden="true" size={20} />}</button></h4>
      <div className="house-faq-answer" id={`${id}-a-${index}`} role="region" aria-labelledby={`${id}-q-${index}`} aria-hidden={!open.has(index)}><div><p>{item.answer}</p></div></div>
    </article>)}</section>)}</div>
  </section>;
}
