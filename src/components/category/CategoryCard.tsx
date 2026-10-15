import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ProductVisual from "@/components/ProductVisual";

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  className?: string;
}

export default function CategoryCard({
  title,
  description,
  image,
  link,
  className,
}: CategoryCardProps) {
  return (
    <Link href={link} className="group block h-full">
      <Card
        className={cn(
          "h-full flex flex-col overflow-hidden rounded-xl border border-[var(--store-line)] bg-[var(--store-card)] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[var(--store-accent)]/40",
          className
        )}
      >
        <CardHeader className="p-0 relative overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-[var(--store-surface)]">
            <ProductVisual src={image} alt={`${title} fragrance family`} name={title} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <CardTitle className="line-clamp-2 text-base font-semibold leading-snug text-[var(--store-ink)] transition-colors duration-200 group-hover:text-[var(--store-accent)]">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-1 line-clamp-2 text-xs font-normal text-[var(--store-muted)]">
              {description}
            </CardDescription>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

