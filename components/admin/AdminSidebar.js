"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ShoppingCart,
  FileCheck,
  RotateCcw,
  Truck,
  Bell,
  X,
  LogOut,
  PawPrint,
} from "lucide-react";

const menu = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: Boxes,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Prescriptions",
    href: "/admin/prescriptions",
    icon: FileCheck,
  },
  {
    label: "Returns",
    href: "/admin/returns",
    icon: RotateCcw,
  },
  {
    label: "Shipping",
    href: "/admin/shipping",
    icon: Truck,
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
];

export default function AdminSidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col
          border-r border-zinc-800 bg-zinc-950 text-white
          transition-transform duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400 text-zinc-950">
              <PawPrint size={20} />
            </div>

            <div>
              <p className="font-bold tracking-tight">FurNest</p>
              <p className="text-xs text-zinc-500">Admin Panel</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Management
          </p>

          <div className="space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-medium transition
                    ${active
                      ? "bg-orange-400 text-zinc-950"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-zinc-800 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <PawPrint size={18} />
            View Store
          </Link>
        </div>
      </aside>
    </>
  );
}