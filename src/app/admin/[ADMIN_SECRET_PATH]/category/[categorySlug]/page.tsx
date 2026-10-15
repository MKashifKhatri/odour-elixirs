"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import { getCategoryBySlug, updateCategory, removeCategory } from "@/app/services/api";
import { ADMIN_SECRET_PATH } from "../../_components/AdminSidebar";
import Loader from "@/components/loader";
import { Category } from "@/lib/types";
import Image from "next/image";

const CategoryManagement = ({ params }: { params: { categorySlug: string } }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const data = await getCategoryBySlug(params.categorySlug);
        // console.log(data)
        setCategory(data.result.category);
        setName(data.result.category.name);
        setSlug(data.result.category.slug);
        setDescription(data.result.category.description);
        setFeatured(data.result.category.featured);
        setImage(data.result.category.image);
        setSize(data.result.category.size);
        setColor(data.result.category.color);
      } catch (err) {
        console.error("Error fetching category:", err);
        router.push(`/admin/${ADMIN_SECRET_PATH}/categories`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [params.categorySlug, router]);

  const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
          setPhotoFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeHandler = async () => {
    if (!category?.id) return;
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await removeCategory(category.id.toString());
        router.push(`/admin/${ADMIN_SECRET_PATH}/categories`);
      } catch (err) {
        console.error("Error deleting category:", err);
      }
    }
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updates: Partial<Category> = {};
    if (name !== category?.name) updates.name = name;
    if (slug !== category?.slug) updates.slug = slug;
    if (description !== category?.description) updates.description = description;
    if (featured !== category?.featured) updates.featured = featured;
    if (image !== category?.image) updates.image = image;

    if (Object.keys(updates).length > 0) {
      await updateCategory({ ...updates, id: category?.id });
      router.push(`/admin/${ADMIN_SECRET_PATH}/categories`);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="w-full px-2 py-4 sm:px-4 md:px-8">
      <main className="mx-auto max-w-4xl">
        <section className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <button
            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600"
            onClick={removeHandler}
          >
            <FaTrash className="w-4 h-4" />
          </button>

          <form onSubmit={submitHandler} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Manage Category</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Category Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  placeholder="Category Slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  placeholder="Category Description"
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png, .gif, .bmp"
                  onChange={changeImageHandler}
                  className="w-full px-4 py-2 border rounded-md"
                />
                {image && (
                  <div className="mt-2">
                      <Image
                        src={image}
                        alt="Category"
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Featured</label>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-500"
                />
              </div>

            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gray-900 px-4 py-3 text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Update Category
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default CategoryManagement;