"use client";

import Image from "next/image";
import { useState } from "react";

type ProductVisualProps = {
  src?: string | null;
  alt: string;
  name?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

const isIllustrationPlaceholder = (src: string) => /\/product-placeholder\.svg$/i.test(src);
const canOptimizeImage = (src: string) => {
  try {
    const hostname = new URL(src).hostname;
    return hostname === "images.unsplash.com" || hostname === "encrypted-tbn0.gstatic.com" || hostname.endsWith(".supabase.co");
  } catch {
    return true;
  }
};

export default function ProductVisual({ src, alt, name = "Odour Elixirs", className = "", priority = false, sizes = "100vw" }: ProductVisualProps) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || isIllustrationPlaceholder(src) || failed;

  return (
    <div className={`oe-v2-visual ${showPlaceholder ? "is-placeholder" : ""} ${className}`}>
      {!showPlaceholder ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={!canOptimizeImage(src)} className="oe-v2-visual-image" onError={() => setFailed(true)} />
      ) : (
        <div className="oe-v2-placeholder" role="img" aria-label={`${alt} — product photography coming soon`}>
          <span className="oe-v2-placeholder-index">O / E</span>
          <span className="oe-v2-bottle" aria-hidden="true"><i /><b /></span>
          <span className="oe-v2-placeholder-copy">{name}</span>
          <span className="oe-v2-placeholder-note">Product image coming soon</span>
        </div>
      )}
    </div>
  );
}
