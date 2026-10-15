"use client";
// import { getFeaturedProducts } from "@/sanity/lib/sanity.query";
import ProductsMarquee from "./ProductsMarquee";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Skeleton } from "../ui/skeleton";
import { demoProducts } from "@/lib/demoCatalog";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ProductsMarqueeWrapper({ excludeSlug }: { excludeSlug?: string }) {
  const { loading, featuredProducts } = useSelector((state: RootState) => state.user);
  const source = featuredProducts?.length ? featuredProducts : demoProducts;
  const recommendations = source.filter((product) => product.slug !== excludeSlug).slice(0, 5);

  return (
    <section className="oe-related-section">
      <header className="oe-related-heading"><div><p className="oe-micro-label oe-micro-label-dark"><span />A LITTLE FURTHER</p><h2>More to discover.</h2><p>Explore another fragrance from the collection.</p></div><Link href="/products">View all fragrances <ArrowUpRight size={15} /></Link></header>

        {loading ? (
          <div className="oe-related-skeleton">
            {[...Array(4)].map((_, index) => (
              <div key={index}>
                <Skeleton className="aspect-[.78] w-full rounded-none" />
                <Skeleton className="mt-3 h-4 w-2/3 rounded-none" />
                <Skeleton className="mt-2 h-3 w-1/2 rounded-none" />
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <ProductsMarquee products={recommendations} />
        ) : (
          <p className="oe-related-empty">More fragrances are on their way.</p>
        )}
    </section>
  );
}
