"use client";

import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { Product, Category } from "@/lib/types"; // Adjust the import based on your types
import { getProductBySlug, updateProduct, getCategories, removeProduct } from "@/app/services/api"; // Adjust the API service imports
import Loader from "@/components/loader";
import { ADMIN_SECRET_PATH } from "../../_components/AdminSidebar";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import VariantEditor from "@/components/admin/VariantEditor";
import type { ProductVariant } from "@/lib/types";
import { normalizeProductVariants, productVariantsSchema } from "@/lib/productVariants";

const ProductManagement = ({ params }: { params: { productSlug: string } }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string[]>([]);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string>(""); // State for selected category ID
  const [categoryOption, setCategoryOption] = useState<string>(""); // State for selected category name
  const [categories, setCategories] = useState<Category[]>([]); // State to hold categories
  const [fabric, setFabric] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [brand, setBrand] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [warranty, setWarranty] = useState("");
  const [specsText, setSpecsText] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantsTouched, setVariantsTouched] = useState(false);
  const [variantError, setVariantError] = useState("");
  const [description, setDescription] = useState<string>("");
  const [featured, setFeatured] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true); // Set loading to true when fetching
      try {
        const data = await getProductBySlug(params.productSlug);
        // console.log(data);
        setProduct(data.product);
        setName(data.product.name);
        setSlug(data.product.slug);
        setImage(data.product.image);
        setImages(data.product.images);
        setSize(data.product.size);
        setColor(data.product.color);
        setPrice(data.product.price);
        setQuantity(data.product.quantity);
        setCategoryId(data.category.id); // Set the category ID
        setCategoryOption(data.category.name); // Set the category name for display
        setFabric(data.product.fabric);
        setWeight(data.product.weight);
        setBrand(data.product.brand || "");
        setSubcategory(data.product.subcategory || "");
        setCompareAtPrice(data.product.compare_at_price?.toString() || "");
        setWarranty(data.product.warranty || "");
        setSpecsText(Object.entries(data.product.specs || {}).map(([key, value]) => `${key}: ${value}`).join("\n"));
        const legacySizes = Array.isArray(data.product.sizes) && data.product.sizes.length
          ? data.product.sizes
          : String(data.product.size || "").split(/[ ,]+/).filter(Boolean);
        const sourceVariants = data.product.variants?.length
          ? data.product.variants
          : legacySizes.map((legacySize: string) => ({ size: legacySize, color: "", stock: data.product.quantity }));
        const normalizedVariants = normalizeProductVariants(sourceVariants, { cost_price: Number(data.product.cost_price) || 0, selling_price: Number(data.product.price) || 0, stock_quantity: Number(data.product.quantity) || 0, is_active: data.product.is_active });
        setVariants(normalizedVariants);
        setVariantsTouched(false);
        setSize(normalizedVariants.map((variant) => variant.size).join(", "));
        setPrice(normalizedVariants.length ? Math.min(...normalizedVariants.map((variant) => Number(variant.selling_price))) : data.product.price);
        setQuantity(normalizedVariants.reduce((sum, variant) => sum + Number(variant.stock_quantity || 0), 0));
        setDescription(data.product.description);
        setFeatured(data.product.featured);
      } catch (error) {
        console.error("Error fetching product:", error);
        if (error === "Product not found") {
          // Redirect to the product list page if the product is not found
          router.push(`/admin/${ADMIN_SECRET_PATH}/products`);
        }
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProduct();
    fetchCategories(); // Fetch categories when the component mounts
  }, [params.productSlug, router]);

  const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
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

  const changeImagesHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      const imagesUrls = await Promise.all(filesArray.map(async file => {
        const base64 = await convertFileToBase64(file);
        return base64;
      }));
      setImages(prevImages => [...prevImages, ...imagesUrls]);
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

  const removeProductHandler = async () => {
    if (!product?.id) return;
    
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await removeProduct(product.id);
        router.push(`/admin/${ADMIN_SECRET_PATH}/products`);
      } catch (error) {
        console.error("Error removing product:", error);
      }
    }
  };

  const handleVariantsChange = (next: ProductVariant[]) => {
    setVariants(next);
    setVariantsTouched(true);
    setVariantError("");
    setSize(next.map((variant) => variant.size).join(", "));
    setQuantity(next.reduce((sum, variant) => sum + Number(variant.stock_quantity || 0), 0));
    const prices = next.filter((variant) => variant.is_active !== false).map((variant) => Number(variant.selling_price));
    if (prices.length) setPrice(Math.min(...prices));
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVariantError("");
    const updates: Partial<Product> & { categoryId?: string } = {};

    if (name !== product?.name) updates.name = name;
    if (slug !== product?.slug) updates.slug = slug;
    if (image !== product?.image) updates.image = image;
    if (images !== product?.images) updates.images = images;
    if (!variantsTouched && size !== product?.size) updates.size = size;
    if (color !== product?.color) updates.color = color;
    if (!variantsTouched && price !== product?.price) updates.price = price;
    if (!variantsTouched && quantity !== product?.quantity) updates.quantity = quantity;
    if (categoryId !== String(product?.category_id)) updates.categoryId = categoryId; // Update category ID
    if (fabric !== product?.fabric) updates.fabric = fabric;
    if (weight !== product?.weight) updates.weight = weight;
    if (brand !== (product?.brand || "")) updates.brand = brand;
    if (subcategory !== (product?.subcategory || "")) updates.subcategory = subcategory;
    if (compareAtPrice !== (product?.compare_at_price?.toString() || "")) updates.compare_at_price = compareAtPrice ? Number(compareAtPrice) : null;
    if (warranty !== (product?.warranty || "")) updates.warranty = warranty;
    const specs = Object.fromEntries(specsText.split("\n").map((line) => line.split(":")).filter(([key, value]) => key?.trim() && value?.trim()).map(([key, value]) => [key.trim(), value.trim()]));
    if (JSON.stringify(specs) !== JSON.stringify(product?.specs || {})) updates.specs = specs;
    if (variantsTouched) {
      const validation = productVariantsSchema.safeParse(variants);
      if (!validation.success) {
        setVariantError(validation.error.issues[0]?.message || "Please check each size variant.");
        return;
      }
      if (variants.some((variant) => Number(variant.selling_price) <= 0)) {
        setVariantError("Enter a selling price for every size.");
        return;
      }
      updates.variants = variants;
      updates.sizes = variants.map((variant) => variant.size);
      updates.size = variants[0]?.size || null;
      updates.quantity = variants.reduce((sum, variant) => sum + Number(variant.stock_quantity || 0), 0);
      if (variants.length) {
        const activePrices = variants.filter((variant) => variant.is_active).map((variant) => Number(variant.selling_price));
        if (activePrices.length) updates.price = Math.min(...activePrices);
        updates.cost_price = Math.min(...variants.map((variant) => Number(variant.cost_price || 0)));
      }
    }
    if (description !== product?.description) updates.description = description;
    if (featured !== product?.featured) updates.featured = featured;

    if (Object.keys(updates).length > 0) {
      // console.log(updates)
      await updateProduct({ ...updates, id: product?.id }); // Include product ID in the request body
      router.push(`/admin/${ADMIN_SECRET_PATH}/products`);
    }
  };

  if (loading) return <Loader />; // Use the Loader component while loading

  return (
    <div className="w-full px-2 py-4 sm:px-4 md:px-8">
      <main className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
        {/* Preview Section */}
        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Product Preview</h2>
            <span className="text-sm text-gray-500">ID: {product?.id}</span>
          </div>

          <div className="aspect-square w-full relative rounded-lg overflow-hidden bg-gray-100">
            {image && (
              <Image
                src={image}
                alt="Product"
                fill
                className="object-contain"
                sizes="100vw"
                style={{ objectFit: "contain" }}
              />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-700">Slug: {slug}</p>
            <p className="text-sm text-gray-700">Sizes: {variants.map((variant) => variant.size).join(", ") || "—"}</p>
            <p className="text-sm text-gray-700">Color: {color ? color.join(', ') : 'N/A'}</p>
            <p className="text-sm text-gray-700">Starting price: ₹{price}</p>
            <p className="text-sm text-gray-700">Total stock: {variants.reduce((sum, variant) => sum + Number(variant.stock_quantity || 0), 0)}</p>
            <p className="text-sm text-gray-700">Category: {categoryOption}</p>
            <p className="text-sm text-gray-700">Fabric: {fabric}</p>
            <p className="text-sm text-gray-700">Weight: {weight}</p>
            <p className="text-sm text-gray-700">Brand: {brand || "—"} · Subcategory: {subcategory || "—"}</p>
            <p className="text-sm text-gray-700">Compare-at price: {compareAtPrice ? `₹${compareAtPrice}` : "—"} · Warranty: {warranty || "—"}</p>
            <p className="text-sm text-gray-700">Description: {description}</p>
            <p className="text-sm text-gray-700">Featured: {featured ? 'Yes' : 'No'}</p>
          </div>
        </section>

        {/* Form Section */}
        <section className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <button className="absolute -top-2 -right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors" onClick={removeProductHandler}>
            <FaTrash className="w-4 h-4" />
          </button>

          <form onSubmit={submitHandler} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Manage Product</h2>

            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Slug Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="Product slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Category Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    const selectedCategory = categories.find(category => category.id === e.target.value);
                    setCategoryId(selectedCategory ? selectedCategory.id : "");
                    setCategoryOption(selectedCategory ? selectedCategory.name : "");
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id.toString()} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <VariantEditor variants={variants} onChange={handleVariantsChange} />
              {variantError && <p role="alert" className="oe-variant-error">{variantError}</p>}

              {/* Image Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  onChange={changeImageHandler}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {image && (
                  <div className="mt-2">
                    <Image
                      src={image}
                      alt="New Image"
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* Additional Images Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Images
                </label>
                <input
                  type="file"
                  multiple
                  onChange={changeImagesHandler}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                        />
                        <button
                          className="absolute top-0 right-0 m-1 p-1 bg-red-500 text-white rounded-full"
                          // onClick={() => removeImage(img)}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <textarea
                  placeholder="Comma separated colors"
                  value={color ? color.join(', ') : ''}
                  onChange={(e) => setColor(e.target.value.split(','))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Fabric Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fabric
                </label>
                <input
                  type="text"
                  placeholder="Product fabric"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Weight Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight
                </label>
                <input
                  type="text"
                  placeholder="Product weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <fieldset className="space-y-3 rounded-xl border border-gray-200 p-4">
                <legend className="px-2 text-sm font-semibold">Catalog details</legend>
                <input aria-label="Brand" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" />
                <input aria-label="Subcategory" placeholder="Subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" />
                <input aria-label="Compare at price" type="number" min="0" placeholder="Compare at price" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" />
                <input aria-label="Warranty" placeholder="Warranty" value={warranty} onChange={(e) => setWarranty(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" />
                <textarea aria-label="Product specifications" placeholder="Specifications (key: value per line)" value={specsText} onChange={(e) => setSpecsText(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </fieldset>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Featured Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured
                </label>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Update Product
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ProductManagement;
