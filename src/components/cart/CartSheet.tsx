"use client";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BagIcon, BrandIcon } from "@/components/ui/brand-icons";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import CartProductCard from "./CartProdutCard";
import { addToCart, deleteFromCart, removeFromCart, loadCart, Product, hideCartNotification } from "@/store/reducer/cartReducer";
import { RootState } from "@/store/store";
import { useSelector, useDispatch } from "react-redux";

export default function CartSheet() {
  const { cart, totalItems, totalAmount } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    dispatch(loadCart());
  }, [dispatch]);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product));
  };

  const handleRemoveFromCart = (product: Product) => {
    dispatch(removeFromCart(product));
  };

  const handleDeleteFromCart = (product: Product) => {
    dispatch(deleteFromCart(product));
    
    // Check if the cart is empty and dispatch an action to hide the notification
    if (cart.length === 1) {
      dispatch(hideCartNotification());
    }
  };

  const handleOpenCart = (open: boolean) => {
    setOpen(open);
    if (open) {
      dispatch(hideCartNotification());
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenCart}>
      <SheetTrigger asChild>
        <button type="button" aria-label={`Open bag${totalItems ? `, ${totalItems} ${totalItems === 1 ? "item" : "items"}` : ""}`} title="Shopping bag" className="brand-icon-button">
          <BagIcon count={totalItems} />
        </button>
      </SheetTrigger>
      <SheetContent aria-describedby={undefined} className="oe-cart-panel flex w-full max-w-md flex-col p-0">
        <SheetHeader className="oe-cart-panel-header">
          <SheetTitle>Your selection <span>({totalItems} {totalItems === 1 ? "item" : "items"})</span></SheetTitle>
        </SheetHeader>

        <div className="oe-cart-panel-items flex-1 space-y-4 overflow-y-auto p-4">
          {cart.length > 0 ? (
            cart.map((product: Product) => (
              <CartProductCard
                key={`${product.id}-${product.slug}-${product.size || "na"}-${product.color || "na"}`}
                product={product}
                removeFromCart={handleRemoveFromCart}
                addToCart={handleAddToCart}
                deleteFromCart={handleDeleteFromCart}
              />
            ))
          ) : (
            <div className="flex h-40 flex-col items-center justify-center text-[var(--store-muted)]">
              <BrandIcon name="bag" className="mb-2" />
              <span className="text-sm">Your cart is empty</span>
            </div>
          )}
        </div>

        <SheetFooter className="oe-cart-panel-footer sticky bottom-0 p-4">
          <Button
            variant="default"
            onClick={() => {
              setOpen(false);
              router.push("/cart");
            }}
            className="oe-cart-continue flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            disabled={cart.length === 0}
          >
            Review selection · ₹{totalAmount.toLocaleString("en-IN")}
          </Button>
          <button type="button" className="oe-cart-browse" onClick={() => { setOpen(false); router.push("/products"); }}>Continue shopping</button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
