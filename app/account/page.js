"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPinned, FileText, Truck, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { orderService } from "@/lib/services";

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await orderService.getMyOrders();
        const rawOrders = res?.data || [];
        setOrders(rawOrders.slice(0, 3).map(o => ({
          ...o,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
          status: o.orderStatus || 'Pending',
        })));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const displayUser = user || { name: "Riya", email: "riya@example.com" };

  const quickActions = [
    { name: "Manage Addresses", icon: <MapPinned className="w-6 h-6 text-coral" />, href: "/account/addresses" },
    { name: "Upload Prescription", icon: <FileText className="w-6 h-6 text-coral" />, href: "/account/prescriptions" },
    { name: "Track Orders", icon: <Truck className="w-6 h-6 text-coral" />, href: "/account/orders" },
    { name: "View Wishlist", icon: <Heart className="w-6 h-6 text-coral" />, href: "/account/wishlist" },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-700';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-700';
      case 'PROCESSING': return 'bg-orange-100 text-orange-700';
      case 'RETURN_REQUESTED': return 'bg-purple-100 text-purple-700';
      case 'RETURNED': return 'bg-gray-100 text-gray-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-amber-100 text-amber-700'; // Pending
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Mobile Only (Desktop has it in sidebar) */}
      <div className="lg:hidden mb-2">
        <h1 className="text-3xl font-black text-[#142653]">My Account</h1>
        <p className="text-[#142653]/70 font-semibold">Welcome back, {displayUser.name.split(' ')[0]}!</p>
      </div>

      {/* Promotional Banner */}
      <div className="bg-[#E6F4F1] rounded-3xl p-6 relative overflow-hidden flex items-center shadow-sm">
         <div className="relative z-10 w-2/3">
            <h2 className="text-xl sm:text-2xl font-black text-[#142653] mb-1">A little care goes a long way</h2>
            <p className="text-[#142653]/70 mb-4 text-sm font-semibold">Discover dental treats your fur-friends will love.</p>
            <button className="bg-[#142653] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#0c1733] transition-colors flex items-center gap-2 w-fit">
               Explore Recommendations <ArrowRight className="w-4 h-4" />
            </button>
         </div>
         {/* Dog Image */}
         <div className="absolute right-0 bottom-0 w-1/3 h-full flex items-end justify-end">
            <img 
              src="https://images.unsplash.com/photo-1552053831-71594a27632d" 
              alt="Dog" 
              className="w-full h-[150%] object-cover object-left-top rounded-[100px_0_0_100px] border-4 border-white shadow-lg translate-x-4 translate-y-4"
            />
         </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
         <div className="flex items-center justify-between mb-6">
           <h3 className="text-xl font-black text-[#142653]">Recent Orders</h3>
           <Link href="/account/orders" className="text-sm font-bold text-coral hover:underline">View All</Link>
         </div>
         
         {ordersLoading ? (
           <div className="flex justify-center items-center h-32">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-coral"></div>
           </div>
         ) : orders.length === 0 ? (
           <div className="text-center py-8 text-[#142653]/50 font-semibold">
             You haven't placed any orders yet.
           </div>
         ) : (
           <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl hover:bg-[#FFF8F5] transition-colors border border-gray-100 gap-4 group">
                   <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden shrink-0 shadow-sm p-1">
                         <img 
                           src={order.items[0]?.product?.images?.[0] || order.items[0]?.product?.image || "/placeholder.png"} 
                           alt={order.items[0]?.name || "Product"} 
                           className="w-full h-full object-contain rounded-lg"
                         />
                      </div>
                      <div className="min-w-0 flex-1">
                         <h4 className="font-bold text-[#142653] truncate">{order.items[0]?.name || "Multiple Items"}</h4>
                         <p className="text-xs text-[#142653]/50 font-semibold mt-0.5">Order #{order.orderNumber}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto mt-2 sm:mt-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${getStatusColor(order.status)}`}>
                         {order.status.replace("_", " ")}
                      </span>
                      
                      <div className="text-right">
                         <p className="font-black text-[#142653]">₹{order.totalAmount}</p>
                         <p className="text-[10px] font-bold text-[#142653]/40 mt-0.5">{order.date}</p>
                      </div>
                      
                      <Link 
                         href="/account/orders"
                         className="border-2 border-gray-100 text-[#142653] px-4 py-2 rounded-xl font-bold text-sm hover:border-coral hover:text-coral transition-colors"
                      >
                         View
                      </Link>
                   </div>
                </div>
              ))}
           </div>
         )}
      </div>

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {quickActions.map((action, idx) => (
            <Link key={idx} href={action.href} className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm border border-orange-50 hover:border-coral/30 hover:shadow-md transition-all gap-3 hover:-translate-y-1 transform duration-200">
               <div className="w-12 h-12 rounded-full bg-[#FFF8F5] flex items-center justify-center">
                 {action.icon}
               </div>
               <span className="font-bold text-[#142653] text-sm">{action.name}</span>
            </Link>
         ))}
      </div>

    </div>
  );
}
