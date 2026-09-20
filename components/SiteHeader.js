"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import {
  IconSearch,
  IconHeart,
  IconCart,
  IconUser,
  IconMenu,
  IconClose,
} from "./Icons";

const NAV_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "Pet Care", href: "/pet-care" },
  { label: "Categories", href: "/products" },
  { label: "Vet Approved", href: "/products?vetApproved=true" },
  { label: "Community", href: "/community" },
  { label: "Offers", href: "/offers" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const { status, user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  /*
   * Never render the customer header on admin routes.
   *
   * This also covers:
   * /admin
   * /admin/login
   * /admin/products
   * /admin/orders/123
   * etc.
   */
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  function handleSearch(event) {
    event.preventDefault();

    const value = query.trim();

    router.push(
      value
        ? `/products?q=${encodeURIComponent(value)}`
        : "/products"
    );

    setMenuOpen(false);
  }

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    router.push("/");
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        {/* =====================================================
            TOP INFORMATION BAR
        ====================================================== */}
        <div className="hidden bg-[#10265f] text-white md:block">
          <div className="mx-auto flex h-[34px] max-w-[1440px] items-center justify-between px-6 text-[10px] font-semibold lg:px-8">
            <div className="flex items-center gap-8">
              <span className="flex items-center gap-1.5">
                <span className="text-[11px]">🚚</span>
                Free shipping on orders above ₹999
              </span>

              <span className="flex items-center gap-1.5">
                <span className="text-[11px]">⚕</span>
                Vet approved products
              </span>

              <span className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15 text-[9px]">
                  ✓
                </span>
                100% authentic &amp; safe
              </span>
            </div>

            <div className="flex items-center gap-5">
              <span>Need help?</span>

              <a
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 transition hover:text-[#ffb28d]"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#20c767] text-[8px]">
                  W
                </span>
                WhatsApp us
              </a>
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN HEADER
        ====================================================== */}
        <div className="border-b border-[#ece9e5] bg-[#fffaf6]/95 shadow-[0_2px_14px_rgba(16,38,95,0.04)] backdrop-blur-xl">
          <div className="mx-auto flex h-[66px] max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-8 xl:gap-6">
            {/* MOBILE MENU */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#10265f] transition hover:bg-[#fff0e8] md:hidden"
            >
              {menuOpen ? <IconClose /> : <IconMenu />}
            </button>

            {/* =================================================
                LOGO
            ================================================== */}
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              {/* Paw logo */}
              <div className="relative flex h-[43px] w-[43px] items-center justify-center sm:h-[46px] sm:w-[46px]">
                <div className="absolute left-[13px] top-[12px] h-[23px] w-[25px] rotate-[-8deg] rounded-[48%_52%_48%_52%] bg-[#ff704f]" />

                <span className="absolute left-[8px] top-[5px] h-[11px] w-[8px] rotate-[-25deg] rounded-full bg-[#ff6f4d]" />
                <span className="absolute left-[19px] top-[2px] h-[12px] w-[8px] rounded-full bg-[#ff9879]" />
                <span className="absolute left-[29px] top-[7px] h-[10px] w-[8px] rotate-[25deg] rounded-full bg-[#ff5e91]" />

                <span className="absolute left-[15px] top-[17px] text-[16px] leading-none text-[#10265f]">
                  •
                </span>

                <span className="absolute left-[24px] top-[22px] text-[12px] leading-none text-[#10265f]">
                  •
                </span>
              </div>

              <div className="leading-none">
                <span className="block text-[21px] font-black tracking-[-0.04em] text-[#10265f] sm:text-[23px]">
                  FurNest
                </span>

                <span className="mt-1 block text-[7px] font-bold tracking-[0.01em] text-[#52607d] sm:text-[8px]">
                  Happy Pets. Happier Humans.
                </span>
              </div>
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================== */}
            <nav className="hidden flex-1 items-center justify-center gap-5 xl:flex 2xl:gap-7">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative whitespace-nowrap text-[11px] font-extrabold text-[#182957] transition-colors after:absolute after:-bottom-[7px] after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-[#ff6f4d] after:transition-all hover:text-[#ff6543] hover:after:w-full"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* =================================================
                SEARCH
            ================================================== */}
            <form
              onSubmit={handleSearch}
              className="hidden h-[42px] w-[235px] shrink-0 items-center rounded-xl border border-[#e3e4e8] bg-white px-3 shadow-[0_2px_8px_rgba(16,38,95,0.025)] transition focus-within:border-[#ff9879] focus-within:shadow-[0_0_0_3px_rgba(255,111,77,0.08)] lg:flex xl:w-[265px] 2xl:w-[300px]"
            >
              <IconSearch />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search for food, toys, supplements..."
                className="ml-2 min-w-0 flex-1 bg-transparent text-[10px] font-medium text-[#10265f] outline-none placeholder:text-[#9ba2b1]"
              />

              <button
                type="submit"
                aria-label="Search"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#10265f] text-white transition hover:bg-[#173b7d]"
              >
                <IconSearch />
              </button>
            </form>

            {/* =================================================
                HEADER ACTIONS
            ================================================== */}
            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
              {/* MOBILE SEARCH */}
              <button
                type="button"
                onClick={() => {
                  if (pathname === "/products") {
                    const searchInput = document.querySelector(
                      "[data-mobile-search]"
                    );

                    searchInput?.focus();
                  } else {
                    router.push("/products");
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#10265f] transition hover:bg-[#fff0e8] hover:text-[#ff6543] lg:hidden"
                aria-label="Search products"
              >
                <IconSearch />
              </button>

              {/* USER */}
              {status === "authenticated" ? (
                <div className="group relative">
                  <button
                    type="button"
                    className="flex h-10 items-center gap-1.5 rounded-xl px-2 text-[#10265f] transition hover:bg-[#fff0e8]"
                  >
                    <IconUser />

                    <span className="hidden text-[11px] font-extrabold lg:inline">
                      {user?.name?.split(" ")[0] || "Account"}
                    </span>
                  </button>

                  {/* ACCOUNT DROPDOWN */}
                  <div className="invisible absolute right-0 top-[calc(100%+10px)] w-52 translate-y-1 rounded-2xl border border-[#ebe8e4] bg-white p-2 opacity-0 shadow-[0_15px_40px_rgba(16,38,95,0.12)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="mb-1 border-b border-[#f0eeeb] px-3 py-2.5">
                      <p className="truncate text-[11px] font-extrabold text-[#10265f]">
                        {user?.name || "Account"}
                      </p>

                      <p className="mt-0.5 truncate text-[9px] text-[#8b92a2]">
                        {user?.email || ""}
                      </p>
                    </div>

                    <Link
                      href="/orders"
                      className="block rounded-xl px-3 py-2.5 text-[11px] font-semibold text-[#3d4760] transition hover:bg-[#fff5ef] hover:text-[#ff6543]"
                    >
                      My Orders
                    </Link>

                    <Link
                      href="/prescriptions"
                      className="block rounded-xl px-3 py-2.5 text-[11px] font-semibold text-[#3d4760] transition hover:bg-[#fff5ef] hover:text-[#ff6543]"
                    >
                      Prescriptions
                    </Link>

                    <Link
                      href="/account"
                      className="block rounded-xl px-3 py-2.5 text-[11px] font-semibold text-[#3d4760] transition hover:bg-[#fff5ef] hover:text-[#ff6543]"
                    >
                      My Account
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 block w-full rounded-xl px-3 py-2.5 text-left text-[11px] font-bold text-[#ef5b4a] transition hover:bg-red-50"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              ) : status === "guest" ? (
                <Link
                  href="/login"
                  className="flex h-10 items-center gap-1.5 rounded-xl px-2 text-[#10265f] transition hover:bg-[#fff0e8] hover:text-[#ff6543]"
                >
                  <IconUser />
                  <span className="hidden text-[11px] font-extrabold lg:inline">
                    Log in
                  </span>
                </Link>
              ) : (
                <span
                  className="h-5 w-5 animate-pulse rounded-full bg-[#10265f]/10"
                  aria-hidden
                />
              )}

              {/* WISHLIST */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#10265f] transition hover:bg-[#fff0e8] hover:text-[#ff6543]"
              >
                <IconHeart />
              </Link>

              {/* CART */}
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#10265f] transition hover:bg-[#fff0e8] hover:text-[#ff6543]"
              >
                <IconCart />

                <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#ff713f] px-1 text-[8px] font-black text-white ring-2 ring-[#fffaf6]">
                  3
                </span>
              </Link>
            </div>
          </div>

          {/* =================================================
              MOBILE SEARCH
          ================================================== */}
          <div className="px-4 pb-3 md:hidden">
            <form
              onSubmit={handleSearch}
              className="flex h-10 items-center rounded-xl border border-[#e3e4e8] bg-white px-3 shadow-sm focus-within:border-[#ff9879]"
            >
              <IconSearch />

              <input
                data-mobile-search
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search food, toys, supplements..."
                className="ml-2 min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#9ba2b1]"
              />

              <button
                type="submit"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#10265f] text-white"
                aria-label="Search"
              >
                <IconSearch />
              </button>
            </form>
          </div>
        </div>

        {/* =====================================================
            MOBILE NAVIGATION
        ====================================================== */}
        {menuOpen && (
          <div className="absolute left-0 right-0 top-full border-b border-[#e9e5e1] bg-[#fffaf6] shadow-[0_15px_30px_rgba(16,38,95,0.1)] md:hidden">
            <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
              {NAV_LINKS.map((link, index) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    "flex items-center justify-between rounded-xl px-3 py-3 text-[12px] font-extrabold text-[#182957] transition",
                    "hover:bg-white hover:text-[#ff6543]",
                    index !== NAV_LINKS.length - 1
                      ? "border-b border-[#eeeae6]"
                      : "",
                  ].join(" ")}
                >
                  {link.label}

                  <span className="text-[#a2a8b4]">→</span>
                </Link>
              ))}

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#ebe7e3] pt-3">
                <Link
                  href="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-white px-3 py-3 text-center text-[10px] font-bold text-[#10265f] shadow-sm"
                >
                  ♡ Wishlist
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-[#10265f] px-3 py-3 text-center text-[10px] font-bold text-white shadow-sm"
                >
                  🛒 Cart
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}