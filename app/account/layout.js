"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Package, FileText, RefreshCcw, Heart, Bell, Settings, ArrowRight,
  LayoutDashboard, CreditCard, PawPrint, MapPin, LogOut
} from "lucide-react";

/* ─── Sidebar links ────────────────────────────────────── */
const SIDEBAR_LINKS = [
  { name: "Overview",             icon: LayoutDashboard, href: "/account" },
  { name: "Profile",              icon: PawPrint,        href: "/account/profile" },
  { name: "Addresses",            icon: MapPin,          href: "/account/addresses" },
  { name: "My Orders",            icon: Package,         href: "/account/orders" },
  { name: "Prescriptions",        icon: FileText,        href: "/account/prescriptions" },
  { name: "Returns & Refunds",    icon: RefreshCcw,      href: "/account/returns" },
  { name: "Wishlist",             icon: Heart,           href: "/account/wishlist" },
  { name: "Notifications",        icon: Bell,            href: "/account/notifications" },
  { name: "Settings",             icon: Settings,        href: "/account/settings" },
];

export default function AccountLayout({ children }) {
  const { user, status: authStatus, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authStatus === "guest") {
      router.push("/login");
    }
  }, [authStatus, router]);

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#142653]"></div>
      </div>
    );
  }

  if (authStatus === "guest") {
    return null; // Let the useEffect redirect
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">

        {/* ──── SIDEBAR ──── */}
        <aside className="lg:w-[260px] flex-shrink-0">
          {/* User Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50 mb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral to-orange-400 mx-auto mb-3 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {user?.name?.[0]?.toUpperCase() || "R"}
            </div>
            <h3 className="font-bold text-[#142653] text-lg">{user?.name || "User"}</h3>
            <p className="text-xs text-[#142653]/50 mb-3">{user?.email}</p>
            <Link href="/account/profile" className="text-xs font-bold text-coral hover:underline flex items-center justify-center gap-1">
              View Profile <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {SIDEBAR_LINKS.map((link) => {
              const Icon = link.icon;
              // Active if exact match or if it's the root /account and pathname is /account
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#142653] text-white shadow-md"
                      : "text-[#142653]/70 hover:bg-white hover:text-[#142653] hover:shadow-sm"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {link.name}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all mt-4"
            >
              <LogOut className="w-[18px] h-[18px]" />
              Logout
            </button>
          </nav>

          {/* Pet Banner */}
          <div className="mt-6 rounded-3xl overflow-hidden relative hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80"
              alt="Happy pets"
              className="w-full h-[200px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#142653] to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-black text-lg leading-tight">
                Pets make<br/>a better<br/>life! <Heart className="inline w-4 h-4 text-coral fill-coral" />
              </p>
            </div>
          </div>
        </aside>

        {/* ──── MAIN CONTENT ──── */}
        <div className="flex-1 min-w-0">
            {children}
        </div>
      </div>
    </div>
  );
}
