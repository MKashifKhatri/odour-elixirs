"use client"
import { ReactElement, useState, useEffect } from "react";
import Link from "next/link";
import { Column } from "react-table";
import TableHOC from "../_components/TableHOC";
import { Category } from "@/lib/types"; // Adjust the import based on your types
import { getCategories } from "@/app/services/api";
import { getAllProducts } from "@/app/services/api"; // Import to fetch products
import { ADMIN_SECRET_PATH } from "../_components/AdminSidebar";
import Loader from "@/components/loader"; // Adjust the import path as necessary
import Image from "next/image"; // Add this import

interface DataType {
  id: string;
  name: string;
  image: string;
  productCount: number;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Image",
    accessor: "image",
    Cell: ({ value }) => (
      <Image
        src={value}
        alt="Category"
        width={80}
        height={80}
        className="w-20 h-20 object-cover"
      />
    ),
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Product Count",
    accessor: "productCount",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Categories = () => {
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
    const fetchCategories = async () => {
      try {
        const categories = await getCategories(); // contains id
        const products = await getAllProducts();  // contains category
  
        // Step 1: Build map of category ID to count
        const productCountMap: { [key: string]: number } = {};
  
        products.forEach((product: any) => {
          const catId = typeof product.category === 'object'
            ? product.category.id?.toString()
            : product.category?.toString();
  
          if (catId) {
            productCountMap[catId] = (productCountMap[catId] || 0) + 1;
          }
        });
  
        // Step 2: Format rows
        const formattedData = categories.map((category: any) => ({
          id: category.id.toString(),
          name: category.name,
          image: category.image,
          productCount: productCountMap[category.id.toString()] || 0,
          action: (
            <Link
              href={`/admin/${ADMIN_SECRET_PATH}/category/${category.slug}`}
              className="text-blue-500 hover:text-blue-700"
            >
              Manage
            </Link>
          ),
        }));
  
        setRows(formattedData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCategories();
  }, []);
  

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden",
    "Categories",
    true,
    true,
    isSmallScreen ? 6 : 5
  );

  const totalCategories = rows.length;
  const activeCategories = rows.filter((row) => row.productCount > 0).length;
  const maxProducts = rows.reduce((max, row) => Math.max(max, row.productCount), 0);

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <Link
        href={`/admin/${ADMIN_SECRET_PATH}/dashboard`}
        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        Back to Dashboard
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500">Track category coverage and manage catalog structure.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total categories</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{totalCategories}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active categories</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">{activeCategories}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Largest category</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{maxProducts}</p>
        </div>
      </div>

      {loading ? <Loader /> : <Table />}
    </div>
  );
};

export default Categories;
