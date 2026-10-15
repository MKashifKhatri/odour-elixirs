// import { urlForImage } from "@/sanity/lib/image";
import { DeleteIcon, MinusIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Product } from "@/store/reducer/cartReducer";
import ProductVisual from "@/components/ProductVisual";

export default function CartProductCard({
  product,
  addToCart,
  removeFromCart,
  deleteFromCart,
}: {
  addToCart: (Item: Product) => void;
  removeFromCart: (Item: Product) => void;
  deleteFromCart: (Item: Product) => void;
} & { product: Product }) {
  // console.log(product);
  return (
    <Card className="mb-2 border border-[var(--store-line)] bg-[var(--store-surface)] p-2 shadow-none">
      <CardContent className="grid w-full grid-cols-[90px_1fr] gap-3 p-0 sm:grid-cols-[110px_1fr]">
        <Link className="oe-cart-product-image" href={`/product/${product.slug}`}>
          <ProductVisual src={product.image} alt={`${product.name} fragrance`} name={product.name} sizes="110px" />
        </Link>
        <div className="flex flex-col justify-between gap-2">
          <div className="w-full">
            <div className="line-clamp-2 text-sm font-medium leading-tight text-[var(--store-ink)] sm:text-base">
              {product.name}
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--store-accent)]">
              ₹{product.price}
            </div>
            {product.color && (
              <div className="mt-1 text-xs text-[var(--store-muted)] sm:text-sm">
                Color: {product.color}
              </div>
            )}
            {product.size && (
              <div className="mt-1 text-xs text-[var(--store-muted)] sm:text-sm">
                Size: {product.size}
              </div>
            )}
          </div>
          <div className="flex flex-row items-center justify-end gap-2">
            <div className="flex w-min flex-row items-center gap-1 rounded-lg border border-[var(--store-line)] p-1">
              <Button
                className="h-7 w-7"
                variant={"ghost"}
                size={"icon"}
                aria-label={`Increase quantity of ${product.name}`}
                onClick={() => addToCart(product)}
              >
                <PlusIcon size={15} />
              </Button>
              <span className="min-w-6 px-1 text-center text-sm font-semibold text-[var(--store-ink)]">
                {product.quantity}
              </span>
              <Button
                className="h-7 w-7"
                variant={"ghost"}
                size={"icon"}
                aria-label={`Decrease quantity of ${product.name}`}
                onClick={() => removeFromCart(product)}
              >
                <MinusIcon size={15} />
              </Button>
            </div>
            <Button
              className="h-8 w-8"
              variant={"destructive"}
              size={"icon"}
              aria-label={`Remove ${product.name} from cart`}
              onClick={() => deleteFromCart(product)}
            >
              <DeleteIcon size={15} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
