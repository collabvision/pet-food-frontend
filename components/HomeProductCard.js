"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useState } from "react";

export default function HomeProductCard({ product }) {
  const { addToCart } = useStore();
  const [adding, setAdding] = useState(false);

  const fallbackImage = "https://images.unsplash.com/photo-1589924691106-073b9fafa1e9?auto=format&fit=crop&w=900&q=90";

  const image =
    product.image ||
    product.images?.[0]?.url ||
    product.images?.[0]?.localUrl ||
    product.images?.[0] ||
    product.thumbnail ||
    fallbackImage;

  const name =
    product.name ||
    product.title ||
    "Pet Product";

  const price =
    product.price ??
    product.salePrice ??
    0;

  const originalPrice =
    product.originalPrice ??
    product.compareAtPrice ??
    null;

  const rating =
    product.rating ||
    4.8;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAdding(true);
      await addToCart(product._id, 1);
    } catch (error) {
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      href={`/products/${product.slug || product._id}`}
      className="group overflow-hidden rounded-[16px] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square bg-[#fffdfb] p-3">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Heart size={15} />
        </button>

        <img
          src={typeof image === "string" ? image : image?.url || fallbackImage}
          alt={name}
          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[34px] text-[11px] font-semibold leading-4 sm:text-xs">
          {name}
        </h3>

        <div className="mt-1 flex items-center gap-1">
          <div className="flex text-[#f5a623]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={10}
                fill="currentColor"
              />
            ))}
          </div>
          <span className="text-[9px] text-[#142653]/50">
            {rating}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold">
            ₹{Number(price).toLocaleString("en-IN")}
          </span>
          {originalPrice && (
            <span className="text-[10px] text-gray-400 line-through">
              ₹{Number(originalPrice).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={adding}
          onClick={handleAddToCart}
          className="mt-3 w-full rounded-md bg-[#ffe6df] py-2 text-[10px] font-bold text-[#d94e3b] hover:bg-[#ffcec2] disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}
