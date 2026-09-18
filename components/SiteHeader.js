'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { IconSearch, IconHeart, IconCart, IconUser, IconMenu, IconClose } from './Icons';

const NAV_LINKS = [
  { label: 'Shop', href: '/products' },
  { label: 'Pet Care', href: '/pet-care' },
  { label: 'Categories', href: '/products' },
  { label: 'Vet Approved', href: '/products?vetApproved=true' },
  { label: 'Community', href: '/community' },
  { label: 'Offers', href: '/offers' },
];

export default function SiteHeader() {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-navy/5 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        <button
          className="md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>

        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-display text-2xl font-semibold text-navy">🐾 FurNest</span>
          <span className="text-[11px] text-navy/60">Happy Pets. Happier Humans.</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-6 text-sm font-medium text-navy/80 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-coral">
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden max-w-xs flex-1 items-center rounded-pill border border-navy/15 bg-white px-4 py-2 md:flex">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search for food, toys, supplements..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-navy/40"
          />
          <button type="submit" aria-label="Search" className="text-navy/60 hover:text-coral">
            <IconSearch />
          </button>
        </form>

        <div className="ml-auto flex items-center gap-4 text-navy">
          {status === 'authenticated' ? (
            <div className="group relative">
              <button className="flex items-center gap-1.5 text-sm font-medium">
                <IconUser />
                <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'Account'}</span>
              </button>
              <div className="invisible absolute right-0 top-full w-44 rounded-xl border border-navy/10 bg-white p-2 shadow-lg opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                <Link href="/orders" className="block rounded-lg px-3 py-2 text-sm hover:bg-cream">My orders</Link>
                <Link href="/prescriptions" className="block rounded-lg px-3 py-2 text-sm hover:bg-cream">Prescriptions</Link>
                <button onClick={() => logout()} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-coral-dark hover:bg-cream">
                  Log out
                </button>
              </div>
            </div>
          ) : status === 'guest' ? (
            <Link href="/login" className="flex items-center gap-1.5 text-sm font-medium hover:text-coral">
              <IconUser /> <span className="hidden sm:inline">Log in</span>
            </Link>
          ) : (
            <span className="h-5 w-5 animate-pulse rounded-full bg-navy/10" aria-hidden />
          )}

          <Link href="/wishlist" aria-label="Wishlist" className="hover:text-coral">
            <IconHeart />
          </Link>

          <Link href="/cart" aria-label="Cart" className="relative hover:text-coral">
            <IconCart />
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[10px] font-semibold text-white">
              0
            </span>
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-navy/10 bg-cream px-6 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} href={link.href} className="rounded-lg px-2 py-2 text-sm font-medium text-navy/80 hover:bg-white" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
