'use client';

import { getProductsByCategory } from "@/app/services/api";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/lib/types";
import { setLoading } from "@/store/reducer/userReducer";
import { RootState } from "@/store/store";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import MuiSkeleton from '@mui/material/Skeleton';
import { Loader2 } from "lucide-react";
import Loading from "@/components/loading";
import Link from "next/link";

export default function CategoryPage({ params }: { params: { categorySlug: string } }) {
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.user.loading);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const isFirstLoad = useRef(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [error, setError] = useState("");
  const categories = useSelector((state: RootState) => state.user.allCategories);

  // Responsive PAGE_SIZE: 6 for small screens, 8 for desktop
  const PAGE_SIZE = isSmallScreen ? 5 : 8;

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchProducts = async (pageNum = 1, pageSize = PAGE_SIZE) => {
    try {
      setError("");
      dispatch(setLoading(true));
      const res = await getProductsByCategory(params.categorySlug, pageNum, pageSize);
      if (pageNum === 1) {
        setProducts(res.products || []);
      } else {
        setProducts(prev => [...prev, ...(res.products || [])]);
      }
      setTotal(res.total || 0);
    } catch {
      setError("We couldn’t load this collection. Please try again.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setTotal(0);
    isFirstLoad.current = true;
    fetchProducts(1, PAGE_SIZE).then(() => {
      isFirstLoad.current = false;
    });
    // eslint-disable-next-line
  }, [params.categorySlug, PAGE_SIZE]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, PAGE_SIZE);
  };

  const hasMore = products.length < total;
  const categoryLabel = products[0]?.category?.name || params.categorySlug.replace(/-/g, " ");

  return (
    <section className="oe-store-page oe-category-page">
      <div className="oe-catalog-header oe-category-heading">
        <p className="oe-micro-label oe-micro-label-dark"><span />Collection</p>
        <h1>
          {categoryLabel}
        </h1>
        <p className="oe-category-description">Explore the latest pieces in {categoryLabel}.</p>
        {categories.length > 1 && <nav aria-label="Browse categories" className="oe-category-filters">
          {categories.map((category) => <Link key={category.id} href={`/category/${category.slug}`} aria-current={category.slug === params.categorySlug ? "page" : undefined} className={category.slug === params.categorySlug ? "is-active" : ""}>{category.name}</Link>)}
        </nav>}
      </div>

      {error && <div role="alert" className="oe-page-error">{error} <button onClick={() => fetchProducts(page)}>Try again</button></div>}

      {loading && products.length === 0 ? (
        <>
          <div className="oe-category-grid">
            {[...Array(PAGE_SIZE)].map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <MuiSkeleton variant="rectangular" width="100%" height={260} className="rounded-2xl" />
                <div className="space-y-2">
                  <MuiSkeleton variant="text" width="80%" height={24} />
                  <MuiSkeleton variant="text" width="60%" height={20} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : products.length > 0 ? (
        <section className="flex flex-col items-center justify-center">
          <div className="oe-category-grid">
            {products.map((product: Product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {loading && products.length > 0 && (
            <div className="w-full flex justify-center my-6">
              <Loader2 className="animate-spin h-6 w-6 text-primary" />
            </div>
          )}

          {hasMore && !loading && (
            <button
              onClick={handleLoadMore}
              className="oe-load-more mt-8"
            >
              Load More
            </button>
          )}
        </section>
      ) : !loading && products.length === 0 && !isFirstLoad.current ? (
        <div className="oe-catalog-empty">
          No products found in this category.
        </div>
      ) : <Loading />}
    </section>
  );
}
