import CartProductCard from "@/components/cart/CartProdutCard";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addToCart, deleteFromCart, Product, removeFromCart } from "@/store/reducer/cartReducer";
import { RootState } from "@/store/store";
import { useSelector, useDispatch } from "react-redux";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CartOrderTable() {
  const { cart, totalAmount, totalItems } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product));
  };

  const handleRemoveFromCart = (product: Product) => {
    dispatch(removeFromCart(product));
  };

  const handleDeleteFromCart = (product: Product) => {
    dispatch(deleteFromCart(product));
  };

  return (
    <div className="py-2">
      {cart.length > 0 ? (
        <div>
          <h1 className="mb-3 text-2xl font-semibold text-[var(--store-ink)]">Cart</h1>

          <div className="rounded-2xl border border-[var(--store-line)] bg-[var(--store-surface)] p-3 sm:p-4">
            <div className="flex flex-col gap-2">
            {cart.map((product: Product, index: number) => (
              <CartProductCard
                key={index}
                product={product}
                removeFromCart={handleRemoveFromCart}
                addToCart={handleAddToCart}
                deleteFromCart={handleDeleteFromCart}
              />
            ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--store-line)] bg-[var(--store-surface)] p-3 sm:p-4">
            <h2 className="mb-3 text-xl font-semibold text-[var(--store-ink)]">Order Summary</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DESCRIPTION</TableHead>
                  <TableHead className="text-right">UNIT PRICE</TableHead>
                  <TableHead className="text-right">QTY</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((product: Product, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="right">₹{product.price}</TableCell>
                    <TableCell align="right">{product.quantity}</TableCell>
                    <TableCell align="right">
                      ₹{product.price * product.quantity}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3}>Subtotal</TableCell>
                  <TableCell align="right">₹{totalAmount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}>Shipping Cost</TableCell>
                  <TableCell align="right">FREE</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow className="text-primary">
                  <TableCell colSpan={3}>Total Amount</TableCell>
                  <TableCell align="right">₹{totalAmount}</TableCell>
                </TableRow>
                <TableRow className="text-primary">
                  <TableCell colSpan={3}>Total Items</TableCell>
                  <TableCell align="right">{totalItems}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--store-line)] bg-[var(--store-surface)] px-4 py-16">
          <div className="relative mb-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--store-accent-soft)]">
              <ShoppingBag className="h-10 w-10 text-[var(--store-muted)]" strokeWidth={1.5} />
            </div>
            <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--store-accent)] text-xs font-bold text-[var(--store-accent-foreground)]">0</span>
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-[var(--store-ink)]">Your cart is empty</h2>
          <p className="mb-8 max-w-sm text-center text-[var(--store-muted)]">
            Your fragrance bag is empty. Explore the Odour Elixirs collection and find a scent that feels like you.
          </p>
          <Link href="/">
            <Button
              className="flex items-center gap-2 rounded-lg bg-[var(--store-accent)] px-8 py-3 text-base font-semibold text-[var(--store-accent-foreground)] hover:brightness-90"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="mt-4 text-xs text-[var(--store-muted)]">Currently shipping within India.</p>
        </div>
      )}
    </div>
  );
}
