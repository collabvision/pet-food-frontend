"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  BarChart3,
  Settings,
  Search,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Loader2,
  User,
  Menu,
  X,
  PawPrint,
} from "lucide-react";

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
    title: "Returns & Refunds",
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
    href: "/admin/shipping",
    icon: Truck,
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Offers & Banners",
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
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fffaf7]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#102f68] shadow-lg shadow-blue-900/10">
          <PawPrint className="h-7 w-7 text-white" />
        </div>

        <Loader2 className="h-6 w-6 animate-spin text-[#f97316]" />

        <p className="text-sm font-medium text-slate-500">
          Loading FurNest Admin...
        </p>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, status, isAdmin, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const redirecting = useRef(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;

    if (status === "loading") return;

    if (status === "authenticated" && isAdmin) {
      redirecting.current = false;
      return;
    }

    if (redirecting.current) return;

    redirecting.current = true;
    router.replace("/admin/login");
  }, [status, isAdmin, router, isLoginPage]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const activeMenu = useMemo(() => {
    if (pathname === "/admin") return "/admin";

    const matching = menuItems
      .filter((item) => item.href !== "/admin")
      .filter((item) => pathname.startsWith(item.href))
      .sort((a, b) => b.href.length - a.href.length);

    return matching[0]?.href || "";
  }, [pathname]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
    } finally {
      redirecting.current = false;
      router.replace("/admin/login");
    }
  };

  if (isLoginPage) {
    return children;
  }

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status !== "authenticated" || !isAdmin) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#fffaf7] text-[#102f68]">
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#102f68]/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={[
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[#e9e9ef] bg-white",
          "transition-all duration-300",
          sidebarOpen ? "w-[226px]" : "w-[78px]",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
          "shadow-[4px_0_30px_rgba(16,47,104,0.04)]",
        ].join(" ")}
      >
        {/* LOGO */}
        <div className="flex h-[72px] shrink-0 items-center border-b border-[#f0f0f3] px-4">
          {sidebarOpen ? (
            <Link
              href="/admin"
              className="flex min-w-0 items-center gap-3"
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#102f68] shadow-md shadow-blue-900/10">
                <PawPrint className="h-6 w-6 text-white" />

                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#f97316] ring-2 ring-white" />
              </div>

              <div className="min-w-0">
                <h1 className="text-[21px] font-black tracking-tight text-[#102f68]">
                  FurNest
                </h1>

                <p className="text-[10px] font-semibold tracking-wide text-[#7a8195]">
                  ADMIN PANEL
                </p>
              </div>
            </Link>
          ) : (
            <Link
              href="/admin"
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#102f68] text-white"
            >
              <PawPrint className="h-6 w-6" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeMenu === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group relative flex items-center gap-3 rounded-xl px-3 py-[10px]",
                    "text-[13px] font-semibold transition-all duration-200",
                    active
                      ? "bg-[#fff0eb] text-[#102f68] shadow-sm"
                      : "text-[#556079] hover:bg-[#faf7f5] hover:text-[#102f68]",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-7 w-[4px] -translate-y-1/2 rounded-r-full bg-[#102f68]" />
                  )}

                  <Icon
                    className={[
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      active
                        ? "text-[#102f68]"
                        : "text-[#657089] group-hover:text-[#102f68]",
                    ].join(" ")}
                  />

                  {sidebarOpen && (
                    <span className="truncate">{item.title}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* HELP */}
          {sidebarOpen && (
            <div className="mt-7 overflow-hidden rounded-2xl border border-[#f2e4dc] bg-gradient-to-br from-[#fff4ee] to-[#fff9f6] p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                <HelpCircle className="h-5 w-5 text-[#f97316]" />
              </div>

              <h3 className="text-sm font-extrabold text-[#102f68]">
                Need Help?
              </h3>

              <p className="mt-1 text-[11px] leading-5 text-[#737b8f]">
                Need assistance with your admin panel?
              </p>

              <button
                type="button"
                className="mt-3 text-[11px] font-bold text-[#f97316] hover:underline"
              >
                Contact Support →
              </button>
            </div>
          )}
        </div>

        {/* COLLAPSE */}
        <div className="hidden border-t border-[#f0f0f3] p-3 lg:block">
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-[#102f68]"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="h-4 w-4" />
                Collapse
              </>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div
        className={[
          "min-h-screen transition-[margin] duration-300",
          sidebarOpen ? "lg:ml-[226px]" : "lg:ml-[78px]",
        ].join(" ")}
      >
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#ececf1] bg-white/95 px-4 shadow-[0_3px_20px_rgba(16,47,104,0.035)] backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ededf1] bg-white text-[#102f68] shadow-sm lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* DESKTOP COLLAPSE */}
            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#102f68] lg:flex"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>

            {/* SEARCH */}
            <div className="hidden h-11 w-[340px] items-center gap-3 rounded-xl border border-[#e7e8ed] bg-[#fafbfc] px-4 transition focus-within:border-[#f97316]/40 focus-within:bg-white md:flex xl:w-[405px]">
              <Search className="h-[18px] w-[18px] shrink-0 text-[#8790a5]" />

              <input
                type="search"
                placeholder="Search products, orders, customers, prescriptions..."
                className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#102f68] outline-none placeholder:text-[#9aa1b2]"
              />

              <kbd className="hidden rounded-md border border-[#e3e5ea] bg-white px-1.5 py-0.5 text-[9px] font-semibold text-[#9298a8] xl:block">
                /
              </kbd>
            </div>

            <div className="md:hidden">
              <p className="text-[11px] font-semibold text-[#8a91a2]">
                FURNEST
              </p>
              <p className="text-sm font-extrabold text-[#102f68]">
                Admin Panel
              </p>
            </div>
          </div>

          {/* HEADER RIGHT */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* NOTIFICATION */}
            <Link
              href="/admin/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#59647d] transition hover:bg-[#fff4ee] hover:text-[#f97316]"
            >
              <Bell className="h-[19px] w-[19px]" />

              <span className="absolute right-[7px] top-[6px] flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f04444] px-1 text-[8px] font-black text-white ring-2 ring-white">
                5
              </span>
            </Link>

            <div className="hidden h-7 w-px bg-[#e8e8ed] sm:block" />

            {/* USER */}
            <Link
              href="/admin/account"
              className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition hover:bg-[#faf7f5] sm:gap-3 sm:px-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#102f68] text-white shadow-sm sm:h-10 sm:w-10">
                <User className="h-[18px] w-[18px]" />
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-[130px] truncate text-[12px] font-extrabold text-[#102f68]">
                  {user?.name || "Admin"}
                </p>

                <p className="max-w-[150px] truncate text-[10px] font-medium text-[#788197]">
                  {user?.email || "Super Admin"}
                </p>
              </div>
            </Link>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Logout"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#667087] transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
              ) : (
                <LogOut className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="min-h-[calc(100vh-72px)] px-3 py-4 sm:px-5 sm:py-5 xl:px-7 xl:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}