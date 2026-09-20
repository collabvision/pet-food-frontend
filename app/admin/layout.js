"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

import {
  LayoutDashboard,
  Package,
  FolderTree,
  Archive,
  ShoppingCart,
  Users,
  FileText,
  RefreshCcw,
  CreditCard,
  Truck,
  Bell,
  Tag,
  Users2,
  Plug,
  BarChart2,
  Settings,
  Search,
  HelpCircle,
  ChevronLeft,
  LogOut,
  Loader2,
  User,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    status,
    isAdmin,
    logout,
  } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const redirecting = useRef(false);

  /*
   * Only the admin login page is public.
   *
   * Every other /admin/* route requires:
   * - authenticated user
   * - ADMIN role
   */
  const isLoginPage = pathname === "/admin/login";

  /*
   * Protect every admin page except /admin/login.
   */
useEffect(() => {
  if (isLoginPage) return;

  // Wait until authentication is completely initialized
  if (status === "loading") return;

  // Authenticated admin → allow access
  if (status === "authenticated" && isAdmin) {
    redirecting.current = false;
    return;
  }

  // Anything else → login
  if (status !== "authenticated" || !isAdmin) {
    if (redirecting.current) return;

    redirecting.current = true;
    router.replace("/admin/login");
  }
}, [status, isAdmin, router, isLoginPage]);
  /*
   * Admin login page does not need:
   * - sidebar
   * - admin header
   * - authentication guard
   */
  if (isLoginPage) {
    return <>{children}</>;
  }

  /*
   * While authentication is being checked,
   * don't render the admin application.
   */
  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
        }}
      >
        <Loader2
          size={40}
          color="#6366f1"
          style={{
            animation: "spin 1s linear infinite",
          }}
        />

        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  /*
   * If user is not an admin,
   * don't render the admin UI while redirecting.
   */
if (status !== "authenticated" || !isAdmin) {
      return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
        }}
      >
        <Loader2
          size={40}
          color="#6366f1"
          style={{
            animation: "spin 1s linear infinite",
          }}
        />

        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: FolderTree,
    },
    {
      title: "Inventory",
      href: "/admin/inventory",
      icon: Archive,
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Customers",
      href: "/admin/customers",
      icon: Users,
    },
    {
      title: "Prescriptions",
      href: "/admin/prescriptions",
      icon: FileText,
    },
    {
      title: "Returns",
      href: "/admin/returns",
      icon: RefreshCcw,
    },
    {
      title: "Payments",
      href: "/admin/payments",
      icon: CreditCard,
    },
    {
      title: "Shipments",
      href: "/admin/shipments",
      icon: Truck,
    },
    {
      title: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
    },
    {
      title: "Offers",
      href: "/admin/offers",
      icon: Tag,
    },
    {
      title: "Community",
      href: "/admin/community",
      icon: Users2,
    },
    {
      title: "Integrations",
      href: "/admin/integrations",
      icon: Plug,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: BarChart2,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      redirecting.current = false;
      router.replace("/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#1e2338]">
      {/* ================= SIDEBAR ================= */}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen border-r border-gray-200 bg-white transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}

        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-4">
          {sidebarOpen ? (
            <Link
              href="/admin"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e2338] text-white">
                <span className="text-lg font-bold">
                  F
                </span>
              </div>

              <div>
                <h1 className="text-lg font-bold text-[#1e2338]">
                  FurNest
                </h1>

                <p className="text-xs text-gray-500">
                  Admin Panel
                </p>
              </div>
            </Link>
          ) : (
            <Link
              href="/admin"
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e2338] text-white"
            >
              <span className="text-lg font-bold">
                F
              </span>
            </Link>
          )}
        </div>

        {/* Sidebar Menu */}

        <div className="h-[calc(100vh-80px)] overflow-y-auto px-3 py-5">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#1e2338] text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-[#1e2338]"
                  }`}
                >
                  <Icon
                    size={19}
                    className="shrink-0"
                  />

                  {sidebarOpen && (
                    <span>{item.title}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Help Card */}

          {sidebarOpen && (
            <div className="mt-8 rounded-2xl bg-[#eef2ff] p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                <HelpCircle
                  size={20}
                  className="text-[#4f46e5]"
                />
              </div>

              <h3 className="text-sm font-semibold text-[#1e2338]">
                Need Help?
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Check the admin documentation or contact support.
              </p>

              <button
                type="button"
                className="mt-3 text-xs font-semibold text-[#4f46e5] hover:underline"
              >
                View Documentation
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ================= MAIN AREA ================= */}

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* ================= HEADER ================= */}

        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 px-6 backdrop-blur">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle */}

            <button
              type="button"
              onClick={() =>
                setSidebarOpen((prev) => !prev)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-[#1e2338]"
            >
              <ChevronLeft
                size={20}
                className={`transition-transform ${
                  sidebarOpen ? "" : "rotate-180"
                }`}
              />
            </button>

            {/* Search */}

            <div className="hidden items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 md:flex">
              <Search
                size={18}
                className="text-gray-400"
              />

              <input
                type="text"
                placeholder="Search..."
                className="w-64 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Header Right */}

          <div className="flex items-center gap-4">
            {/* Notifications */}

            <Link
              href="/admin/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
            >
              <Bell size={19} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Link>

            {/* User */}

            <Link
              href="/admin/account"
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-gray-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e2338] text-white">
                <User size={18} />
              </div>

              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-[#1e2338]">
                  {user?.name || "Admin"}
                </p>

                <p className="text-xs text-gray-500">
                  {user?.email || ""}
                </p>
              </div>
            </Link>

            {/* Logout */}

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500"
              title="Logout"
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>

        {/* ================= PAGE CONTENT ================= */}

        <main className="min-h-[calc(100vh-80px)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}