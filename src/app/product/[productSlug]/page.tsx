'use client'

import { getProductBySlug } from "@/app/services/api";
import ProductDetailCard from "@/components/product/ProductDetailCard";
import ProductsMarqueeWrapper from "@/components/product/ProductsMarqueeWrapper";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { Product } from "@/lib/types";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import { demoProducts } from "@/lib/demoCatalog";
import Link from "next/link";

type Props = {
  params: { productSlug: string };
};

const ProductPage = ({ params }: Props) => {
  const [product, setProduct] = useState<Product | null>(() => demoProducts.find((item) => item.slug === params.productSlug) || null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const fallbackProduct = demoProducts.find((item) => item.slug === params.productSlug);
      try {
        const productData = await getProductBySlug(params.productSlug, { suppressErrorToast: Boolean(fallbackProduct) });
      if (productData?.product) setProduct(productData.product);
    } catch {
      setProduct((current) => current || demoProducts.find((item) => item.slug === params.productSlug) || null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.productSlug]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.name || '',
    image: product?.image || '',
    description: product?.description || '',
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: product ? {
      "@type": "Offer",
      price: Number(product.price),
      priceCurrency: "INR",
      availability: (product.available ?? Number(product.quantity || 0) > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}product/${params.productSlug}`,
    } : undefined,
  };

  if (loading) return <Loader />;

  return (
    <div className="oe-store-page oe-product-route">
      <nav aria-label="Breadcrumb" className="oe-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/products">Shop</Link><span>/</span><span>{product?.name || "Fragrance"}</span></nav>
      {product && <ProductDetailCard product={product} isLoading={loading} />}
      <div className="oe-related-products">
        <ProductsMarqueeWrapper excludeSlug={params.productSlug} />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
};

export default ProductPage;
