"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { Category, Product } from "@/lib/types"; // Adjust the import based on your types
import { addProduct, getCategories } from "@/app/services/api"; // Adjust the API service imports
import Loader from "@/components/loader";
import Image from "next/image";
import Link from "next/link";
import { ADMIN_SECRET_PATH } from "../../_components/AdminSidebar";
import VariantEditor from "@/components/admin/VariantEditor";
import type { ProductVariant } from "@/lib/types";

const AddProduct = () => {
const [name, setName] = useState<string>("");
const [slug, setSlug] = useState<string>("");
const [image, setImage] = useState<string>("");
const [images, setImages] = useState<string[]>([]); // Changed from File[] to string[] for image URLs
const [size, setSize] = useState<string>("");
const [color, setColor] = useState<string[]>([]);
const [price, setPrice] = useState<number | undefined>(undefined);
const [quantity, setQuantity] = useState<number | undefined>(undefined);
const [categoryId, setCategoryId] = useState<string>("");
const [categoryOption, setCategoryOption] = useState<string>("");
const [fabric, setFabric] = useState<string>("");
const [weight, setWeight] = useState<string>("");
const [brand, setBrand] = useState("");
const [subcategory, setSubcategory] = useState("");
const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>();
const [warranty, setWarranty] = useState("");
const [specsText, setSpecsText] = useState("");
const [variants, setVariants] = useState<ProductVariant[]>([]);
const [formError, setFormError] = useState("");
const [description, setDescription] = useState<string>("");
const [featured, setFeatured] = useState<boolean>(false); // Changed from features to featured
const [photoFile, setPhotoFile] = useState<File | null>(null);
const [loading, setLoading] = useState<boolean>(false); // Loading state
const [selectedImage, setSelectedImage] = useState<string>(""); // State to keep track of the selected image for preview
const [categories, setCategories] = useState<Category[]>([]); // State to hold categories fetched from API

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const fetchedCategories = await getCategories();
      // console.log(fetchedCategories)
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  fetchCategories();
}, []);

const changeImageHandler = async (e: ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files) {
    const filesArray = Array.from(files);
    const imagesUrls = await Promise.all(filesArray.map(async file => {
      const base64 = await convertFileToBase64(file);
      // console.log(base64);
      return base64;
    }));
    if (filesArray.length > 0) {
      setImage(imagesUrls[0]); // Set the first image as the main image
      setPhotoFile(filesArray[0]);
      setSelectedImage(imagesUrls[0]); // Set the first image as the selected image for preview
    }
  }
};

const changeImagesHandler = async (e: ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files) {
    const filesArray = Array.from(files);
    const imagesUrls = await Promise.all(filesArray.map(async file => {
      const base64 = await convertFileToBase64(file);
      return base64;
    }));
    setImages(prevImages => [...prevImages, ...imagesUrls]); // Add new images to the existing array
    if (filesArray.length > 0) {
      setPhotoFile(filesArray[0]); // Set the first image as the photo file
      setSelectedImage(imagesUrls[0]); // Set the first image as the selected image for preview
    }
  }
};

const convertFileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleImagePreview = (imgUrl: string) => {
  setSelectedImage(imgUrl); // Update the selected image for preview
};

const removeImage = (imgUrl: string) => {
  setImages(prevImages => prevImages.filter(img => img !== imgUrl)); // Remove the selected image from the array
  if (selectedImage === imgUrl) {
    setSelectedImage(''); // Reset the selected image if the removed image was the selected one
  }
};

const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedCategory = categories.find(category => category.id === e.target.value);
  // console.log(selectedCategory);
  setCategoryId(selectedCategory ? selectedCategory.id : ""); // Use "" instead of null
  // console.log(selectedCategory?.id);
  setCategoryOption(e.target.value);
};

const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setFormError("");
  if (variants.length === 0) {
    setFormError("Add at least one size before saving this product.");
    return;
  }
  if (variants.some((variant) => Number(variant.selling_price) <= 0)) {
    setFormError("Enter a selling price for every size.");
    return;
  }
  setLoading(true); // Set loading to true when submitting
  try {
    const sellingPrices = variants.filter((variant) => variant.is_active !== false).map((variant) => Number(variant.selling_price));
    const basePrice = Math.min(...(sellingPrices.length ? sellingPrices : variants.map((variant) => Number(variant.selling_price))));
    const totalStock = variants.reduce((sum, variant) => sum + Number(variant.stock_quantity || 0), 0);
    await addProduct({
      name,
      slug,
      quantity: totalStock,
      image,
      images, // Assuming the API expects an array of image URLs
      size: variants[0]?.size || "",
      color,
      price: basePrice,
      cost_price: Math.min(...variants.map((variant) => Number(variant.cost_price || 0))),
      category_id: categoryId, // Send categoryId of selected category only
      // categoryOption, // Send categoryOption of selected category only
      fabric,
      weight,
      brand,
      subcategory,
      sizes: variants.map((variant) => variant.size),
      compare_at_price: compareAtPrice,
      warranty,
      specs: Object.fromEntries(specsText.split("\n").map((line) => line.split(":")).filter(([key, value]) => key?.trim() && value?.trim()).map(([key, value]) => [key.trim(), value.trim()])),
      variants,
      description,
      featured, // Changed from features to featured
    });
    // Clear all inputs after product is added
    setName("");
    setSlug("");
    setImage("");
    setImages([]);
    setSize("");
    setColor([]);
    setPrice(undefined);
    setQuantity(undefined);
    setCategoryId("");
    setCategoryOption("");
    setFabric("");
    setWeight("");
    setBrand("");
    setSubcategory("");
    setCompareAtPrice(undefined);
    setWarranty("");
    setSpecsText("");
    setVariants([]);
    setFormError("");
    setDescription("");
    setFeatured(false);
    setPhotoFile(null);
    setSelectedImage("");
  } catch (error) {
    console.error("Error adding product:", error);
  } finally {
    setLoading(false); // Set loading to false after submitting
  }
};

if (loading) return <Loader />; // Use the Loader component while loading

const fieldClass = "w-full rounded-lg border border-[var(--store-line)] bg-white px-4 py-2 text-sm text-[var(--store-ink)] outline-none transition focus:border-[var(--store-accent)] focus:ring-2 focus:ring-[var(--store-accent-soft)]";
const labelClass = "mb-1 block text-sm font-medium text-[var(--store-ink)]";


// console.log(categoryId)
return (
  <div className="w-full px-2 py-4 sm:px-4 md:px-8">
    <div className="mx-auto max-w-4xl">
      <section className="rounded-2xl border border-[var(--store-line)] bg-white p-4 shadow-sm sm:p-6">
        <form onSubmit={submitHandler} className="space-y-6">
          <Link
            href={`/admin/${ADMIN_SECRET_PATH}/products`}
            className="inline-flex items-center rounded-lg border border-[var(--store-line)] bg-white px-3 py-2 text-sm font-medium text-[var(--store-ink)] transition-colors hover:bg-[var(--store-accent-soft)]"
          >
            Back to Products
          </Link>

          <h2 className="border-b border-[var(--store-line)] pb-2 text-lg font-semibold text-[var(--store-ink)] sm:pb-3 sm:text-xl">Add Product</h2>
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
            </div>

            {/* Slug Input */}
            <div>
              <label className={labelClass}>Slug</label>
              <input
                type="text"
                placeholder="Product slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={fieldClass}
              />
            </div>

            {/* Image Input */}
            <div>
              <label className={labelClass}>Image</label>
              <input
                type="file"
                accept=".jpg, .jpeg, .png, .gif, .bmp"
                onChange={changeImageHandler}
                className={fieldClass}
              />
              {image && (
                <div className="mt-2 flex justify-center">
                  <Image
                    src={image}
                    alt="New Image"
                    width={96}
                    height={96}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Images Input */}
            <div>
              <label className={labelClass}>Images</label>
              <input
                type="file"
                multiple
                accept=".jpg, .jpeg, .png, .gif, .bmp"
                onChange={changeImagesHandler}
                className={fieldClass}
              />
              {images.length > 0 && (
                <div className="mt-2 flex flex-wrap">
                  {images.map((img, index) => (
                    <div key={index} className="relative m-1">
                      <Image
                        src={img}
                        alt={`Image ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-md"
                        onClick={() => handleImagePreview(img)}
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 m-1 p-1 bg-red-500 text-white rounded-full"
                        onClick={() => removeImage(img)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Color Input */}
            <div>
              <label className={labelClass}>
                Color
              </label>
              <textarea
                placeholder="Comma separated colors"
                value={color ? color.join(', ') : ''}
                onChange={(e) => setColor(e.target.value.split(','))}
                className={`${fieldClass} min-h-24`}
              />
            </div>

            {/* Category Input */}
            <div>
              <label className={labelClass}>
                Category
              </label>
              <select
                value={categoryOption}
                onChange={handleCategoryChange}
                className={fieldClass}
              >
                <option value="">Select a category</option>
                {categories.map((categoryOption) => (
                  <option key={categoryOption.id} value={categoryOption.id}>{categoryOption.name}</option>
                ))}
              </select>
            </div>

            {/* Fabric Input */}
            <div>
              <label className={labelClass}>
                Fabric
              </label>
              <input
                type="text"
                placeholder="Product fabric"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className={fieldClass}
              />
            </div>

            {/* Weight Input */}
            <div>
              <label className={labelClass}>
                Weight
              </label>
              <input
                type="text"
                placeholder="Product weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={fieldClass}
              />
            </div>

            {/* Description Input */}
            <fieldset className="space-y-4 rounded-xl border border-[var(--store-line)] p-4">
              <legend className="px-2 text-sm font-semibold">Catalog details</legend>
              <input aria-label="Brand" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} className={fieldClass} />
              <input aria-label="Subcategory" placeholder="Subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className={fieldClass} />
              <input aria-label="Compare at price" type="number" min="0" placeholder="Compare at price (optional)" value={compareAtPrice ?? ""} onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)} className={fieldClass} />
              <input aria-label="Warranty" placeholder="Warranty (e.g. 1 year)" value={warranty} onChange={(e) => setWarranty(e.target.value)} className={fieldClass} />
              <textarea aria-label="Product specifications" placeholder={'Specifications, one per line (key: value)\nBattery: 400 mAh'} value={specsText} onChange={(e) => setSpecsText(e.target.value)} className={`${fieldClass} min-h-20`} />
            </fieldset>
            <VariantEditor variants={variants} onChange={setVariants} />
            {/* Description Input */}
            <div>
              <label className={labelClass}>
                Description
              </label>
              <textarea
                placeholder="Product description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${fieldClass} min-h-28`}
              />
            </div>

            {/* Featured Input */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--store-line)] text-[var(--store-accent)] transition-colors focus:ring-2 focus:ring-[var(--store-accent-soft)] focus:border-[var(--store-accent)]"
              />
              <label className="ml-2 text-sm font-medium text-[var(--store-ink)]">
                Featured
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-[var(--store-accent)] px-4 py-2 text-base font-semibold text-white transition hover:bg-[#111a26] sm:py-3 sm:text-lg"
          >
            Add Product
          </button>
          {formError && <p role="alert" className="oe-variant-error">{formError}</p>}
        </form>
      </section>
    </div>
  </div>
);
};

export default AddProduct;
