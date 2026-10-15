"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { FaSave } from "react-icons/fa";
import Loader from "@/components/loader";
import { addCategory } from "@/app/services/api";
import Image from "next/image";
import Link from "next/link";
import { ADMIN_SECRET_PATH } from "../../_components/AdminSidebar";

const AddCategory = () => {
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [featured, setFeatured] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addCategory({ name, slug, description, image, featured });
      setName("");
      setSlug("");
      setDescription("");
      setImage("");
      setFeatured(false);
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="w-full px-2 py-4 sm:px-4 md:px-8">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Link
              href={`/admin/${ADMIN_SECRET_PATH}/categories`}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Back to Categories
            </Link>

            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 border-b pb-2 sm:pb-3">
              Add Category
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="Category slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Category description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png, .gif, .bmp"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                />
                {image && (
                  <div className="mt-2 flex justify-center">
                    <Image
                      src={image}
                      alt="Preview"
                      width={96}
                      height={96}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Featured
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-base text-white transition-colors hover:bg-gray-800 sm:text-lg"
            >
              <FaSave className="inline-block mr-2" /> Add Category
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AddCategory;
