"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/lib/types";
import { getProductsBySearch } from "@/app/services/api";
import ProductCard from "@/components/product/ProductCard";
import MuiSkeleton from '@mui/material/Skeleton';
import SearchInput from "@/components/SearchInput";
import { Search } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [completedQuery, setCompletedQuery] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      if (!query) {
        setProducts([]);
        setError("");
        setCompletedQuery(null);
        setLoading(false);
        return;
      }

      setError("");
      setLoading(true);
      setCompletedQuery(null);
      try {
        const response = await getProductsBySearch(query);
        if (active) setProducts(response.products || []);
      } catch {
        if (active) {
          setProducts([]);
          setError("Search could not be completed. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
          setCompletedQuery(query);
        }
      }
    };

    fetchProducts();

    return () => { active = false; };
  }, [query]);

  useEffect(() => {
    if (query) {
      document.title = `Search Results for: ${query}`;
    }
  }, [query]);

  return (
    <main className="oe-store-page oe-search-page">
      <div className="mb-6">
        <p className="eyebrow">Search</p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--store-ink)] sm:text-3xl">
          {query ? `Results for "${query}"` : "Search Results"}
        </h1>
      </div>

        <div className="oe-search-box">
        <SearchInput autoFocus />
      </div>

      {error ? (
        <div role="alert" className="oe-page-error">{error}</div>
      ) : query && (loading || completedQuery !== query) ? (
        <div className="oe-catalog-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <MuiSkeleton variant="rectangular" width="100%" height={240} className="rounded-2xl" />
                <div className="space-y-2">
                  <MuiSkeleton variant="text" width="100%" height={20} />
                  <MuiSkeleton variant="text" width="60%" height={20} />
                </div>
              </div>
            ))}
        </div>
      ) : query && products.length > 0 ? (
        <div className="oe-catalog-grid">
            {products.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
        </div>
      ) : query && !loading && completedQuery === query ? (
        <div className="oe-catalog-empty">
          No products found for this search.
        </div>
      ) : !query ? (
        <div className="oe-catalog-empty oe-search-empty">
          <Search className="mx-auto h-8 w-8 text-[var(--store-muted)]" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-[var(--store-ink)]">What are you looking for?</h2>
          <p className="mt-1 text-sm text-[var(--store-muted)]">Enter a product name above to see matching items.</p>
        </div>
      ) : null}
    </main>
  );
}
