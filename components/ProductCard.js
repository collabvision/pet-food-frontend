'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IconHeart } from './Icons';
import { useStore } from '../store/useStore';
import { useState } from 'react';

const BADGE_STYLES = {
  '20% OFF': 'bg-coral text-white',
  'Vet Approved': 'bg-forest text-white',
  Bestseller: 'bg-amber-500 text-white',
  Trending: 'bg-navy text-white',
  New: 'bg-coral text-white',
};

export default function ProductCard({ product }) {
  const { name, slug, price, compareAtPrice, rating, reviewCount, badge } = product;
  const image = product.image || product.images?.[0]?.url || product.images?.[0]?.localUrl || product.images?.[0] || product.thumbnail;
  const { addToCart } = useStore();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!product || !product._id) return;
    try {
      setAddingToCart(true);
      await addToCart(product._id, 1);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || error?.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-navy/8 bg-white p-4 transition-shadow hover:shadow-lg">
      {badge && (
        <span className={`absolute left-4 top-4 z-10 rounded-pill px-2.5 py-1 text-[11px] font-semibold ${BADGE_STYLES[badge] || 'bg-navy text-white'}`}>
          {badge}
        </span>
      )}
      <button
        aria-label={`Save ${name} to wishlist`}
        className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy/60 shadow-sm hover:text-coral"
      >
        <IconHeart width={16} height={16} />
      </button>

      <Link href={`/products/${slug}`} className="relative mb-4 block aspect-square overflow-hidden rounded-xl bg-sand">
        {image ? (
          <Image src={typeof image === "string" ? image : image?.url} alt={name} fill sizes="240px" className="object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl" aria-hidden>🐾</div>
        )}
      </Link>

      <Link href={`/products/${slug}`} className="line-clamp-2 text-sm font-medium text-navy hover:text-coral">
        {name}
      </Link>

      <div className="mt-1 flex items-center gap-1 text-xs text-navy/60">
        <span aria-hidden>★</span>
        <span>{rating?.toFixed(1) ?? '—'}</span>
        <span>({reviewCount ?? 0})</span>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-semibold text-navy">₹{formatPrice(price)}</span>
        {compareAtPrice && compareAtPrice > price && (
          <span className="text-xs text-navy/40 line-through">₹{formatPrice(compareAtPrice)}</span>
        )}
      </div>

      <button 
        onClick={handleAddToCart}
        disabled={addingToCart}
        className={`mt-3 w-full py-2 text-xs rounded-xl shadow-lg font-bold transition-all ${addedToCart ? 'bg-green-600 text-white' : 'btn-primary'}`}
      >
        {addingToCart ? "Adding..." : addedToCart ? "Added ✓" : "Add to Cart"}
      </button>
    </div>
  );
}

function formatPrice(value) {
  if (value == null) return '—';
  return Number(value).toLocaleString('en-IN');
}
