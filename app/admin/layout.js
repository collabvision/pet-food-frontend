"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  LayoutDashboard, Package, FolderTree, Archive, ShoppingCart, 
  Users, FileText, RefreshCcw, CreditCard, Truck, Bell, 
  Tag, Users2, Plug, BarChart2, Settings, Search, HelpCircle, ChevronLeft,
  LogOut, Loader2, User
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, isAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Skip guard for /admin/login itself
  const isLoginPage = pathname === '/admin/login';
  const isAccountPage = pathname === '/admin/account';

useEffect(() => {
  if (isLoginPage || isAccountPage) return;
  if (status === 'loading') return;

  if (status === 'guest' || !isAdmin) {
    router.replace('/admin/login');
  }
}, [status, isAdmin, router, isLoginPage, isAccountPage]);

  // Show the login page directly (no sidebar needed)
  if (isLoginPage || isAccountPage) {
  return <>{children}</>;
}
  // if (isLoginPage) return <>{children}</>;

  // While checking auth, show a dark loader
  if (status === 'loading' || !isAdmin) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f172a',
      }}>
        <Loader2 size={40} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Products", href: "/admin/products", icon: <Package className="w-5 h-5" /> },
    { name: "Categories", href: "/admin/categories", icon: <FolderTree className="w-5 h-5" /> },
    { name: "Inventory", href: "/admin/inventory", icon: <Archive className="w-5 h-5" /> },
    { name: "Orders", href: "/admin/orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { name: "Customers", href: "/admin/customers", icon: <Users className="w-5 h-5" /> },
    { name: "Prescriptions", href: "/admin/prescriptions", icon: <FileText className="w-5 h-5" /> },
    { name: "Returns & Refunds", href: "/admin/returns", icon: <RefreshCcw className="w-5 h-5" /> },
    { name: "Payments", href: "/admin/payments", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Shipments", href: "/admin/shipments", icon: <Truck className="w-5 h-5" /> },
    { name: "Notifications", href: "/admin/notifications", icon: <Bell className="w-5 h-5" /> },
    { name: "Offers & Banners", href: "/admin/offers", icon: <Tag className="w-5 h-5" /> },
    { name: "Community", href: "/admin/community", icon: <Users2 className="w-5 h-5" /> },
    { name: "Integrations", href: "/admin/integrations", icon: <Plug className="w-5 h-5" /> },
    { name: "Reports", href: "/admin/reports", icon: <BarChart2 className="w-5 h-5" /> },
    { name: "My Account", href: "/admin/account", icon: <User className="w-5 h-5" /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-[#FDF8F5] overflow-hidden font-sans text-gray-800">
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm relative z-20`}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
           <div className="flex items-center gap-3 w-full">
              <div className="text-2xl font-black text-[#1e2338] relative flex shrink-0">
                 🐾 <span className="absolute -top-1 -right-2 text-xs text-red-500 bg-red-100 rounded-full w-4 h-4 flex items-center justify-center font-bold">2</span>
              </div>
              {sidebarOpen && (
                <div className="flex flex-col">
                  <span className="font-black text-xl text-[#1e2338] tracking-tight leading-none">FurNest</span>
                  <span className="text-[10px] text-gray-500 font-medium">Happy Pets. Happier Humans.</span>
                </div>
              )}
           </div>
        </div>

        {/* Scrollable Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
                  isActive 
                    ? "bg-red-50 text-red-900" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                {/* Visual marker for active state */}
                {isActive && <div className="absolute left-0 w-1 h-8 bg-red-500 rounded-r-full"></div>}
                <div className={`${isActive ? 'text-red-500' : 'text-gray-500'}`}>{item.icon}</div>
                {sidebarOpen && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Support Section */}
        <div className="p-4 border-t border-gray-100">
          <div className={`bg-[#E8F0FE] rounded-2xl p-4 relative overflow-hidden ${!sidebarOpen && 'hidden'}`}>
             <div className="absolute top-0 right-0 p-2 opacity-20">
                <HelpCircle className="w-12 h-12 text-blue-900" />
             </div>
             <div className="flex items-start gap-3 relative z-10">
                <div className="bg-blue-900 text-white p-2 rounded-xl mt-1">
                   <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-sm font-bold text-blue-900">Need Help?</p>
                   <p className="text-xs text-blue-700 flex items-center gap-1 mt-1 cursor-pointer hover:underline">
                     Contact Support <span>→</span>
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 relative z-10">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-lg"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen && 'rotate-180'}`} />
            </button>

            <div className="max-w-md w-full relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search products, orders, customers, prescriptions..." 
                 className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-shadow"
               />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-gray-600">
               <Bell className="w-6 h-6" />
               <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <AdminProfileDisplay user={user} onLogout={logout} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#FDF8F5]">
          {children}
        </main>
      </div>

    </div>
  );
}

function AdminProfileDisplay({ user, onLogout }) {
  const displayUser = user || { name: "Admin User", role: "ADMIN" };

  return (
    <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
       <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-[#1e2338]">{displayUser.name}</p>
          <p className="text-xs text-gray-500 font-medium uppercase">{displayUser.role || 'Admin'}</p>
       </div>
       <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
          <img src="https://i.pravatar.cc/80?u=admin" alt="Admin" className="w-full h-full object-cover" />
       </div>
       <button
         onClick={onLogout}
         title="Logout"
         className="text-gray-400 hover:text-red-500 transition-colors ml-1"
       >
         <LogOut className="w-5 h-5" />
       </button>
    </div>
  );
}
