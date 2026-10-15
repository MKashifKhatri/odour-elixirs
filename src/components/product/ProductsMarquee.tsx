"use client";
import { Product } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import ProductCard from "./ProductCard";

export default function ProductsMarquee({ products }: { products: Product[] }) {
  return (
    <Carousel
      opts={{
        dragFree: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 px-2">
        {products &&
          products.map((product: Product, index: number) => (
            <CarouselItem
              className="pl-2 sm:pl-4 basis-[80vw] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              key={index}
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
      </CarouselContent>
      <CarouselPrevious className="left-0" />
      <CarouselNext className="right-0" />
    </Carousel>
  );
}
