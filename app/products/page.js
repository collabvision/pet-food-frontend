import Link from 'next/link';
import { Suspense } from 'react';
import { getCategories, getProducts } from '../../lib/products';
import CategoryStrip from '../../components/CategoryStrip';
import ProductCard from '../../components/ProductCard';
import FiltersSidebar from '../../components/FiltersSidebar';
import SortSelect from '../../components/SortSelect';
import Pagination from '../../components/Pagination';

export const metadata = { title: 'Shop all products' };

export default async function ProductsPage({ searchParams }) {
  const page = Number(searchParams.page || 1);
  const limit = 12;

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({ ...searchParams, page, limit }),
  ]);

  const { items, total, pages } = result;

  function buildHref(targetPage) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(targetPage));
    return `/products?${params.toString()}`;
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-10 py-10 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-coral/20" aria-hidden />
          <h1 className="relative font-display text-3xl font-semibold sm:text-4xl">
            Premium Products for Their Happier Days
          </h1>
          <p className="relative mt-2 max-w-lg text-white/75">
            Healthy food, fun toys, essential care and more — all curated for the wellbeing of your furry family.
          </p>
        </div>
      </section>

      <div className="mt-6">
        <CategoryStrip categories={categories} />
      </div>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <p className="mb-4 text-xs text-navy/50">
          <Link href="/">Home</Link> <span className="mx-1">/</span> Products
        </p>

        <div className="flex flex-col gap-8 lg:flex-row">
          <Suspense fallback={<div className="w-64 shrink-0" />}>
            <FiltersSidebar />
          </Suspense>

          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-navy/60">
                Showing {items.length ? (page - 1) * limit + 1 : 0}-{(page - 1) * limit + items.length} of {total} products
              </p>
              <Suspense fallback={<div className="h-10 w-40 rounded-xl bg-white" />}>
                <SortSelect />
              </Suspense>
            </div>

            {items.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {items.map((product) => (
                  <ProductCard key={product._id || product.slug} product={product} />
                ))}
              </div>
            )}

            <Pagination page={page} pages={pages} buildHref={buildHref} />
          </div>
        </div>
      </section>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-navy/15 bg-white py-16 text-center">
      <span className="text-4xl" aria-hidden>🔍</span>
      <p className="mt-3 font-medium text-navy">No products match these filters</p>
      <p className="mt-1 text-sm text-navy/60">Try clearing a filter or searching for something else.</p>
      <Link href="/products" className="btn-secondary mt-4">
        Clear filters
      </Link>
    </div>
  );
}
