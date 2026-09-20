"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  IndianRupee,
  Users,
  Package,
  AlertTriangle,
  RefreshCcw,
  Plus,
  LayoutGrid,
  ListOrdered,
  FileText,
  Send,
  Archive,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
  CircleDollarSign,
  RotateCcw,
  Loader2,
  PawPrint,
  Boxes,
  CalendarDays,
} from "lucide-react";
import {
  orderService,
  productService,
  inventoryService,
  prescriptionService,
  returnService,
  categoryService,
} from "@/lib/services";

function unwrap(response) {
  if (!response) return [];

  if (Array.isArray(response)) return response;

  if (Array.isArray(response.data)) return response.data;

  if (Array.isArray(response.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response.data?.results)) {
    return response.data.results;
  }

  if (Array.isArray(response.items)) return response.items;

  if (Array.isArray(response.results)) return response.results;

  return [];
}

function getObject(response) {
  if (!response) return {};

  if (response.data && !Array.isArray(response.data)) {
    return response.data;
  }

  return response;
}

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatNumber(value = 0) {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
}

function getOrderAmount(order) {
  return (
    Number(
      order?.totalAmount ??
        order?.total ??
        order?.grandTotal ??
        order?.amount ??
        order?.pricing?.total ??
        0
    ) || 0
  );
}

function getOrderItems(order) {
  return (
    order?.items?.length ||
    order?.orderItems?.length ||
    order?.products?.length ||
    0
  );
}

function getCustomerName(order) {
  return (
    order?.user?.name ||
    order?.customer?.name ||
    order?.user?.fullName ||
    order?.customerName ||
    "Guest"
  );
}

function getOrderStatus(order) {
  return String(
    order?.orderStatus ||
      order?.status ||
      order?.order_state ||
      "PENDING"
  ).toUpperCase();
}

function getProductName(product) {
  return (
    product?.name ||
    product?.title ||
    product?.productName ||
    "Unnamed Product"
  );
}

function getProductImage(product) {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const first = product.images[0];

    if (typeof first === "string") return first;

    return first?.url || first?.secure_url || first?.src || "";
  }

  return product?.image || product?.thumbnail || "";
}

function getInventoryStock(item) {
  return Number(
    item?.stock ??
      item?.quantity ??
      item?.availableStock ??
      item?.currentStock ??
      item?.inventory?.stock ??
      0
  );
}

function getInventoryProduct(item) {
  return (
    item?.product ||
    item?.productId ||
    item?.productDetails ||
    item?.item ||
    {}
  );
}

function normalizeStatus(status) {
  return String(status || "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClasses(status) {
  const value = String(status || "").toUpperCase();

  if (value.includes("DELIVER")) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }

  if (value.includes("SHIP")) {
    return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
  }

  if (value.includes("PROCESS")) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  }

  if (value.includes("CANCEL")) {
    return "bg-red-50 text-red-700 ring-1 ring-red-100";
  }

  if (value.includes("RETURN")) {
    return "bg-purple-50 text-purple-700 ring-1 ring-purple-100";
  }

  if (value.includes("PENDING")) {
    return "bg-orange-50 text-orange-700 ring-1 ring-orange-100";
  }

  return "bg-slate-50 text-slate-600 ring-1 ring-slate-100";
}

function Card({ children, className = "" }) {
  return (
    <section
      className={[
        "rounded-[22px] border border-[#eeeef2] bg-white shadow-[0_5px_25px_rgba(16,47,104,0.045)]",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
  action = "View All",
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-extrabold tracking-tight text-[#102f68] sm:text-[17px]">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-0.5 text-[10px] font-medium text-[#8a91a2] sm:text-[11px]">
            {subtitle}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#17468f] transition hover:bg-[#fff4ee] hover:text-[#f97316]"
        >
          {action}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendText,
  trendPositive = true,
  note,
}) {
  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-[#eeeef2] bg-white p-4 shadow-[0_5px_20px_rgba(16,47,104,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(16,47,104,0.08)] sm:p-5">
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-slate-50 opacity-60 transition group-hover:scale-125" />

      <div className="relative flex items-center gap-3">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            iconBg,
          ].join(" ")}
        >
          <Icon className={["h-[19px] w-[19px]", iconColor].join(" ")} />
        </div>

        <p className="min-w-0 text-[10px] font-bold leading-4 text-[#737c90] sm:text-[11px]">
          {label}
        </p>
      </div>

      <div className="relative mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[21px] font-black tracking-tight text-[#102f68] sm:text-[23px]">
            {value}
          </p>

          {note && (
            <p className="mt-1 text-[9px] font-bold text-[#f97316]">
              {note}
            </p>
          )}
        </div>

        {trendText && (
          <div
            className={[
              "flex items-center gap-1 text-[10px] font-extrabold",
              trendPositive ? "text-emerald-600" : "text-red-500",
            ].join(" ")}
          >
            {trendPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {trendText}
          </div>
        )}
      </div>

      {trend && (
        <p className="relative mt-1 text-[9px] font-medium text-[#a0a5b2]">
          {trend}
        </p>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex min-h-[170px] flex-col items-center justify-center text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff5ef]">
        <Icon className="h-5 w-5 text-[#f97316]" />
      </div>

      <p className="mt-3 text-xs font-semibold text-[#8990a0]">
        {text}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [returns, setReturns] = useState([]);
  const [categories, setCategories] = useState([]);

  const [period, setPeriod] = useState("30");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);

      const [
        ordersResponse,
        productsResponse,
        inventoryResponse,
        prescriptionResponse,
        returnsResponse,
        categoriesResponse,
      ] = await Promise.allSettled([
        orderService.adminGetAll(),
        productService.getAll(),
        inventoryService.getAll(),
        prescriptionService.adminGetAll(),
        returnService.adminGetAll(),
        categoryService.getAll(),
      ]);

      if (!mounted) return;

      if (ordersResponse.status === "fulfilled") {
        setOrders(unwrap(ordersResponse.value));
      }

      if (productsResponse.status === "fulfilled") {
        setProducts(unwrap(productsResponse.value));
      }

      if (inventoryResponse.status === "fulfilled") {
        setInventory(unwrap(inventoryResponse.value));
      }

      if (prescriptionResponse.status === "fulfilled") {
        setPrescriptions(unwrap(prescriptionResponse.value));
      }

      if (returnsResponse.status === "fulfilled") {
        setReturns(unwrap(returnsResponse.value));
      }

      if (categoriesResponse.status === "fulfilled") {
        setCategories(unwrap(categoriesResponse.value));
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const dashboard = useMemo(() => {
    const revenue = orders.reduce(
      (sum, order) => sum + getOrderAmount(order),
      0
    );

    const uniqueCustomers = new Set(
      orders
        .map(
          (order) =>
            order?.user?._id ||
            order?.user?.id ||
            order?.customer?._id ||
            order?.customer?.id ||
            order?.userId ||
            order?.customerId ||
            order?.email
        )
        .filter(Boolean)
    );

    const pendingPrescriptions = prescriptions.filter((item) => {
      const status = String(item?.status || "").toUpperCase();

      return (
        status === "PENDING" ||
        status === "PENDING_REVIEW" ||
        status === "UNDER_REVIEW"
      );
    });

    const pendingReturns = returns.filter((item) => {
      const status = String(item?.status || item?.returnStatus || "")
        .toUpperCase();

      return (
        status === "PENDING" ||
        status === "REQUESTED" ||
        status === "UNDER_REVIEW"
      );
    });

    const lowStock = inventory
      .map((item) => {
        const product = getInventoryProduct(item);

        return {
          ...item,
          product,
          stock: getInventoryStock(item),
        };
      })
      .filter((item) => {
        const threshold = Number(
          item?.lowStockThreshold ??
            item?.threshold ??
            item?.product?.lowStockThreshold ??
            10
        );

        return item.stock <= threshold;
      })
      .sort((a, b) => a.stock - b.stock);

    const statusMap = {};

    orders.forEach((order) => {
      const status = getOrderStatus(order);

      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    return {
      revenue,
      customers: uniqueCustomers.size,
      orders: orders.length,
      products: products.length,
      categories: categories.length,
      pendingPrescriptions: pendingPrescriptions.length,
      pendingReturns: pendingReturns.length,
      lowStock,
      statusMap,
    };
  }, [
    orders,
    products,
    inventory,
    prescriptions,
    returns,
    categories,
  ]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b?.createdAt || 0) -
          new Date(a?.createdAt || 0)
      )
      .slice(0, 6);
  }, [orders]);

  const statusData = useMemo(() => {
    const statuses = [
      {
        key: "DELIVERED",
        label: "Delivered",
        color: "#16A34A",
        Icon: CheckCircle2,
      },
      {
        key: "SHIPPED",
        label: "Shipped",
        color: "#2563EB",
        Icon: Truck,
      },
      {
        key: "PROCESSING",
        label: "Processing",
        color: "#F59E0B",
        Icon: Package,
      },
      {
        key: "CANCELLED",
        label: "Cancelled",
        color: "#EF4444",
        Icon: XCircle,
      },
      {
        key: "RETURNED",
        label: "Returned",
        color: "#8B5CF6",
        Icon: RotateCcw,
      },
    ];

    return statuses.map((item) => ({
      ...item,
      value: dashboard.statusMap[item.key] || 0,
    }));
  }, [dashboard.statusMap]);

  const totalStatusOrders = statusData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const topLowStock = dashboard.lowStock.slice(0, 5);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const currentDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1700px] space-y-5">
      {/* WELCOME */}
      <section className="relative min-h-[178px] overflow-hidden rounded-[24px] border border-[#ffe4d8] bg-gradient-to-r from-[#fff1e9] via-[#fff8f4] to-[#eaf4ff] px-5 py-6 shadow-[0_6px_30px_rgba(16,47,104,0.04)] sm:px-7 sm:py-7 lg:min-h-[185px]">
        {/* Decorative circles */}
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/70" />
        <div className="absolute -bottom-28 left-[40%] h-64 w-64 rounded-full bg-[#fbd7c5]/20" />

        <div className="relative z-10 flex h-full flex-col justify-center">
          <div className="max-w-[620px]">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#ffdccc] bg-white/70 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#f97316]">
              <PawPrint className="h-3 w-3" />
              FurNest Administration
            </div>

            <h1 className="text-[27px] font-black leading-tight tracking-[-0.03em] text-[#102f68] sm:text-[34px] lg:text-[38px]">
              {greeting}, Admin!
            </h1>

            <p className="mt-1 text-[12px] font-medium text-[#5e687e] sm:text-[13px]">
              Here&apos;s what&apos;s happening at FurNest today.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#102f68] px-4 py-2.5 text-[10px] font-extrabold text-white shadow-md shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#173f80]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Product
            </Link>

            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-xl border border-white bg-white/80 px-4 py-2.5 text-[10px] font-extrabold text-[#102f68] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              View Orders
            </Link>
          </div>
        </div>

        {/* DESKTOP DECORATION */}
        <div className="absolute right-[24%] top-1/2 hidden -translate-y-1/2 xl:block">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="rotate-[-4deg] text-[16px] font-black leading-tight text-[#102f68]">
                More Wags
              </p>
              <p className="rotate-[-4deg] text-[16px] font-black leading-tight text-[#102f68]">
                More Smiles
              </p>
              <p className="rotate-[-4deg] text-[16px] font-black leading-tight text-[#102f68]">
                More Impact
              </p>
            </div>

            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#ffe4d5]">
              <span className="text-6xl">🐶</span>
            </div>
          </div>
        </div>

        {/* DATE */}
        <div className="absolute right-5 top-5 hidden rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:block">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff1e9]">
              <CalendarDays className="h-4 w-4 text-[#f97316]" />
            </div>

            <div>
              <p className="text-[10px] font-extrabold text-[#102f68]">
                {currentDate}
              </p>

              <p className="mt-0.5 text-[9px] font-medium text-[#8a91a2]">
                Have a productive day!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard
          label="Total Orders"
          value={loading ? "—" : formatNumber(dashboard.orders)}
          icon={ShoppingCart}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          trend="+12% vs last month"
          trendText={dashboard.orders ? "Live" : ""}
          trendPositive
        />

        <StatCard
          label="Total Revenue"
          value={loading ? "—" : formatCurrency(dashboard.revenue)}
          icon={IndianRupee}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend="Based on available orders"
          trendText={dashboard.revenue ? "Live" : ""}
          trendPositive
        />

        <StatCard
          label="Customers"
          value={loading ? "—" : formatNumber(dashboard.customers)}
          icon={Users}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend="Unique customers in orders"
          trendText={dashboard.customers ? "Live" : ""}
          trendPositive
        />

        <StatCard
          label="Total Products"
          value={loading ? "—" : formatNumber(dashboard.products)}
          icon={Package}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          trend="Current catalog"
          trendText={dashboard.products ? "Live" : ""}
          trendPositive
        />

        <StatCard
          label="Pending Prescriptions"
          value={
            loading ? "—" : formatNumber(dashboard.pendingPrescriptions)
          }
          icon={AlertTriangle}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          note={
            dashboard.pendingPrescriptions > 0
              ? "Needs review"
              : "All reviewed"
          }
        />

        <StatCard
          label="Return Requests"
          value={loading ? "—" : formatNumber(dashboard.pendingReturns)}
          icon={RefreshCcw}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend="Awaiting admin action"
          trendText={
            dashboard.pendingReturns > 0 ? "Action" : ""
          }
          trendPositive={false}
        />
      </section>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.95fr)]">
        {/* LEFT */}
        <div className="min-w-0 space-y-5">
          {/* CHARTS */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
            {/* SALES */}
            <Card className="overflow-hidden p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-extrabold text-[#102f68]">
                    Sales Overview
                  </h2>

                  <p className="mt-0.5 text-[10px] font-medium text-[#8b92a2]">
                    Revenue and order trends from your live orders
                  </p>
                </div>

                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="rounded-xl border border-[#e7e8ed] bg-[#fafbfc] px-3 py-2 text-[10px] font-bold text-[#526079] outline-none focus:border-[#f97316]/40"
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </select>
              </div>

              {loading ? (
                <div className="flex h-[270px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#f97316]" />
                </div>
              ) : orders.length === 0 ? (
                <EmptyState
                  icon={CircleDollarSign}
                  text="No order data available yet."
                />
              ) : (
                <div className="grid h-[270px] grid-cols-1 gap-3">
                  <div className="flex items-end gap-1 overflow-hidden rounded-2xl bg-gradient-to-t from-[#fff5ef] to-white px-3 pb-3 pt-8">
                    {recentOrders.length > 0
                      ? recentOrders
                          .slice()
                          .reverse()
                          .map((order, index) => {
                            const amount = getOrderAmount(order);

                            const maxAmount = Math.max(
                              ...recentOrders.map(getOrderAmount),
                              1
                            );

                            const height = Math.max(
                              12,
                              (amount / maxAmount) * 82
                            );

                            return (
                              <div
                                key={order?._id || index}
                                className="group flex h-full flex-1 flex-col justify-end"
                              >
                                <div className="relative">
                                  <div
                                    className="mx-auto w-[65%] min-w-[10px] rounded-t-lg bg-gradient-to-t from-[#f97316] to-[#fbad78] transition-all duration-300 group-hover:from-[#102f68] group-hover:to-[#4f77b5]"
                                    style={{
                                      height: `${height}%`,
                                      minHeight: "12px",
                                    }}
                                  />

                                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#102f68] px-2 py-1 text-[8px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                                    {formatCurrency(amount)}
                                  </div>
                                </div>

                                <span className="mt-2 truncate text-center text-[8px] font-semibold text-[#9299a8]">
                                  {new Intl.DateTimeFormat("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                  }).format(
                                    new Date(order?.createdAt || Date.now())
                                  )}
                                </span>
                              </div>
                            );
                          })
                      : null}
                  </div>
                </div>
              )}
            </Card>

            {/* ORDER STATUS */}
            <Card className="p-5 sm:p-6">
              <SectionHeader
                title="Order Status"
                subtitle="Current order distribution"
                href="/admin/orders"
              />

              {loading ? (
                <div className="flex h-[250px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#f97316]" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center py-2">
                    <div
                      className="relative flex h-[170px] w-[170px] items-center justify-center rounded-full"
                      style={{
                        background: `conic-gradient(
                          ${statusData[0]?.color || "#16A34A"} 0deg ${(statusData[0]?.value / Math.max(totalStatusOrders, 1)) * 360}deg,
                          ${statusData[1]?.color || "#2563EB"} ${(statusData.slice(0, 1).reduce((sum, x) => sum + x.value, 0) / Math.max(totalStatusOrders, 1)) * 360}deg ${((statusData.slice(0, 2).reduce((sum, x) => sum + x.value, 0)) / Math.max(totalStatusOrders, 1)) * 360}deg,
                          ${statusData[2]?.color || "#F59E0B"} ${((statusData.slice(0, 2).reduce((sum, x) => sum + x.value, 0)) / Math.max(totalStatusOrders, 1)) * 360}deg ${((statusData.slice(0, 3).reduce((sum, x) => sum + x.value, 0)) / Math.max(totalStatusOrders, 1)) * 360}deg,
                          ${statusData[3]?.color || "#EF4444"} ${((statusData.slice(0, 3).reduce((sum, x) => sum + x.value, 0)) / Math.max(totalStatusOrders, 1)) * 360}deg ${((statusData.slice(0, 4).reduce((sum, x) => sum + x.value, 0)) / Math.max(totalStatusOrders, 1)) * 360}deg,
                          ${statusData[4]?.color || "#8B5CF6"} ${((statusData.slice(0, 4).reduce((sum, x) => sum + x.value, 0)) / Math.max(totalStatusOrders, 1)) * 360}deg 360deg
                        )`,
                      }}
                    >
                      <div className="flex h-[112px] w-[112px] flex-col items-center justify-center rounded-full bg-white">
                        <span className="text-[24px] font-black text-[#102f68]">
                          {formatNumber(totalStatusOrders)}
                        </span>

                        <span className="text-[9px] font-bold uppercase tracking-wide text-[#9097a6]">
                          Orders
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 space-y-2">
                    {statusData.map((item) => {
                      const percentage =
                        totalStatusOrders > 0
                          ? Math.round(
                              (item.value / totalStatusOrders) * 100
                            )
                          : 0;

                      return (
                        <div
                          key={item.key}
                          className="flex items-center justify-between text-[10px]"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />

                            <span className="font-semibold text-[#687187]">
                              {item.label}
                            </span>
                          </div>

                          <span className="font-extrabold text-[#102f68]">
                            {percentage}%{" "}
                            <span className="font-medium text-[#a0a5b1]">
                              ({item.value})
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* RECENT ORDERS + LOW STOCK */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* ORDERS */}
            <Card className="min-w-0 overflow-hidden p-5 sm:p-6">
              <SectionHeader
                title="Recent Orders"
                subtitle="Latest customer purchases"
                href="/admin/orders"
              />

              {loading ? (
                <div className="flex h-[260px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#f97316]" />
                </div>
              ) : recentOrders.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  text="No orders available."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[570px] text-left">
                    <thead>
                      <tr className="border-b border-[#f0f0f3] text-[9px] font-bold uppercase tracking-wide text-[#9ba1ae]">
                        <th className="pb-3 pr-3">Order</th>
                        <th className="pb-3 pr-3">Customer</th>
                        <th className="pb-3 pr-3">Amount</th>
                        <th className="pb-3 pr-3">Status</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#f4f4f6]">
                      {recentOrders.map((order, index) => (
                        <tr
                          key={order?._id || index}
                          className="group transition hover:bg-[#fffbf9]"
                        >
                          <td className="py-3 pr-3">
                            <span className="text-[10px] font-extrabold text-[#17468f]">
                              #{order?.orderNumber || "—"}
                            </span>
                          </td>

                          <td className="py-3 pr-3">
                            <div className="max-w-[130px] truncate text-[10px] font-bold text-[#102f68]">
                              {getCustomerName(order)}
                            </div>

                            <p className="mt-0.5 text-[8px] text-[#9ba1ae]">
                              {getOrderItems(order)} item
                              {getOrderItems(order) !== 1 ? "s" : ""}
                            </p>
                          </td>

                          <td className="py-3 pr-3 text-[10px] font-extrabold text-[#102f68]">
                            {formatCurrency(getOrderAmount(order))}
                          </td>

                          <td className="py-3 pr-3">
                            <span
                              className={[
                                "inline-flex rounded-md px-2 py-1 text-[8px] font-extrabold",
                                statusClasses(getOrderStatus(order)),
                              ].join(" ")}
                            >
                              {normalizeStatus(getOrderStatus(order))}
                            </span>
                          </td>

                          <td className="py-3 text-right">
                            <Link
                              href={`/admin/orders/${order?._id}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#f5f8fc] px-2.5 py-1.5 text-[8px] font-extrabold text-[#17468f] transition hover:bg-[#fff0e8] hover:text-[#f97316]"
                            >
                              View
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* LOW STOCK */}
            <Card className="min-w-0 overflow-hidden p-5 sm:p-6">
              <SectionHeader
                title="Low Stock Products"
                subtitle="Products requiring inventory attention"
                href="/admin/inventory"
              />

              {loading ? (
                <div className="flex h-[260px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#f97316]" />
                </div>
              ) : topLowStock.length === 0 ? (
                <EmptyState
                  icon={Boxes}
                  text="No low-stock products."
                />
              ) : (
                <div className="space-y-2">
                  {topLowStock.map((item, index) => {
                    const product = item.product || {};
                    const stock = item.stock;

                    const critical = stock <= 4;

                    return (
                      <div
                        key={item?._id || product?._id || index}
                        className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-[#f1f1f3] hover:bg-[#fffbf9]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#eeeeef] bg-[#fafafa]">
                          {getProductImage(product) ? (
                            <img
                              src={getProductImage(product)}
                              alt={getProductName(product)}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-[#a1a7b3]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-extrabold text-[#102f68]">
                            {getProductName(product)}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={[
                                "text-[9px] font-black",
                                critical
                                  ? "text-red-500"
                                  : "text-orange-500",
                              ].join(" ")}
                            >
                              {stock} left
                            </span>

                            <span
                              className={[
                                "rounded-md px-1.5 py-0.5 text-[7px] font-extrabold",
                                critical
                                  ? "bg-red-50 text-red-600"
                                  : "bg-orange-50 text-orange-600",
                              ].join(" ")}
                            >
                              {critical ? "Critical" : "Low Stock"}
                            </span>
                          </div>
                        </div>

                        <Link
                          href="/admin/inventory"
                          className="shrink-0 rounded-lg border border-[#e7e8ed] px-2 py-1.5 text-[8px] font-extrabold text-[#526079] transition hover:border-[#f97316]/30 hover:text-[#f97316]"
                        >
                          Update
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* BOTTOM PROMO */}
          <section className="relative overflow-hidden rounded-[22px] border border-[#ffe1d3] bg-gradient-to-r from-[#fff0e8] via-[#fff8f5] to-[#f0f7ff] px-5 py-6 sm:px-7">
            <div className="relative z-10 max-w-[500px]">
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[#f97316] shadow-sm">
                FurNest Growth
              </span>

              <h2 className="mt-3 text-[22px] font-black leading-tight tracking-tight text-[#102f68] sm:text-[27px]">
                Grow Together
                <br />
                For Happier Pets
              </h2>

              <p className="mt-2 max-w-[430px] text-[10px] leading-5 text-[#70798d]">
                Manage products, support customers, monitor orders and keep
                every pet-care experience running smoothly.
              </p>

              <Link
                href="/admin/reports"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#102f68] px-4 py-2.5 text-[9px] font-extrabold text-white shadow-md shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#173f80]"
              >
                View Reports
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="absolute -right-4 bottom-[-30px] hidden h-44 w-44 items-center justify-center rounded-full bg-[#ffe0d0]/70 sm:flex">
              <span className="text-[90px]">🐕</span>
            </div>

            <div className="absolute right-[18%] top-7 hidden text-4xl opacity-80 sm:block">
              ❤️
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="min-w-0 space-y-5">
          {/* PROMO */}
          <Card className="relative min-h-[180px] overflow-hidden border-[#ffe2d7] bg-gradient-to-br from-[#fff1ea] to-[#fff9f6] p-5">
            <div className="relative z-10 max-w-[190px]">
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#f97316]">
                FurNest Promise
              </span>

              <h3 className="mt-2 text-[21px] font-black leading-tight text-[#102f68]">
                Every order
                <br />
                feeds a happier tail!
              </h3>

              <p className="mt-2 text-[9px] font-medium leading-4 text-[#7c8496]">
                Better products. Better care. Happier pets.
              </p>
            </div>

            <div className="absolute -bottom-7 -right-2 text-[105px] leading-none">
              🐱
            </div>

            <div className="absolute right-5 top-5 text-xl">❤️</div>
          </Card>

          {/* QUICK ACTIONS */}
          <Card className="p-5 sm:p-6">
            <SectionHeader title="Quick Actions" />

            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "Add Product",
                  href: "/admin/products/new",
                  icon: Plus,
                  color: "text-orange-500",
                  bg: "bg-orange-50",
                },
                {
                  label: "Add Category",
                  href: "/admin/categories/new",
                  icon: LayoutGrid,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  label: "View Orders",
                  href: "/admin/orders",
                  icon: ListOrdered,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Inventory",
                  href: "/admin/inventory",
                  icon: Archive,
                  color: "text-red-500",
                  bg: "bg-red-50",
                },
                {
                  label: "Prescriptions",
                  href: "/admin/prescriptions",
                  icon: FileText,
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                },
                {
                  label: "Notifications",
                  href: "/admin/notifications",
                  icon: Send,
                  color: "text-indigo-600",
                  bg: "bg-indigo-50",
                },
              ].map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex min-h-[82px] flex-col items-center justify-center rounded-xl border border-[#eeeeF2] bg-white px-1.5 py-3 text-center transition hover:-translate-y-0.5 hover:border-[#f97316]/20 hover:bg-[#fffaf7] hover:shadow-sm"
                  >
                    <span
                      className={[
                        "mb-2 flex h-9 w-9 items-center justify-center rounded-xl transition group-hover:scale-110",
                        action.bg,
                      ].join(" ")}
                    >
                      <Icon className={["h-4 w-4", action.color].join(" ")} />
                    </span>

                    <span className="text-[8px] font-extrabold leading-3 text-[#667087]">
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* PENDING APPROVALS */}
          <Card className="p-5 sm:p-6">
            <SectionHeader
              title="Pending Approvals"
              href="/admin/prescriptions"
            />

            <div className="space-y-2">
              {dashboard.pendingPrescriptions > 0 ? (
                <Link
                  href="/admin/prescriptions"
                  className="group flex items-center gap-3 rounded-xl border border-[#f0eaf8] bg-[#fcfaff] p-3 transition hover:border-purple-200 hover:bg-purple-50/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold text-[#102f68]">
                      Prescription reviews
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#8c93a2]">
                      {dashboard.pendingPrescriptions} pending review
                    </p>
                  </div>

                  <span className="rounded-lg bg-purple-50 px-2 py-1 text-[8px] font-extrabold text-purple-600">
                    Review
                  </span>
                </Link>
              ) : null}

              {dashboard.pendingReturns > 0 ? (
                <Link
                  href="/admin/returns"
                  className="group flex items-center gap-3 rounded-xl border border-[#f5ebe4] bg-[#fffaf7] p-3 transition hover:border-orange-200 hover:bg-orange-50/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <RefreshCcw className="h-4 w-4 text-orange-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold text-[#102f68]">
                      Return requests
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#8c93a2]">
                      {dashboard.pendingReturns} awaiting action
                    </p>
                  </div>

                  <span className="rounded-lg bg-orange-50 px-2 py-1 text-[8px] font-extrabold text-orange-600">
                    Review
                  </span>
                </Link>
              ) : null}

              {dashboard.pendingPrescriptions === 0 &&
                dashboard.pendingReturns === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-[#fafbfc] py-8 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>

                    <p className="mt-3 text-[10px] font-extrabold text-[#102f68]">
                      Everything is up to date
                    </p>

                    <p className="mt-1 text-[9px] text-[#9299a7]">
                      No pending approvals.
                    </p>
                  </div>
                )}
            </div>
          </Card>

          {/* OVERVIEW */}
          <Card className="overflow-hidden bg-[#102f68] p-5 text-white sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-blue-200">
                  Store Overview
                </p>

                <h3 className="mt-2 text-[20px] font-black">
                  FurNest
                </h3>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <PawPrint className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-[8px] font-semibold text-blue-100">
                  Categories
                </p>
                <p className="mt-1 text-lg font-black">
                  {formatNumber(dashboard.categories)}
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-[8px] font-semibold text-blue-100">
                  Low Stock
                </p>
                <p className="mt-1 text-lg font-black text-orange-300">
                  {formatNumber(dashboard.lowStock.length)}
                </p>
              </div>
            </div>

            <Link
              href="/admin/reports"
              className="mt-4 flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-[9px] font-extrabold text-[#102f68] transition hover:bg-[#fff4ed]"
            >
              Open Reports
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}