import Link from 'next/link';
import { getCategories, getFeaturedProducts } from '../lib/products';
import CategoryStrip from '../components/CategoryStrip';
import ProductCard from '../components/ProductCard';
import { IconShield, IconTruck } from '../components/Icons';

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts(6)]);

  return (
    <>
      {/* Hero*/}
      <section className="mx-auto grid max-w-7xl gap-5 px-6 pt-8 lg:grid-cols-[2fr_1fr]">
        <div className="relative flex flex-col justify-center overflow-hidden rounded-3xl bg-navy px-10 py-14 text-white">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-coral/20" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-white/5" aria-hidden />
          <p className="relative text-sm font-medium text-white/70">Different Pets, Same Love</p>
          <h1 className="relative mt-3 max-w-md font-display text-4xl font-semibold leading-tight sm:text-5xl">
            A Happier Tomorrow for Your Best Friend
          </h1>
          <p className="relative mt-4 max-w-sm text-white/75">
            Premium pet food, trusted care, expert advice and a loving community — all in one place.
          </p>
          <Link href="/products" className="btn-primary relative mt-6 w-fit">
            Shop Now
          </Link>
          <span className="relative mt-10 text-6xl" aria-hidden>🐕🐈</span>
        </div>

        <div className="flex flex-col gap-5">
          <PromoCard
            eyebrow="Personalized Nutrition"
            title="for a Longer, Happier Life"
            points={['Tailored by age, breed & needs', 'Vet recommended', 'Backed by science']}
            cta="Explore Pet Care"
            href="/pet-care"
            tone="light"
          />
          <PromoCard
            eyebrow="Monthly Wellness Box"
            title="Curated essentials for your pet's health & joy"
            cta="Explore Boxes"
            href="/products"
            tone="dark"
          />
        </div>
      </section>

      <div className="mt-8">
        <CategoryStrip categories={categories} />
      </div>

      {/* Trust badges */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-2 gap-4 text-sm text-navy/70 sm:grid-cols-4">
          <TrustBadge icon={<IconShield />} title="Vet Approved" subtitle="Products" />
          <TrustBadge icon={<IconTruck />} title="Fast & Reliable" subtitle="Delivery" />
          <TrustBadge icon={<IconShield />} title="100% Authentic" subtitle="& Safe" />
          <TrustBadge icon="❤" title="Loved by 50K+" subtitle="Pet Parents" />
        </div>
      </section>

      {/* Feature trio */}
      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-8 lg:grid-cols-3">
        <FeatureBlock
          tone="bg-blush"
          title="Play, Learn, Bond"
          body="Explore our toy collection for endless happy moments."
          cta="Shop Toys"
          href="/products?category=toys"
        />
        <FeatureBlock
          tone="bg-sand"
          title="Nutritious Meals for a Brighter Tomorrow"
          body="Better digestion, stronger immunity, healthier & happier pets."
          cta="Shop Food"
          href="/products?category=food"
        />
        <FeatureBlock
          tone="bg-navy text-white"
          title="Care Beyond Commerce"
          body="Expert advice, pet stories, care guides and a loving community."
          cta="Read & Explore"
          href="/community"
          dark
        />
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy">Featured for Your Furry Friends</h2>
            <p className="text-sm text-navy/60">Handpicked products for happier, healthier pets.</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-coral hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Expert advice */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col justify-center gap-4 rounded-3xl bg-blush p-10">
            <span className="text-5xl" aria-hidden>🩺</span>
            <h2 className="font-display text-2xl font-semibold text-navy">Expert Advice for Every Pet Parent</h2>
            <p className="text-sm text-navy/70">Tips, guides and professional advice to keep your pets healthy and happy.</p>
            <Link href="/pet-care" className="btn-secondary w-fit">Read & Learn →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <ArticleCard emoji="🐕" title="5 Tips for a Happier, Healthier Dog" />
            <ArticleCard emoji="🐈" title="Understanding Your Cat's Behavior" />
            <ArticleCard emoji="🦜" title="Essential Care Tips for Pet Birds" />
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="flex flex-col gap-6 rounded-3xl bg-blush p-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy">Join Our Pet-Loving Community</h2>
            <p className="mt-2 max-w-sm text-sm text-navy/70">
              Share stories, get advice and connect with fellow pet parents.
            </p>
            <div className="mt-4 flex gap-2 text-xs font-medium text-coral-dark">
              <span className="rounded-pill bg-white px-3 py-1">#FurNest</span>
              <span className="rounded-pill bg-white px-3 py-1">#HappyPets</span>
              <span className="rounded-pill bg-white px-3 py-1">#SmallButSpecial</span>
            </div>
            <Link href="/community" className="btn-primary mt-5 w-fit">Join Now</Link>
          </div>
          <div className="flex gap-3 text-5xl">
            <span className="rounded-2xl bg-white p-4 shadow-sm">🐶</span>
            <span className="rounded-2xl bg-white p-4 shadow-sm">🐱</span>
            <span className="rounded-2xl bg-white p-4 shadow-sm">🐰</span>
          </div>
        </div>
      </section>
    </>
  );
}

function PromoCard({ eyebrow, title, points, cta, href, tone }) {
  const dark = tone === 'dark';
  return (
    <div className={`flex flex-1 flex-col justify-center rounded-3xl p-7 ${dark ? 'bg-forest text-white' : 'bg-white'}`}>
      <p className={`text-xs font-semibold ${dark ? 'text-white/70' : 'text-coral-dark'}`}>{eyebrow}</p>
      <h3 className={`mt-1 font-display text-lg font-semibold ${dark ? 'text-white' : 'text-navy'}`}>{title}</h3>
      {points && (
        <ul className={`mt-3 space-y-1 text-xs ${dark ? 'text-white/80' : 'text-navy/70'}`}>
          {points.map((p) => (
            <li key={p} className="flex items-center gap-1.5">
              <span aria-hidden>✓</span> {p}
            </li>
          ))}
        </ul>
      )}
      <Link href={href} className={dark ? 'btn-primary mt-5 w-fit' : 'btn-secondary mt-5 w-fit'}>
        {cta} →
      </Link>
    </div>
  );
}

function TrustBadge({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3">
      <span className="text-forest">{icon}</span>
      <span>
        <span className="block font-semibold text-navy">{title}</span>
        <span className="block text-xs text-navy/50">{subtitle}</span>
      </span>
    </div>
  );
}

function FeatureBlock({ tone, title, body, cta, href, dark }) {
  return (
    <div className={`flex flex-col justify-between rounded-3xl p-8 ${tone}`}>
      <div>
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <p className={`mt-2 text-sm ${dark ? 'text-white/75' : 'text-navy/70'}`}>{body}</p>
      </div>
      <Link href={href} className={dark ? 'btn-primary mt-6 w-fit' : 'btn-secondary mt-6 w-fit'}>
        {cta} →
      </Link>
    </div>
  );
}

function ArticleCard({ emoji, title }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white">
      <div className="flex aspect-video items-center justify-center bg-sand text-4xl" aria-hidden>{emoji}</div>
      <p className="p-4 text-sm font-medium text-navy">{title}</p>
    </div>
  );
}
