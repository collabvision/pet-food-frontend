'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Eye,
  Heart,
  ShoppingBag,
  ArrowUpRight,
  Check,
} from 'lucide-react';

import { useStore } from '../store/useStore';

const BADGE_STYLES = {
  '20% OFF': 'bg-coral text-white',
  'Vet Approved': 'bg-forest text-white',
  Bestseller: 'bg-amber-500 text-white',
  Trending: 'bg-navy text-white',
  New: 'bg-coral text-white',
};

export default function ProductCard({ product }) {
  const {
    name,
    slug,
    price,
    compareAtPrice,
    rating,
    reviewCount,
    badge,
  } = product;

  const image =
    product.image ||
    product.images?.[0]?.url ||
    product.images?.[0]?.localUrl ||
    product.images?.[0] ||
    product.thumbnail;

  const { addToCart } = useStore();

  const [addingToCart, setAddingToCart] =
    useState(false);

  const [addedToCart, setAddedToCart] =
    useState(false);

  const [wishlisted, setWishlisted] =
    useState(false);

  const discount =
    compareAtPrice &&
    compareAtPrice > price
      ? Math.round(
          ((compareAtPrice - price) /
            compareAtPrice) *
            100
        )
      : null;

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!product?._id || addingToCart) {
      return;
    }

    try {
      setAddingToCart(true);

      await addToCart(product._id, 1);

      setAddedToCart(true);

      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to add item to cart'
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setWishlisted((current) => !current);
  };

  return (
    <article
      className="
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[22px]
        border
        border-navy/[0.08]
        bg-white
        shadow-[0_4px_20px_rgba(15,23,42,0.04)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-navy/[0.12]
        hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]
      "
    >
      {/* ─────────────────────────────────
          IMAGE AREA
      ───────────────────────────────── */}

      <div className="relative p-3 pb-0">
        <Link
          href={`/products/${slug}`}
          className="
            relative
            block
            aspect-square
            overflow-hidden
            rounded-[17px]
            bg-sand
          "
        >
          {/* Subtle background decoration */}

          <div
            className="
              pointer-events-none
              absolute
              -right-8
              -top-8
              z-[1]
              h-24
              w-24
              rounded-full
              bg-coral/10
              blur-xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-10
              -left-10
              z-[1]
              h-28
              w-28
              rounded-full
              bg-navy/5
              blur-xl
            "
          />

          {image ? (
            <Image
              src={
                typeof image === 'string'
                  ? image
                  : image?.url
              }
              alt={name || 'Pet product'}
              fill
              sizes="
                (max-width: 640px) 45vw,
                (max-width: 1280px) 25vw,
                280px
              "
              className="
                relative
                z-[2]
                object-contain
                p-5
                transition-transform
                duration-500
                ease-out
                group-hover:scale-[1.07]
              "
            />
          ) : (
            <div
              className="
                relative
                z-[2]
                flex
                h-full
                items-center
                justify-center
                text-5xl
              "
            >
              🐾
            </div>
          )}

          {/* Hover View Details */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-[4]
              flex
              items-end
              justify-center
              bg-gradient-to-t
              from-navy/35
              via-transparent
              to-transparent
              opacity-0
              transition-opacity
              duration-300
              group-hover:opacity-100
            "
          >
            <span
              className="
                mb-4
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-white/95
                px-4
                py-2
                text-xs
                font-semibold
                text-navy
                shadow-lg
                backdrop-blur
              "
            >
              <Eye size={14} />
              View Details
            </span>
          </div>
        </Link>

        {/* Badge */}

        {badge && (
          <span
            className={`
              absolute
              left-6
              top-6
              z-10
              rounded-full
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              shadow-sm
              ${
                BADGE_STYLES[badge] ||
                'bg-navy text-white'
              }
            `}
          >
            {badge}
          </span>
        )}

        {/* Discount badge */}

        {!badge && discount && (
          <span
            className="
              absolute
              left-6
              top-6
              z-10
              rounded-full
              bg-coral
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              text-white
              shadow-sm
            "
          >
            {discount}% OFF
          </span>
        )}

        {/* Wishlist */}

        <button
          type="button"
          aria-label={
            wishlisted
              ? `Remove ${name} from wishlist`
              : `Save ${name} to wishlist`
          }
          onClick={handleWishlist}
          className={`
            absolute
            right-6
            top-6
            z-10
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-white/95
            shadow-md
            backdrop-blur
            transition-all
            duration-200
            ${
              wishlisted
                ? 'text-coral'
                : 'text-navy/55 hover:text-coral'
            }
          `}
        >
          <Heart
            size={17}
            strokeWidth={1.8}
            fill={
              wishlisted
                ? 'currentColor'
                : 'none'
            }
          />
        </button>
      </div>

      {/* ─────────────────────────────────
          PRODUCT INFORMATION
      ───────────────────────────────── */}

      <div className="flex flex-1 flex-col px-4 pb-4 pt-4">
        {/* Product title */}

        <Link
          href={`/products/${slug}`}
          className="
            line-clamp-2
            min-h-[40px]
            text-sm
            font-semibold
            leading-5
            text-navy
            transition-colors
            hover:text-coral
          "
        >
          {name}
        </Link>

        {/* Rating */}

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <span className="text-[13px] text-amber-500">
              ★
            </span>

            <span className="text-xs font-semibold text-navy">
              {rating != null
                ? Number(rating).toFixed(1)
                : '—'}
            </span>
          </div>

          <span className="text-xs text-navy/35">
            •
          </span>

          <span className="text-xs text-navy/45">
            {reviewCount ?? 0} reviews
          </span>
        </div>

        {/* Price */}

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span
            className="
              text-lg
              font-bold
              tracking-tight
              text-navy
            "
          >
            ₹{formatPrice(price)}
          </span>

          {compareAtPrice &&
            compareAtPrice > price && (
              <>
                <span
                  className="
                    text-xs
                    text-navy/35
                    line-through
                  "
                >
                  ₹{formatPrice(compareAtPrice)}
                </span>

                {discount && (
                  <span
                    className="
                      text-[10px]
                      font-bold
                      text-coral
                    "
                  >
                    {discount}% OFF
                  </span>
                )}
              </>
            )}
        </div>

        {/* ─────────────────────────────
            ACTIONS
        ───────────────────────────── */}

        <div className="mt-4 flex gap-2">
          {/* View Details */}

          <Link
            href={`/products/${slug}`}
            className="
              flex
              min-w-0
              flex-1
              items-center
              justify-center
              gap-1.5
              rounded-xl
              border
              border-navy/15
              bg-white
              px-2
              py-2.5
              text-[11px]
              font-bold
              text-navy
              transition-all
              hover:border-navy
              hover:bg-navy
              hover:text-white
            "
          >
            <Eye size={14} />

            <span className="truncate">
              View Details
            </span>
          </Link>

          {/* Add To Cart */}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={addingToCart}
            className={`
              flex
              min-w-0
              flex-1
              items-center
              justify-center
              gap-1.5
              rounded-xl
              px-2
              py-2.5
              text-[11px]
              font-bold
              shadow-sm
              transition-all
              duration-200
              ${
                addedToCart
                  ? 'bg-green-600 text-white'
                  : 'bg-navy text-white hover:bg-navy/90 hover:shadow-md'
              }
              ${
                addingToCart
                  ? 'cursor-wait opacity-70'
                  : ''
              }
            `}
          >
            {addedToCart ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>
                  {addingToCart
                    ? 'Adding...'
                    : 'Add to Cart'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Small premium reassurance */}

        <div
          className="
            mt-3
            flex
            items-center
            justify-center
            gap-1.5
            border-t
            border-navy/[0.06]
            pt-3
            text-[10px]
            font-medium
            text-navy/40
          "
        >
          <span className="h-1 w-1 rounded-full bg-coral" />
          Quality products for happier pets
        </div>
      </div>
    </article>
  );
}

function formatPrice(value) {
  if (value == null) {
    return '—';
  }

  return Number(value).toLocaleString(
    'en-IN'
  );
}