"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Truck, MapPin, Search } from "lucide-react";
import { orderService, shippingService } from "@/lib/services";

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Try fetching by order number first, then fall back to ID
        let orderRes;
        try {
          orderRes = await orderService.getByOrderNumber(orderId);
        } catch {
          orderRes = await orderService.getById(orderId);
        }
        const orderData = orderRes?.data;
        setOrder(orderData);

        // Try to fetch shipment details
        if (orderData?._id) {
          try {
            const shipRes = await shippingService.getMy();
            const matched = shipRes?.data?.find(s => s.order === orderData._id || s.orderId === orderData._id);
            if (matched) setShipment(matched);
          } catch {
            // Shipment not found — that's OK
          }
        }
      } catch (err) {
        console.error("Failed to fetch order", err);
        setError("Could not load order. Please check the order number.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1e2338]"></div>
      </div>
    );
  }

  const steps = [
    { label: "Order Placed", status: "completed", date: order?.placedAt, icon: <Check className="w-5 h-5 text-white" /> },
    { label: "Processing", status: "completed", icon: <Check className="w-5 h-5 text-white" /> },
    { label: "Shipped", status: "current", icon: <Truck className="w-5 h-5 text-white" /> },
    { label: "Out for Delivery", status: "pending", icon: <Check className="w-5 h-5 text-[#0F5132]" /> },
    { label: "Delivered", status: "pending", icon: <Check className="w-5 h-5 text-[#0F5132]" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF9] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-gray-100 relative overflow-hidden">
          
          <h1 className="text-3xl font-extrabold text-[#1e2338] mb-2">Track Your Order</h1>
          <p className="text-lg text-[#0F5132] font-semibold mb-12">
            Order #{order?.orderNumber}
          </p>

          {/* Speech Bubble */}
          <div className="absolute top-10 right-10 hidden sm:flex bg-[#D1F2EB] text-[#0A3622] px-6 py-4 rounded-[2rem_2rem_0_2rem] font-bold text-center flex-col items-center shadow-sm">
            <span>On the way</span>
            <span>to more tail wags! <span className="text-xl">🐾</span></span>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-16 px-4">
             <div className="absolute top-6 left-0 right-0 h-1 bg-[#0F5132] rounded-full mx-8 z-0"></div>
             
             <div className="relative z-10 flex justify-between">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center border-[3px] mb-3 transition-colors ${
                       step.status === 'completed' || step.status === 'current' 
                        ? 'bg-[#0F5132] border-[#0F5132]' 
                        : 'bg-white border-[#0F5132]'
                     }`}>
                        {step.icon}
                     </div>
                     <span className={`text-sm font-bold text-center ${step.status === 'pending' ? 'text-gray-400' : 'text-[#1e2338]'}`}>
                        {step.label}
                     </span>
                     {step.date && (
                       <span className="text-xs text-gray-500 mt-1">{step.date}</span>
                     )}
                  </div>
                ))}
             </div>
          </div>

          {/* Delivery Van Illustration */}
          <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden mb-6 bg-gradient-to-b from-blue-50 to-green-50 flex items-end justify-center border border-gray-200">
             <img 
               src="https://images.unsplash.com/photo-1518770660439-4636190af475" // Mock landscape
               alt="Landscape" 
               className="absolute inset-0 w-full h-full object-cover opacity-20"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent"></div>
             
             {/* Mock Van */}
             <div className="relative z-10 w-64 h-32 bg-[#FF9F76] rounded-xl mb-12 shadow-xl border-b-4 border-orange-600 flex overflow-hidden">
                <div className="w-2/3 h-full flex flex-col justify-center items-center px-4 relative">
                   <div className="absolute top-2 left-2 text-white font-black opacity-30 text-4xl">🐾</div>
                   <h3 className="text-2xl font-black text-white z-10 drop-shadow-md tracking-wider">FurNest</h3>
                </div>
                <div className="w-1/3 h-full bg-[#FFE0D2] border-l-4 border-orange-500 flex justify-center items-center">
                   <div className="w-10 h-10 bg-gray-800 rounded-lg border-2 border-gray-600"></div> {/* Window */}
                </div>
                {/* Wheels */}
                <div className="absolute -bottom-4 left-6 w-10 h-10 bg-gray-800 rounded-full border-4 border-gray-300"></div>
                <div className="absolute -bottom-4 right-6 w-10 h-10 bg-gray-800 rounded-full border-4 border-gray-300"></div>
             </div>
          </div>

          {/* Map/Estimation Footer */}
          <div className="bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border border-gray-200">
             <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Estimated Delivery</p>
                <p className="text-2xl font-black text-[#1e2338]">{order?.estimatedDelivery}</p>
             </div>
             
             <button className="flex items-center gap-2 bg-white border-2 border-gray-200 text-[#1e2338] px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto justify-center">
                <MapPin className="w-5 h-5" />
                Track on Map
             </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
