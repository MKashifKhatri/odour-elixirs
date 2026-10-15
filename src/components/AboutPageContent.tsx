"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import ProductVisual from "@/components/ProductVisual";
import { useStorefrontContent } from "@/lib/useStorefrontContent";

export default function AboutPageContent() {
  const content = useStorefrontContent();
  const values = [
    { number: "01", title: content.aboutValueOneTitle, text: content.aboutValueOneText },
    { number: "02", title: content.aboutValueTwoTitle, text: content.aboutValueTwoText },
    { number: "03", title: content.aboutValueThreeTitle, text: content.aboutValueThreeText },
  ];

  return <main className="oe-store-page oe-about-page">
    <section className="oe-about-hero"><Reveal className="oe-about-copy"><p className="oe-micro-label oe-micro-label-dark"><span />{content.aboutEyebrow}</p><h1>{content.aboutTitle}<em>{content.aboutTitleAccent}</em></h1><p>{content.aboutDescription}</p><Link href="/products">{content.aboutCta}<ArrowUpRight size={15} /></Link></Reveal><Reveal className="oe-about-image" delay={0.08}><ProductVisual src={content.storyImage} alt="Odour Elixirs brand story" name="The house" sizes="(max-width: 760px) 90vw, 50vw" /><span>THE HOUSE OF ODOUR ELIXIRS</span></Reveal></section>
    <section className="oe-about-statement"><Reveal><span>SCENT / MEMORY / PRESENCE</span><h2>A fragrance is<br /><em>a feeling that stays.</em></h2></Reveal></section>
    <section className="oe-about-values"><Reveal className="oe-about-values-heading"><p className="oe-micro-label oe-micro-label-dark"><span />A FEW THINGS WE BELIEVE</p><h2>Personal, by nature.</h2></Reveal><div>{values.map((value, index) => <Reveal key={value.number} delay={index * 0.05}><article><span>{value.number}</span><div><h3>{value.title}</h3><p>{value.text}</p></div><ArrowUpRight size={15} /></article></Reveal>)}</div></section>
    <section className="oe-about-end"><Reveal><p>FIND YOUR OWN KIND OF PRESENCE</p><h2>Begin with<br />a feeling.</h2><Link href="/products">Explore the collection<ArrowUpRight size={15} /></Link></Reveal></section>
  </main>;
}
