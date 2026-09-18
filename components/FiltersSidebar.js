'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Fish', 'Small Pets'];
const BRANDS = ['Royal Canin', 'Pedigree', 'Hills', 'Drools', 'Orijen', 'Acana'];
const PRODUCT_TYPES = ['Food', 'Treats', 'Supplements', 'Grooming', 'Toys', 'Accessories', 'Health & Wellness', 'Prescriptions'];
const SPECIAL_NEEDS = ['Grain Free', 'Weight Management', 'Skin & Coat', 'Veterinary Diet', 'Hypoallergenic'];
const RATINGS = [4, 3, 2, 1];

export default function FiltersSidebar({ brandFacetCounts = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showAllBrands, setShowAllBrands] = useState(false);

  function getList(key) {
    const raw = searchParams.get(key);
    return raw ? raw.split(',') : [];
  }

  function updateParams(mutator) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    params.delete('page'); // any filter change resets pagination
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleListValue(key, value) {
    updateParams((params) => {
      const current = new Set(getList(key));
      current.has(value) ? current.delete(value) : current.add(value);
      current.size ? params.set(key, [...current].join(',')) : params.delete(key);
    });
  }

  function setPriceRange(min, max) {
    updateParams((params) => {
      min ? params.set('minPrice', min) : params.delete('minPrice');
      max ? params.set('maxPrice', max) : params.delete('maxPrice');
    });
  }

  function setRating(value) {
    updateParams((params) => {
      const current = searchParams.get('minRating');
      current === String(value) ? params.delete('minRating') : params.set('minRating', String(value));
    });
  }

  function clearAll() {
    router.push(pathname);
  }

  const brandsToShow = showAllBrands ? BRANDS : BRANDS.slice(0, 6);

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-navy">Filters</h2>
        <button onClick={clearAll} className="text-xs font-medium text-coral hover:underline">
          Clear All
        </button>
      </div>

      <FilterGroup title="Pet Type">
        {PET_TYPES.map((pt) => (
          <Checkbox
            key={pt}
            label={pt}
            checked={getList('petType').includes(pt)}
            onChange={() => toggleListValue('petType', pt)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Brand">
        {brandsToShow.map((brand) => (
          <Checkbox
            key={brand}
            label={brand}
            count={brandFacetCounts[brand]}
            checked={getList('brand').includes(brand)}
            onChange={() => toggleListValue('brand', brand)}
          />
        ))}
        {!showAllBrands && BRANDS.length > 6 && (
          <button onClick={() => setShowAllBrands(true)} className="mt-1 text-xs font-medium text-coral hover:underline">
            + Show More
          </button>
        )}
      </FilterGroup>

      <FilterGroup title="Price Range">
        <PriceRange
          min={searchParams.get('minPrice') || ''}
          max={searchParams.get('maxPrice') || ''}
          onApply={setPriceRange}
        />
      </FilterGroup>

      <FilterGroup title="Product Type">
        {PRODUCT_TYPES.map((pt) => (
          <Checkbox
            key={pt}
            label={pt}
            checked={getList('type').includes(pt)}
            onChange={() => toggleListValue('type', pt)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Special Needs">
        {SPECIAL_NEEDS.map((s) => (
          <Checkbox
            key={s}
            label={s}
            checked={getList('special').includes(s)}
            onChange={() => toggleListValue('special', s)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Rating" last>
        {RATINGS.map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-navy/80">
            <input
              type="checkbox"
              checked={searchParams.get('minRating') === String(r)}
              onChange={() => setRating(r)}
              className="h-4 w-4 rounded border-navy/30 text-coral focus-visible:outline-coral"
            />
            {'★'.repeat(r)}
            <span className="text-navy/50">&amp; above</span>
          </label>
        ))}
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children, last }) {
  return (
    <div className={`py-4 ${last ? '' : 'border-b border-navy/10'}`}>
      <p className="mb-2 text-sm font-semibold text-navy">{title}</p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function Checkbox({ label, checked, onChange, count }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 py-1 text-sm text-navy/80">
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded border-navy/30 text-coral focus-visible:outline-coral"
        />
        {label}
      </span>
      {count != null && <span className="text-xs text-navy/40">({count})</span>}
    </label>
  );
}

function PriceRange({ min, max, onApply }) {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        placeholder="₹0"
        value={localMin}
        onChange={(e) => setLocalMin(e.target.value)}
        className="field-input py-1.5 text-xs"
      />
      <span className="text-navy/40">–</span>
      <input
        type="number"
        min="0"
        placeholder="₹5000"
        value={localMax}
        onChange={(e) => setLocalMax(e.target.value)}
        className="field-input py-1.5 text-xs"
      />
      <button
        onClick={() => onApply(localMin, localMax)}
        className="rounded-lg bg-navy px-2.5 py-1.5 text-xs font-semibold text-white"
      >
        Go
      </button>
    </div>
  );
}
