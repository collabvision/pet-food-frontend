"use client";

import { useState } from "react";
import { Menu, Bell, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AdminHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="relative rounded-xl p-2.5 text-zinc-600 hover:bg-zinc-100"
        >
          <Bell size={20} />
        </button>

        <div className="hidden h-8 w-px bg-zinc-200 sm:block" />

        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white">
            <UserCircle size={20} />
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold text-zinc-900">
              {user?.name || "Administrator"}
            </p>
            <p className="text-xs text-zinc-500">
              {user?.email || "Admin"}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={loggingOut}
          onClick={handleLogout}
          className="ml-1 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">
            {loggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </header>
  );
}