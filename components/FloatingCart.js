'use client';

import { useStore } from '../store/useStore';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function FloatingCart() {
  const { cart } = useStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Don't show on cart or checkout pages
  if (pathname?.startsWith('/cart') || pathname?.startsWith('/checkout')) {
    return null;
  }

  if (!cart?.totalItems || cart.totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 md:pb-4 pointer-events-none">
      <div className="mx-auto max-w-7xl pointer-events-auto">
        <div className="flex items-center justify-between rounded-2xl bg-[#142653] px-6 py-4 text-white shadow-2xl shadow-navy/30 backdrop-blur-md bg-[#142653]/95 border border-white/10 md:w-[400px] md:ml-auto transition-all animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white shadow-sm">
                {cart.totalItems}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Total Items: {cart.totalItems}</span>
              <span className="text-lg font-bold">₹{cart.totalAmount?.toLocaleString('en-IN') || 0}</span>
            </div>
          </div>
          
          <Link 
            href="/cart" 
            className="flex items-center gap-2 rounded-xl bg-coral px-5 py-2.5 text-sm font-bold shadow-lg shadow-coral/25 transition-transform hover:-translate-y-0.5 active:scale-95 text-white"
          >
            View Cart
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
