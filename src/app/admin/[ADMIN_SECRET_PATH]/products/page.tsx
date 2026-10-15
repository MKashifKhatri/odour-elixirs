"use client"
import { ReactElement, useState, useEffect } from "react";
import Link from "next/link";
import { Column } from "react-table";
import TableHOC from "../_components/TableHOC";
import { Product } from "@/lib/types"; // Adjust the import based on your types
import { getAllProducts } from "@/app/services/api";
import { ADMIN_SECRET_PATH } from "../_components/AdminSidebar";
import Loader from "@/components/loader";
import Image from "next/image";

interface DataType {
  id: string;
  photo: ReactElement;
  name: string;
  price: number;
  stock: number;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Photo",
    accessor: "photo",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Price",
    accessor: "price",
  },
  {
    Header: "Stock",
    accessor: "stock",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const img =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8&w=1000&q=804";

const img2 = "https://m.media-amazon.com/images/I/514T0SvwkHL._SL1500_.jpg";

const Products = () => {
  const [rows, setRows] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        // console.log(data);
        const formattedData = data.map((product: Product) => ({
          id: product.id,
          photo: (
            <Image
              src={product.image}
              alt={product.name}
              width={80}
              height={80}
              className="w-20 h-20"
            />
          ),
          name: product.name,
          price: product.price,
          stock: product.quantity,
          action: (
            <Link href={`/admin/${ADMIN_SECRET_PATH}/product/${product.slug}`} className="text-blue-500 hover:text-blue-700">
              Manage
            </Link>
          ),
        }));
        // console.log(formattedData);
        setRows(formattedData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden",
    "Products",
    true,
    true,
    isSmallScreen ? 6 : 5
  );

  const totalProducts = rows.length;
  const lowStock = rows.filter((row) => row.stock <= 10).length;
  const avgPrice = totalProducts > 0
    ? Math.round(rows.reduce((sum, row) => sum + row.price, 0) / totalProducts)
    : 0;

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <Link
        href={`/admin/${ADMIN_SECRET_PATH}/dashboard`}
        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        Back to Dashboard
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500">Browse, manage, and edit catalog items from one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total products</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{totalProducts}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Low stock</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">{lowStock}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Average price</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">₹{avgPrice.toLocaleString()}</p>
        </div>
      </div>

      {loading ? <Loader /> : <Table />}
    </div>
  );
};

export default Products;
