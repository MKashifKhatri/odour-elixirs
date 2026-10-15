"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllProducts, updateProduct } from "@/app/services/api";
import { Product } from "@/lib/types";
import { toast } from "react-hot-toast";
import Loader from "@/components/loader";
import { AlertTriangle, CheckCircle, Package, RefreshCw, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ADMIN_SECRET_PATH } from "../_components/AdminSidebar";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [stockEdits, setStockEdits] = useState<{ [id: string]: number }>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      const list = Array.isArray(data) ? data : data?.products || [];
      setProducts(list);
      const initialStock: { [id: string]: number } = {};
      list.forEach((p: Product) => {
        initialStock[p.id] = p.quantity;
      });
      setStockEdits(initialStock);
    } catch (err) {
      console.error("Failed to load inventory:", err);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleStockChange = (id: string, val: string) => {
    const num = parseInt(val, 10);
    setStockEdits((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleSaveStock = async (product: Product) => {
    const newQty = stockEdits[product.id];
    if (newQty === undefined || newQty === product.quantity) return;

    setSavingId(product.id);
    try {
      await updateProduct({
        id: product.id,
        quantity: newQty,
      });
      toast.success(`Stock updated for ${product.name}`);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, quantity: newQty } : p))
      );
    } catch (err) {
      console.error("Failed to update stock:", err);
      toast.error("Failed to update stock");
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === "low") return p.quantity > 0 && p.quantity <= 5;
      if (filter === "out") return p.quantity <= 0;
      return true;
    });
  }, [products, search, filter]);

  const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const outOfStockCount = products.filter((p) => p.quantity <= 0).length;
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= 5).length;

  return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor stock levels, identify out-of-stock items, and update quantities.
            </p>
          </div>
          <button
            onClick={loadProducts}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Units</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{totalStock}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Low Stock (&le; 5)</p>
                <p className="mt-2 text-2xl font-bold text-amber-600">{lowStockCount}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Out of Stock</p>
                <p className="mt-2 text-2xl font-bold text-rose-600">{outOfStockCount}</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-3 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search product by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm text-gray-900 outline-none focus:border-black"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilter("low")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === "low" ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setFilter("out")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === "out" ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Current Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const currentStock = stockEdits[product.id] ?? product.quantity;
                  const hasChanged = currentStock !== product.quantity;

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                      In Stock
                    </span>
                  );
                  if (product.quantity <= 0) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                        Out of Stock
                      </span>
                    );
                  } else if (product.quantity <= 5) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                        Low Stock
                      </span>
                    );
                  }

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                                No img
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/${ADMIN_SECRET_PATH}/product/${product.slug}`}
                              className="font-semibold text-gray-900 hover:underline line-clamp-1"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-gray-400 font-mono">slug: {product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {product.category?.name || "Uncategorized"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={currentStock}
                            onChange={(e) => handleStockChange(product.id, e.target.value)}
                            className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm font-semibold text-gray-900 focus:border-black outline-none"
                          />
                          <span className="text-xs text-gray-400">units</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">{statusBadge}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          disabled={!hasChanged || savingId === product.id}
                          onClick={() => handleSaveStock(product)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            hasChanged
                              ? "bg-black text-white hover:bg-gray-800"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {savingId === product.id ? "Saving..." : "Update"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
  );
}
