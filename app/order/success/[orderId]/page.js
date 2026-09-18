"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { clearCart } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear cart upon successful order rendering, though backend usually handles it on checkout.
    // Assuming we just placed it.
    clearCart();
    
    // Simulate fetching order details to ensure it's valid
    const verifyOrder = async () => {
      try {
        setLoading(true);
        // Wait briefly just for effect, real app would fetch order by ID here
        // await api.get(`/orders/number/${orderId}`);
        await new Promise(r => setTimeout(r, 800));
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setLoading(false);
      }
    };
    
    verifyOrder();
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1e2338]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF9] relative overflow-hidden flex flex-col justify-center items-center font-sans py-12 px-4 sm:px-6">
      
      {/* Confetti / Decorative elements background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 overflow-hidden">
         {/* Top Left */}
         <div className="absolute top-[10%] left-[10%] w-6 h-6 bg-orange-400 rounded-full blur-[2px]"></div>
         <div className="absolute top-[20%] left-[20%] w-4 h-10 bg-red-400 rounded-full rotate-45 blur-[1px]"></div>
         <div className="absolute top-[30%] left-[5%] w-8 h-8 bg-blue-600 rounded-full -rotate-12 blur-[1px]"></div>
         <div className="absolute top-[40%] left-[25%] w-5 h-5 bg-yellow-400 rounded-full blur-[1px]"></div>
         <div className="absolute top-[50%] left-[10%] w-6 h-12 bg-green-500 rounded-full rotate-[60deg] blur-[1px]"></div>
         <div className="absolute top-[70%] left-[15%] w-8 h-8 bg-orange-500 rounded-full blur-[2px]"></div>
         
         {/* Top Right */}
         <div className="absolute top-[15%] right-[15%] w-5 h-12 bg-blue-600 rounded-full -rotate-45 blur-[1px]"></div>
         <div className="absolute top-[25%] right-[25%] w-7 h-7 bg-yellow-400 rounded-full blur-[1px]"></div>
         <div className="absolute top-[35%] right-[10%] w-6 h-6 bg-red-400 rounded-full blur-[1px]"></div>
         <div className="absolute top-[45%] right-[30%] w-4 h-10 bg-green-600 rounded-full rotate-[30deg] blur-[2px]"></div>
         <div className="absolute top-[60%] right-[12%] w-9 h-9 bg-orange-400 rounded-full blur-[1px]"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center">
        
        <h1 className="text-4xl sm:text-5xl font-black text-[#1e2338] mb-4">
          Order Placed!
        </h1>
        
        <p className="text-lg text-gray-600 font-medium mb-2">
          Thank you for choosing FurNest.
        </p>
        <p className="text-gray-500 mb-8">
          We've sent the order details to your email and WhatsApp.
        </p>
        
        <div className="bg-[#D1F2EB] text-[#0A3622] px-8 py-3 rounded-xl font-bold text-lg mb-10 shadow-sm border border-[#A3E4D7]">
          Order #{orderId || "FN123456"}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-16">
          <button 
            onClick={() => router.push(`/order/track/${orderId}`)}
            className="bg-[#1e2338] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#111424] transition-all shadow-lg min-w-[200px]"
          >
            View Order
          </button>
          <Link 
            href="/products" 
            className="bg-white border-2 border-gray-200 text-[#1e2338] px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm min-w-[200px]"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Happy Dog Banner */}
        <div className="relative w-full max-w-md mt-auto">
          <div className="absolute right-0 bottom-1/4 transform translate-x-10 translate-y-10 z-20 hidden sm:block">
            <h2 className="text-3xl font-bold text-[#1e2338] rotate-[-10deg] italic leading-tight">
              Wagging<br/>Tails<br/>Brighter<br/>Days! <span className="text-red-500 not-italic">♥</span>
            </h2>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1552053831-71594a27632d" 
            alt="Happy Golden Retriever" 
            className="w-full object-cover h-[300px] object-top rounded-[4rem_4rem_0_0] shadow-2xl relative z-10"
            style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
          />
          {/* Decorative leaves */}
          <div className="absolute bottom-10 left-0 -translate-x-4 z-20">
             <div className="w-16 h-24 bg-[#0F5132] rounded-[100%_0_100%_0] rotate-[-30deg] opacity-90 shadow-lg"></div>
             <div className="w-12 h-20 bg-[#198754] rounded-[100%_0_100%_0] absolute bottom-2 left-6 rotate-[15deg] opacity-90 shadow-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
