"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  Minus,
  Plus,
  Heart,
  Share2,
  Check,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { productService } from "@/lib/services";
import { useStore } from "@/store/useStore";
import Link from "next/link";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedImage, setSelectedImage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getBySlug(slug);
        if (res && res.success) {
          setProduct(res.data);
          if (res.data.unit) setSelectedSize(res.data.unit);
          if (res.data.images?.length > 0)
            setSelectedImage(res.data.images[0].url);
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAddingToCart(true);
      await addToCart(product._id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-800">Product not found</h1>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Placeholder sizes if product doesn't have multiple variations
  const sizes = product.unit
    ? [product.unit, "10 kg", "15 kg"]
    : ["3 kg", "10 kg", "15 kg"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center text-xs text-gray-500">
        <button
          onClick={() => router.back()}
          className="mr-3 flex items-center hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back
        </button>

        <Link href="/" className="hover:text-gray-900">
          Home
        </Link>

        <span className="mx-1.5">/</span>

        <Link href="/products" className="hover:text-gray-900">
          Dog Food
        </Link>

        <span className="mx-1.5">/</span>

        <span className="max-w-[220px] truncate font-medium text-gray-900">
          {product.name}
        </span>
      </nav>

      <div className="flex flex-col gap-7 lg:flex-row">
        {/* Product Images */}
        <div className="lg:w-1/2">
          <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <img
              src={
                selectedImage ||
                "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"
              }
              alt={product.name}
              className="h-full w-full object-contain drop-shadow-xl"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(product.images?.length > 0
              ? product.images
              : [{ url: selectedImage }]
            ).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img.url)}
                className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-gray-50 p-1.5 ${
                  selectedImage === img.url
                    ? "border-blue-600"
                    : "border-gray-200"
                }`}
              >
                <img
                  src={img.url}
                  alt={`${product.name} ${idx}`}
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-5 flex items-center justify-between border-b border-t border-gray-100 py-3">
            <div className="flex flex-col items-center gap-1 text-gray-600">
              <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                <Check className="h-5 w-5" />
              </div>

              <span className="text-[10px] font-medium text-center leading-tight">
                Vet
                <br />
                Recommended
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 text-gray-600">
              <div className="rounded-full bg-green-50 p-2 text-green-600">
                <Shield className="h-5 w-5" />
              </div>

              <span className="text-[10px] font-medium text-center leading-tight">
                100%
                <br />
                Original
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 text-gray-600">
              <div className="rounded-full bg-orange-50 p-2 text-orange-600">
                <Heart className="h-5 w-5" />
              </div>

              <span className="text-[10px] font-medium text-center leading-tight">
                Easy
                <br />
                Returns
              </span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col lg:w-1/2">
          <div className="flex items-start justify-between">
            <h1 className="mb-1 max-w-xl text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
              {product.name}
            </h1>

            <div className="ml-3 flex gap-2">
              <button className="text-gray-400 transition-colors hover:text-red-500">
                <Heart className="h-5 w-5" />
              </button>

              <button className="text-gray-400 transition-colors hover:text-blue-500">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>

            <span className="text-xs font-medium text-gray-500">
              {product.rating != null ? Number(product.rating).toFixed(1) : "—"} ({product.reviewCount ?? 0} reviews)
            </span>
          </div>

          <div className="mb-3 flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">
              ₹{product.price}
            </span>

            {product.compareAtPrice && (
              <>
                <span className="mb-0.5 text-base text-gray-400 line-through">
                  ₹{product.compareAtPrice}
                </span>

                <span className="mb-0.5 rounded bg-red-50 px-1.5 py-0.5 text-xs font-bold text-red-500">
                  {Math.round(
                    ((product.compareAtPrice - product.price) /
                      product.compareAtPrice) *
                      100,
                  )}
                  % OFF
                </span>
              </>
            )}
          </div>

          <p className="mb-4 text-sm leading-relaxed text-gray-600">
            {product.description ||
              "Complete and balanced nutrition for large breeds. Supports bone & joint health, digestive health and ideal weight."}
          </p>

          {/* Size */}
          <div className="mb-4">
            <h3 className="mb-2 flex items-center text-sm font-medium text-gray-900">
              Size
              <span className="ml-2 text-[11px] text-gray-400">(Clear)</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-lg border px-5 py-1.5 text-sm font-medium transition-all ${
                    selectedSize === size
                      ? "border-blue-900 bg-blue-900 text-white shadow-md"
                      : "border-gray-200 text-gray-700 hover:border-blue-900 hover:text-blue-900"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-gray-900">Quantity</h3>

            <div className="flex w-fit items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 text-gray-600 transition-colors hover:bg-gray-50"
              >
                <Minus className="h-4 w-4" />
              </button>

              <span className="w-10 text-center text-sm font-semibold text-gray-900">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2.5 text-gray-600 transition-colors hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-1 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold shadow-md transition-all active:scale-[0.98] ${
                addedToCart
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-blue-900 text-white hover:bg-blue-800"
              }`}
            >
              {addingToCart
                ? "Adding..."
                : addedToCart
                  ? "Added to Cart ✓"
                  : "Add to Cart"}
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-600 active:scale-[0.98]"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-2 rounded-lg border border-orange-100 bg-orange-50 p-2 text-xs font-medium text-orange-800">
            <span>⚡</span>
            Fast checkout process with FurNest. Free Delivery.
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-10 border-t border-gray-200 pt-5">
        <div className="mb-5 flex gap-6 overflow-x-auto border-b border-gray-200">
          {["Description", "Ingredients", "Feeding Guide", "Reviews"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`whitespace-nowrap pb-3 text-sm font-semibold transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? "border-b-2 border-blue-900 text-blue-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        <div className="flex flex-col items-center gap-5 py-2 text-gray-600 md:flex-row">
          <div className="space-y-2 md:w-1/2">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Supports bone & joint health
              </li>

              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Promotes ideal weight
              </li>

              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Highly digestible proteins
              </li>

              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Enriched with Omega fatty acids
              </li>
            </ul>
          </div>

          <div className="relative flex justify-center md:w-1/2">
            <div className="absolute z-10 rounded-xl bg-white/60 p-3 text-center text-2xl font-bold italic leading-tight text-blue-900 drop-shadow-md backdrop-blur-sm md:text-4xl">
              Stronger
              <br />
              Happier
              <br />
              Together <span className="text-red-500">♥</span>
            </div>

            <img
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1"
              alt="Happy Dog"
              className="w-full max-w-sm rounded-2xl opacity-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
