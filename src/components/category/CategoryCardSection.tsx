import CategoryCard from "@/components/category/CategoryCard";
import { Category } from "@/lib/types";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { Skeleton } from "../ui/skeleton";

export default function CategoryCardSection() {
  const { allCategories, loading } = useSelector((state: RootState) => state.user);

  const featuredCategories: Category[] = allCategories.filter(
    (category: Category) => category.featured === true
  );

  return (
    <section className="rounded-2xl border border-[var(--store-line)] bg-[var(--store-surface)] py-6 sm:py-8">
      <div className="mx-auto mb-6 flex max-w-7xl items-end justify-between px-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <p className="eyebrow">Explore</p>
          <h2 className="text-2xl font-semibold leading-tight text-[var(--store-ink)] md:text-3xl">
            Shop By Category
          </h2>
          <p className="max-w-xl text-sm text-[var(--store-muted)] md:text-base">
            Browse categories and jump directly into products.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 md:grid-cols-3 lg:grid-cols-4 lg:px-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="group">
                <div className="overflow-hidden rounded-2xl border border-[var(--store-line)] bg-[var(--store-surface)]">
                  <div className="aspect-square p-3">
                    <Skeleton className="h-full w-full rounded-xl" />
                  </div>
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-2/3 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                  </div>
                </div>
              </div>
            ))
          : featuredCategories.map((category: Category, i: number) => (
              <CategoryCard
                key={i}
                title={category.name}
                description={category.description}
                image={category.image}
                link={`/category/${category.slug}`}
              />
            ))}
      </div>
    </section>
  );
}
