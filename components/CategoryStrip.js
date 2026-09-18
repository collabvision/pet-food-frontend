import Link from 'next/link';

export default function CategoryStrip({ categories }) {
  return (
    <nav aria-label="Shop by category" className="border-b border-navy/8 bg-white">
      <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-6 py-5">
        {categories.map((cat) => (
          <Link
            key={cat._id || cat.slug}
            href={`/products?category=${cat.slug}`}
            className="flex flex-shrink-0 flex-col items-center gap-2 text-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blush text-2xl">
              {cat.icon || '🐾'}
            </span>
            <span className="text-xs font-medium text-navy/80">{cat.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
