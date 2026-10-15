"use client";

import { Product, ProductVariant } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { addToCart, showCartNotification } from "@/store/reducer/cartReducer";
import toast from "react-hot-toast";

export default function AddToCartButton({ product, variant, disabled, quantity = 1 }: { product: Product, variant?: ProductVariant, disabled: boolean, quantity?: number }) {
  const dispatch = useDispatch();

  const cartProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(variant?.selling_price ?? product.price),
    image: product.image,
    quantity: 1,
    color: variant?.color || product.color?.[0] || "",
    size: variant?.size || product.size || "",
    variantId: variant?.id,
    variantStock: Number(variant?.available_quantity ?? variant?.stock_quantity ?? variant?.stock ?? product.available_quantity ?? product.quantity ?? (product.available ? 999 : 0)),
  };
  const handleAddToCart = () => {
    if (!disabled) {
      Array.from({ length: Math.max(1, quantity) }).forEach(() => {
        dispatch(addToCart({ ...cartProduct, quantity: 1 }));
      });
      dispatch(showCartNotification());
      toast.success("Item added to cart");
      // toast({
      //   title: "Item added to cart!",
      //   action: (
      //     <Link href="/cart">
      //       <ToastAction altText="View Cart">View Cart</ToastAction>
      //     </Link>
      //   ),
      //   className: "border border-green-600 text-pretty",
      // });
    }
  };

  return (
    <>
      <Button
        onClick={handleAddToCart}
        variant="secondary"
        className="oe-add-to-bag relative w-full transition duration-200 active:scale-[.99]"
        disabled={disabled}
      >
        <PlusIcon className="absolute left-4 h-4 w-4" />
        {disabled ? "Out of stock" : "Add to bag"}
      </Button>
    </>
  );
}
