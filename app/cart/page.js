"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { cartService } from "@/lib/services";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [coupon, setCoupon] = useState("");

  const fetchCart = useCallback(async () => {
    try {
      setIsCartLoading(true);
      const res = await cartService.get();
      setCart(res?.data || null);
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setIsCartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    try {
      if (newQuantity < 1) {
        await cartService.removeItem(productId);
      } else {
        await cartService.updateItem(productId, newQuantity);
      }
      await fetchCart();
    } catch (err) {
      console.error("Cart update error:", err);
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clear();
      setCart(null);
    } catch (err) {
      console.error("Cart clear error:", err);
    }
  };



  if (isCartLoading && (!cart || !cart.items || cart.items.length === 0)) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FDF8F5]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#0F172A]"></div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;
  const gst = subtotal > 0 ? Math.round(subtotal * 0.18) : 0;
  const shipping = subtotal > 0 ? 0 : 0; // Free shipping
  const total = subtotal + gst + shipping;

  return (
    <div className="min-h-screen bg-[#FFFBF9] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl font-extrabold text-[#0F172A] flex items-center gap-3">
            Your Cart <span className="text-[#0F172A]">({cart?.totalItems || 0})</span>
          </h1>
          {items.length > 0 && (
            <button 
              onClick={handleClearCart} 
              className="text-red-500 font-semibold hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-orange-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link 
              href="/products" 
              className="inline-block bg-[#0F172A] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#1E293B] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product._id} className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-orange-50 flex items-center gap-4 sm:gap-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 rounded-2xl flex items-center justify-center p-2 border border-gray-100">
                    <img 
                      src={item.product.images?.[0]?.url || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119"} 
                      alt={item.product.name} 
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A] leading-tight mb-1">{item.product.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{item.product.unit || "Standard Size"}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                       <span className="text-xl font-black text-[#0F172A]">₹{item.price}</span>
                       <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                          <button 
                            onClick={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                            disabled={isCartLoading}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-bold text-[#0F172A]">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                            disabled={isCartLoading}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon & Summary Area */}
            <div className="bg-transparent mt-8">
              <h3 className="text-[#0F172A] font-bold mb-3">Apply Coupon</h3>
              <div className="flex gap-3 mb-8">
                <input 
                  type="text" 
                  placeholder="Enter coupon code" 
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-grow bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F5132] shadow-sm"
                />
                <button className="bg-[#0F5132] text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-[#0A3622] transition-colors">
                  Apply
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span className="text-[#0F172A] font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>GST (18%)</span>
                  <span className="text-[#0F172A] font-bold">₹{gst}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Shipping</span>
                  <span className="text-[#0F5132] font-bold">Free</span>
                </div>
                
                <div className="h-px bg-gray-200 my-4"></div>
                
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-extrabold text-[#0F172A]">Total</span>
                  <span className="text-3xl font-black text-[#0F172A]">₹{total}</span>
                </div>
              </div>

              <button 
                onClick={() => router.push('/checkout')}
                className="w-full bg-[#1e2338] text-white flex justify-center items-center py-5 rounded-2xl font-bold text-lg hover:bg-[#111424] transition-all shadow-xl active:scale-[0.98] relative overflow-hidden"
              >
                Proceed to Checkout
                <ArrowRight className="w-6 h-6 ml-2 absolute right-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
