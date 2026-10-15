import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductVisual from "@/components/ProductVisual";

export const metadata: Metadata = {
  title: "The Journal",
  description: "A considered guide to fragrance notes, scent families and finding a fragrance that feels like you.",
  alternates: { canonical: "/journal" },
};

const readings = [
  { number: "01", title: "The first impression", label: "TOP NOTES", text: "The opening notes are the first part of a fragrance you notice. They introduce its character, then gradually make room for what follows." },
  { number: "02", title: "Where it settles", label: "HEART NOTES", text: "As the opening softens, the heart of a fragrance comes forward. It gives the composition much of its recognisable mood." },
  { number: "03", title: "The trace that remains", label: "BASE NOTES", text: "The deeper notes tend to linger closest to the skin. Their warmth and texture help complete the experience over time." },
];

export default function JournalPage() {
  return <main className="oe-store-page oe-journal-page">
    <header className="oe-journal-hero"><div><p className="oe-micro-label oe-micro-label-dark"><span />THE ODOUR ELIXIRS JOURNAL</p><h1>Notes on<br /><em>finding your scent.</em></h1><p>A little guidance for exploring fragrance with curiosity, patience and your own point of view.</p></div><div className="oe-journal-hero-image"><ProductVisual alt="Odour Elixirs fragrance notes" name="The journal" sizes="(max-width: 760px) 90vw, 40vw" /></div></header>
    <section className="oe-journal-intro"><p className="oe-micro-label oe-micro-label-dark"><span />A SMALL GUIDE TO FRAGRANCE</p><h2>Let a fragrance<br /><em>unfold.</em></h2><p>Perfume is more than its first spray. Give a scent time on your skin, notice what draws you in, and let your own associations lead the way.</p></section>
    <section className="oe-journal-readings" aria-label="How fragrance notes unfold">{readings.map((reading) => <article className="oe-journal-reading" key={reading.number}><div className="oe-journal-reading-image"><ProductVisual alt={`${reading.label.toLowerCase()} in a fragrance`} name={reading.label} sizes="(max-width: 700px) 100vw, 38vw" /></div><div className="oe-journal-reading-copy"><span>{reading.number} <i>—</i> {reading.label}</span><h2>{reading.title}</h2><p>{reading.text}</p></div></article>)}</section>
    <section className="oe-journal-end"><p className="oe-micro-label"><span />YOUR OWN POINT OF VIEW</p><h2>The best place to begin<br /><em>is with what you love.</em></h2><p>Explore the collection, or tell us the notes and moods you’re drawn to.</p><Link href="/products">Find your fragrance <ArrowUpRight size={15} /></Link></section>
  </main>;
}
