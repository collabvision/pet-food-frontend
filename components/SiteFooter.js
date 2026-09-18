'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SiteFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    // Newsletter signup is marketing-only and not part of the authenticated
    // API surface, so this stays a lightweight client-side confirmation.
    if (email.trim()) setSubscribed(true);
  }

  return (
    <footer className="mt-16 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="font-display text-xl font-semibold text-navy">🐾 FurNest</p>
          <p className="mt-1 text-sm text-navy/60">Happy Pets. Happier Humans.</p>
        </div>

        <FooterColumn title="Shop" links={['Food', 'Treats', 'Supplements', 'Toys', 'Accessories']} />
        <FooterColumn title="About" links={['Our Story', 'Vet Partners', 'Sustainability', 'Careers']} />
        <FooterColumn title="Support" links={['Contact Us', 'Shipping', 'Returns', 'FAQs']} />

        <div>
          <p className="font-semibold text-navy">Join Our Pack</p>
          <p className="mt-1 text-sm text-navy/60">Get exclusive offers, pet care tips and more.</p>
          <form onSubmit={handleSubscribe} className="mt-3 flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="field-input"
              aria-label="Email address"
            />
            <button type="submit" className="btn-primary whitespace-nowrap px-4">
              Subscribe
            </button>
          </form>
          {subscribed && <p className="mt-2 text-xs text-forest">Thanks — you're on the list.</p>}
        </div>
      </div>

      <div className="border-t border-navy/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-navy/60 sm:flex-row">
          <p>© {new Date().getFullYear()} FurNest. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/refunds">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="font-semibold text-navy">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-navy/60">
        {links.map((l) => (
          <li key={l}>
            <Link href="#" className="hover:text-coral">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
