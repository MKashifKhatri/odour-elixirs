"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Product } from "@/lib/types";
import { AspectRatio } from "../ui/aspect-ratio";
import ProductVisual from "@/components/ProductVisual";

export default function ProductCarousel({ product }: { product: Product }) {
  const images = Array.from(new Set([product.image, ...(product.images || [])].filter(Boolean)));
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const galleryId = useId();

  const onSelect = useCallback(() => {
    if (api) setActiveIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api, onSelect]);

  return (
    <div className="oe-product-carousel w-full" role="group" aria-label={`${product.name} product gallery`}>
      <Carousel setApi={setApi} opts={{ align: "start", loop: images.length > 1 }}>
        <CarouselContent className="-ml-0">
          {images.map((image, index) => (
            <CarouselItem key={`${image}-${index}`} className="pl-0">
              <AspectRatio ratio={1}>
                <button type="button" onClick={() => setZoomed((value) => !value)} aria-label={zoomed ? "Zoom out of product image" : "Zoom in on product image"} aria-describedby={images.length > 1 ? `${galleryId}-position` : undefined} className="oe-product-image-button group relative block h-full w-full cursor-zoom-in overflow-hidden">
                  <ProductVisual src={image} alt={`${product.name}, view ${index + 1}`} name={product.name} priority={index === 0} sizes="(max-width: 768px) 100vw, 55vw" className={`oe-v2-gallery-visual${zoomed && activeIndex === index ? " is-zoomed" : ""}`} />
                </button>
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && <>
          <CarouselPrevious aria-label="Previous product image" className="left-3 border-[var(--store-line)] bg-[var(--store-surface)]/90 text-[var(--store-ink)]" />
          <CarouselNext aria-label="Next product image" className="right-3 border-[var(--store-line)] bg-[var(--store-surface)]/90 text-[var(--store-ink)]" />
        </>}
      </Carousel>
      {images.length > 1 && <div className="oe-product-gallery-meta"><span>Product details</span><span id={`${galleryId}-position`} aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} <i>/</i> {String(images.length).padStart(2, "0")}</span></div>}
      {images.length > 1 && <div aria-label="Choose product image" className="oe-product-thumbnails mt-3 flex gap-2 overflow-x-auto p-1">
        {images.map((image, index) => (
          <button key={`${image}-thumb-${index}`} type="button" aria-label={`Show image ${index + 1}`} aria-pressed={activeIndex === index} onClick={() => { setZoomed(false); api?.scrollTo(index); }} className={`relative h-16 w-16 shrink-0 overflow-hidden border transition ${activeIndex === index ? "is-active" : "opacity-70 hover:opacity-100"}`}>
            <ProductVisual src={image} alt={`${product.name}, view ${index + 1}`} name={product.name} sizes="64px" />
          </button>
        ))}
      </div>}
    </div>
  );
}
