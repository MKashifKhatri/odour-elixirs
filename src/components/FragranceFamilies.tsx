"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import type { Category } from "@/lib/types";
import ProductVisual from "@/components/ProductVisual";

const fallbackFamilies: Category[] = [
  { id: "fresh", name: "Fresh", slug: "fresh", description: "Bright and uplifting", featured: true, image: "" },
  { id: "woody", name: "Woody", slug: "woody", description: "Warm and grounded", featured: true, image: "" },
  { id: "amber", name: "Amber", slug: "amber", description: "Soft and sensual", featured: true, image: "" },
  { id: "floral", name: "Floral", slug: "floral", description: "Expressive and elegant", featured: true, image: "" },
  { id: "gourmand", name: "Gourmand", slug: "gourmand", description: "Comforting and indulgent", featured: true, image: "" },
];

export default function FragranceFamilies({ eyebrow, title }: { eyebrow: string; title: string }) {
  const allCategories = useSelector((state: RootState) => state.user.allCategories);
  const familyNames = new Set(["fresh", "woody", "amber", "gourmand", "aquatic", "floral"]);
  const configured = (allCategories || []).filter((category) => category.featured && familyNames.has(category.name.toLowerCase()));
  const isFallback = configured.length === 0;
  const categories = isFallback ? fallbackFamilies : configured.slice(0, 6);

  return (
    <section className="oe-lux-families" id="collections" aria-labelledby="family-title">
      <div className="oe-lux-family-intro"><p className="oe-lux-eyebrow"><span aria-hidden="true" />{eyebrow}</p><h2 id="family-title">{title}</h2></div>
      <div className="oe-lux-family-list">{categories.map((category, index) => <Link key={category.id} href={isFallback ? `/products?family=${encodeURIComponent(category.name)}` : `/category/${category.slug}`} className="oe-lux-family-link"><ProductVisual src={category.image} alt={`${category.name} fragrance collection`} name={category.name} sizes="(max-width: 760px) 48vw, 28vw" /><span>{String(index + 1).padStart(2, "0")}</span><strong>{category.name}</strong><small>{category.description || "Explore the collection"}</small><ArrowUpRight size={17} strokeWidth={1.35} /></Link>)}</div>
    </section>
  );
}
