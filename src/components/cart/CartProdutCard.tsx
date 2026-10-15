"use client";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { Product } from "@/store/reducer/cartReducer";
import ProductVisual from "@/components/ProductVisual";
export default function CartProductCard({ product, addToCart, removeFromCart, deleteFromCart }: {product: Product; addToCart: (item: Product) => void; removeFromCart: (item: Product) => void; deleteFromCart: (item: Product) => void}) {
 return <article className="bag-item"><Link className="bag-item-image" href={`/product/${product.slug}`}><ProductVisual src={product.image} alt={product.name} sizes="96px" /></Link><div><Link href={`/product/${product.slug}`} className="bag-item-name">{product.name}</Link><p>{product.size}{product.color && ` / ${product.color}`}</p><div className="bag-item-bottom"><div className="quantity-control"><button type="button" aria-label={`Decrease quantity of ${product.name}`} onClick={()=>removeFromCart(product)}><Minus size={16}/></button><span>{product.quantity}</span><button type="button" aria-label={`Increase quantity of ${product.name}`} disabled={product.variantStock !== undefined && product.quantity >= product.variantStock} onClick={()=>addToCart(product)}><Plus size={16}/></button></div><strong>₹{(product.price*product.quantity).toLocaleString("en-IN")}</strong></div></div><button className="bag-remove" type="button" aria-label={`Remove ${product.name}`} onClick={()=>deleteFromCart(product)}><X size={16}/></button></article>;
}
