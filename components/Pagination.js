import Link from 'next/link';

export default function Pagination({ page, pages, buildHref }) {
  if (pages <= 1) return null;

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(pages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <PageLink href={buildHref(page - 1)} disabled={page <= 1} label="‹">
        <span className="sr-only">Previous page</span>‹
      </PageLink>

      {start > 1 && <span className="px-2 text-navy/40">…</span>}

      {pageNumbers.map((n) => (
        <Link
          key={n}
          href={buildHref(n)}
          aria-current={n === page ? 'page' : undefined}
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
            n === page ? 'bg-navy text-white' : 'text-navy/70 hover:bg-white'
          }`}
        >
          {n}
        </Link>
      ))}

      {end < pages && <span className="px-2 text-navy/40">…</span>}

      <PageLink href={buildHref(page + 1)} disabled={page >= pages}>
        <span className="sr-only">Next page</span>›
      </PageLink>
    </nav>
  );
}

function PageLink({ href, disabled, children }) {
  if (disabled) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-navy/25" aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-navy/70 hover:bg-white">
      {children}
    </Link>
  );
}
