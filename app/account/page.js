"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, MapPin, Package, FileText, RefreshCcw, Heart, Bell, Settings, ArrowRight, MapPinned
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { orderService } from "@/lib/services";

export default function AccountPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const isAuthLoading = status === 'loading';
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    // AuthProvider automatically fetches user on mount, so no need for fetchUser() here.
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await orderService.getMyOrders();
        const rawOrders = res?.data || [];
        // Normalize date field
        setOrders(rawOrders.map(o => ({
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

  if (isAuthLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1e2338]"></div>
      </div>
    );
  }

  // Assuming mock user if not logged in just for UI demonstration based on the prompt
  const displayUser = user || { name: "Riya", email: "riya@example.com" };

  const sidebarLinks = [
    { name: "Overview", icon: <User className="w-5 h-5" />, active: true },
    { name: "Profile", icon: <User className="w-5 h-5" />, active: false },
    { name: "Addresses", icon: <MapPin className="w-5 h-5" />, active: false },
    { name: "My Orders", icon: <Package className="w-5 h-5" />, active: false },
    { name: "Prescriptions", icon: <FileText className="w-5 h-5" />, active: false },
    { name: "Returns & Refunds", icon: <RefreshCcw className="w-5 h-5" />, active: false },
    { name: "Wishlist", icon: <Heart className="w-5 h-5" />, active: false },
    { name: "Notifications", icon: <Bell className="w-5 h-5" />, active: false },
    { name: "Settings", icon: <Settings className="w-5 h-5" />, active: false },
  ];

  const quickActions = [
    { name: "Manage Addresses", icon: <MapPin className="w-6 h-6 text-[#0F5132]" /> },
    { name: "Upload Prescription", icon: <FileText className="w-6 h-6 text-[#0F5132]" /> },
    { name: "Track Orders", icon: <Truck className="w-6 h-6 text-[#0F5132]" /> },
    { name: "View Wishlist", icon: <Heart className="w-6 h-6 text-[#0F5132]" /> },
  ];

  // Helper function because Truck isn't imported from lucide-react in the top list, let's fix that inline
  const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#0F5132]"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v5c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>;
  
  // Re-define quick actions with custom icon to avoid import error
  const quickActionsFixed = [
    { name: "Manage Addresses", icon: <MapPinned className="w-6 h-6 text-[#0F5132]" /> },
    { name: "Upload Prescription", icon: <FileText className="w-6 h-6 text-[#0F5132]" /> },
    { name: "Track Orders", icon: <TruckIcon /> },
    { name: "View Wishlist", icon: <Heart className="w-6 h-6 text-[#0F5132]" /> },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Processing': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF9] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#1e2338]">My Account</h1>
            <p className="text-lg text-[#0F5132] font-semibold">Welcome back, {displayUser.name.split(' ')[0]}!</p>
          </div>
          
          <nav className="space-y-2">
            {sidebarLinks.map((link, idx) => (
              <button
                key={idx}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-left ${
                  link.active 
                    ? "bg-[#E8F5E9] text-[#0F5132]" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.icon}
                {link.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col gap-6">
          
          {/* Promotional Banner */}
          <div className="bg-[#D1F2EB] rounded-3xl p-6 relative overflow-hidden flex items-center shadow-sm">
             <div className="relative z-10 w-2/3">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0A3622] mb-1">A little care goes a long way</h2>
                <p className="text-[#0F5132] mb-4 text-sm font-medium">Discover dental treats your fur-friends will love.</p>
                <button className="bg-[#1e2338] text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-[#111424] transition-colors flex items-center gap-2 w-fit">
                   Explore Recommendations <ArrowRight className="w-4 h-4" />
                </button>
             </div>
             {/* Dog Image */}
             <div className="absolute right-0 bottom-0 w-1/3 h-[120%] translate-y-[10%]">
                <img 
                  src="https://images.unsplash.com/photo-1552053831-71594a27632d" 
                  alt="Dog" 
                  className="w-full h-full object-cover object-left-top rounded-[4rem_0_0_4rem]"
                />
             </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
             <h3 className="text-xl font-bold text-[#1e2338] mb-6">Recent Orders</h3>
             
             <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 gap-4">
                     <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
                           <img 
                             src={order.items[0]?.product?.image} 
                             alt={order.items[0]?.product?.name} 
                             className="w-full h-full object-cover"
                           />
                        </div>
                        <div className="min-w-0 flex-1">
                           <h4 className="font-bold text-[#1e2338] truncate">{order.items[0]?.product?.name}</h4>
                           <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto mt-2 sm:mt-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                           {order.status}
                        </span>
                        
                        <div className="text-right">
                           <p className="font-bold text-[#1e2338]">₹{order.totalAmount}</p>
                           <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                        
                        <Link 
                           href={`/order/track/${order.orderNumber}`}
                           className="border-2 border-gray-200 text-[#1e2338] px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                        >
                           View
                        </Link>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {quickActionsFixed.map((action, idx) => (
                <button key={idx} className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow gap-3 hover:-translate-y-1 transform duration-200">
                   {action.icon}
                   <span className="font-bold text-[#1e2338] text-sm">{action.name}</span>
                </button>
             ))}
          </div>

        </div>
      </div>
    </div>
  );
}
