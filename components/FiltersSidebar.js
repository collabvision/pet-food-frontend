'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Check,
} from 'lucide-react';

const PET_TYPES = [
  'Dog',
  'Cat',
  'Bird',
  'Fish',
  'Small Pets',
];

const BRANDS = [
  'Royal Canin',
  'Pedigree',
  'Hills',
  'Drools',
  'Orijen',
  'Acana',
];

const PRODUCT_TYPES = [
  'Food',
  'Treats',
  'Supplements',
  'Grooming',
  'Toys',
  'Accessories',
  'Health & Wellness',
  'Prescriptions',
];

const SPECIAL_NEEDS = [
  'Grain Free',
  'Weight Management',
  'Skin & Coat',
  'Veterinary Diet',
  'Hypoallergenic',
];

const RATINGS = [4, 3, 2, 1];

export default function FiltersSidebar({
  brandFacetCounts = {},
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  const [expandedGroups, setExpandedGroups] = useState({
    petType: true,
    brand: true,
    price: true,
    productType: false,
    specialNeeds: false,
    rating: false,
  });

  /*
   * Prevent body from scrolling while drawer is open
   */
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /*
   * Close drawer with Escape
   */
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function getList(key) {
    const raw = searchParams.get(key);

    return raw
      ? raw.split(',').filter(Boolean)
      : [];
  }

  function updateParams(mutator) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    mutator(params);

    // Reset pagination whenever a filter changes
    params.delete('page');

    const query = params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname
    );
  }

  function toggleListValue(key, value) {
    updateParams((params) => {
      const raw = params.get(key);

      const current = new Set(
        raw ? raw.split(',').filter(Boolean) : []
      );

      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }

      if (current.size > 0) {
        params.set(
          key,
          Array.from(current).join(',')
        );
      } else {
        params.delete(key);
      }
    });
  }

  function setPriceRange(min, max) {
    updateParams((params) => {
      if (min) {
        params.set('minPrice', min);
      } else {
        params.delete('minPrice');
      }

      if (max) {
        params.set('maxPrice', max);
      } else {
        params.delete('maxPrice');
      }
    });
  }

  function setRating(value) {
    updateParams((params) => {
      const current = params.get('minRating');

      if (current === String(value)) {
        params.delete('minRating');
      } else {
        params.set('minRating', String(value));
      }
    });
  }

  function clearAll() {
    router.push(pathname);
  }

  function toggleGroup(group) {
    setExpandedGroups((current) => ({
      ...current,
      [group]: !current[group],
    }));
  }

  /*
   * Count currently active filters
   */
  function getActiveFilterCount() {
    let count = 0;

    [
      'petType',
      'brand',
      'type',
      'special',
    ].forEach((key) => {
      count += getList(key).length;
    });

    if (
      searchParams.get('minPrice') ||
      searchParams.get('maxPrice')
    ) {
      count += 1;
    }

    if (searchParams.get('minRating')) {
      count += 1;
    }

    return count;
  }

  const activeFilterCount =
    getActiveFilterCount();

  const brandsToShow = showAllBrands
    ? BRANDS
    : BRANDS.slice(0, 6);

  return (
    <>
      {/* ─────────────────────────────
          FILTER BUTTON
      ───────────────────────────── */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          inline-flex
          h-10
          items-center
          gap-2
          rounded-xl
          border
          border-navy/15
          bg-white
          px-4
          text-sm
          font-semibold
          text-navy
          shadow-sm
          transition
          hover:border-navy/30
          hover:bg-navy/[0.03]
          focus:outline-none
          focus:ring-2
          focus:ring-coral/30
        "
      >
        <SlidersHorizontal
          size={17}
          strokeWidth={2}
        />

        <span>Filters</span>

        {activeFilterCount > 0 && (
          <span
            className="
              flex
              h-5
              min-w-5
              items-center
              justify-center
              rounded-full
              bg-coral
              px-1.5
              text-[11px]
              font-bold
              text-white
            "
          >
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* ─────────────────────────────
          BACKDROP
      ───────────────────────────── */}

      {open && (
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-[60]
            cursor-default
            bg-navy/40
            backdrop-blur-[2px]
          "
        />
      )}

      {/* ─────────────────────────────
          FILTER DRAWER
      ───────────────────────────── */}

      <aside
        aria-label="Product filters"
        className={`
          fixed
          right-0
          top-0
          z-[70]
          flex
          h-dvh
          w-full
          max-w-md
          flex-col
          bg-white
          shadow-2xl
          transition-transform
          duration-300
          ease-out
          ${
            open
              ? 'translate-x-0'
              : 'translate-x-full'
          }
        `}
      >
        {/* Header */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-navy/10
            px-5
            py-4
          "
        >
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={19}
                className="text-coral"
              />

              <h2 className="font-display text-lg font-semibold text-navy">
                Filters
              </h2>

              {activeFilterCount > 0 && (
                <span
                  className="
                    rounded-full
                    bg-coral/10
                    px-2
                    py-0.5
                    text-xs
                    font-semibold
                    text-coral
                  "
                >
                  {activeFilterCount} active
                </span>
              )}
            </div>

            <p className="mt-0.5 text-xs text-navy/50">
              Find the right products for your pet
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-navy/60
              transition
              hover:bg-navy/5
              hover:text-navy
            "
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter content */}

        <div className="flex-1 overflow-y-auto px-5">
          {/* PET TYPE */}

          <FilterGroup
            title="Pet Type"
            subtitle="Who is this product for?"
            open={expandedGroups.petType}
            onToggle={() =>
              toggleGroup('petType')
            }
          >
            <div className="grid grid-cols-2 gap-2">
              {PET_TYPES.map((petType) => (
                <FilterChip
                  key={petType}
                  label={petType}
                  checked={getList(
                    'petType'
                  ).includes(petType)}
                  onChange={() =>
                    toggleListValue(
                      'petType',
                      petType
                    )
                  }
                />
              ))}
            </div>
          </FilterGroup>

          {/* BRAND */}

          <FilterGroup
            title="Brand"
            subtitle="Shop by trusted brands"
            open={expandedGroups.brand}
            onToggle={() =>
              toggleGroup('brand')
            }
          >
            <div className="space-y-0.5">
              {brandsToShow.map((brand) => (
                <Checkbox
                  key={brand}
                  label={brand}
                  count={
                    brandFacetCounts[brand]
                  }
                  checked={getList(
                    'brand'
                  ).includes(brand)}
                  onChange={() =>
                    toggleListValue(
                      'brand',
                      brand
                    )
                  }
                />
              ))}
            </div>

            {BRANDS.length > 6 && (
              <button
                type="button"
                onClick={() =>
                  setShowAllBrands(
                    (current) => !current
                  )
                }
                className="
                  mt-2
                  text-xs
                  font-semibold
                  text-coral
                  hover:underline
                "
              >
                {showAllBrands
                  ? 'Show Less'
                  : '+ Show More'}
              </button>
            )}
          </FilterGroup>

          {/* PRICE */}

          <FilterGroup
            title="Price"
            subtitle="Choose your budget"
            open={expandedGroups.price}
            onToggle={() =>
              toggleGroup('price')
            }
          >
            <PriceRange
              min={
                searchParams.get(
                  'minPrice'
                ) || ''
              }
              max={
                searchParams.get(
                  'maxPrice'
                ) || ''
              }
              onApply={setPriceRange}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <QuickPrice
                label="Under ₹500"
                active={
                  searchParams.get(
                    'maxPrice'
                  ) === '500'
                }
                onClick={() =>
                  setPriceRange(
                    '',
                    '500'
                  )
                }
              />

              <QuickPrice
                label="₹500 – ₹1,000"
                active={
                  searchParams.get(
                    'minPrice'
                  ) === '500' &&
                  searchParams.get(
                    'maxPrice'
                  ) === '1000'
                }
                onClick={() =>
                  setPriceRange(
                    '500',
                    '1000'
                  )
                }
              />

              <QuickPrice
                label="₹1,000+"
                active={
                  searchParams.get(
                    'minPrice'
                  ) === '1000' &&
                  !searchParams.get(
                    'maxPrice'
                  )
                }
                onClick={() =>
                  setPriceRange(
                    '1000',
                    ''
                  )
                }
              />
            </div>
          </FilterGroup>

          {/* PRODUCT TYPE */}

          <FilterGroup
            title="Product Type"
            subtitle="What are you shopping for?"
            open={expandedGroups.productType}
            onToggle={() =>
              toggleGroup('productType')
            }
          >
            <div className="space-y-0.5">
              {PRODUCT_TYPES.map(
                (productType) => (
                  <Checkbox
                    key={productType}
                    label={productType}
                    checked={getList(
                      'type'
                    ).includes(
                      productType
                    )}
                    onChange={() =>
                      toggleListValue(
                        'type',
                        productType
                      )
                    }
                  />
                )
              )}
            </div>
          </FilterGroup>

          {/* SPECIAL NEEDS */}

          <FilterGroup
            title="Special Needs"
            subtitle="Health & dietary preferences"
            open={
              expandedGroups.specialNeeds
            }
            onToggle={() =>
              toggleGroup(
                'specialNeeds'
              )
            }
          >
            <div className="space-y-0.5">
              {SPECIAL_NEEDS.map(
                (need) => (
                  <Checkbox
                    key={need}
                    label={need}
                    checked={getList(
                      'special'
                    ).includes(need)}
                    onChange={() =>
                      toggleListValue(
                        'special',
                        need
                      )
                    }
                  />
                )
              )}
            </div>
          </FilterGroup>

          {/* RATING */}

          <FilterGroup
            title="Customer Rating"
            subtitle="Minimum rating"
            open={expandedGroups.rating}
            onToggle={() =>
              toggleGroup('rating')
            }
            last
          >
            <div className="space-y-1">
              {RATINGS.map((rating) => (
                <RatingOption
                  key={rating}
                  rating={rating}
                  checked={
                    searchParams.get(
                      'minRating'
                    ) ===
                    String(rating)
                  }
                  onChange={() =>
                    setRating(rating)
                  }
                />
              ))}
            </div>
          </FilterGroup>
        </div>

        {/* Footer */}

        <div
          className="
            shrink-0
            border-t
            border-navy/10
            bg-white
            px-5
            py-4
          "
        >
          <div className="flex gap-3">
            <button
              type="button"
              onClick={clearAll}
              className="
                flex-1
                rounded-xl
                border
                border-navy/15
                px-4
                py-3
                text-sm
                font-semibold
                text-navy
                transition
                hover:bg-navy/5
              "
            >
              Clear All
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                flex-[1.5]
                rounded-xl
                bg-navy
                px-4
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-navy/90
              "
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Check size={16} />
                Apply Filters
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ─────────────────────────────────────────────
   FILTER GROUP
───────────────────────────────────────────── */

function FilterGroup({
  title,
  subtitle,
  children,
  open,
  onToggle,
  last = false,
}) {
  return (
    <div
      className={`
        py-4
        ${last ? '' : 'border-b border-navy/10'}
      `}
    >
      <button
        type="button"
        onClick={onToggle}
        className="
          flex
          w-full
          items-center
          justify-between
          text-left
        "
      >
        <span>
          <span className="block text-sm font-semibold text-navy">
            {title}
          </span>

          {subtitle && (
            <span className="mt-0.5 block text-[11px] text-navy/45">
              {subtitle}
            </span>
          )}
        </span>

        {open ? (
          <ChevronUp
            size={17}
            className="text-navy/50"
          />
        ) : (
          <ChevronDown
            size={17}
            className="text-navy/50"
          />
        )}
      </button>

      {open && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHECKBOX
───────────────────────────────────────────── */

function Checkbox({
  label,
  checked,
  onChange,
  count,
}) {
  return (
    <label
      className="
        flex
        cursor-pointer
        items-center
        justify-between
        gap-3
        rounded-lg
        px-2
        py-2
        text-sm
        text-navy/80
        transition
        hover:bg-navy/[0.035]
      "
    >
      <span className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="
            h-4
            w-4
            rounded
            border-navy/25
            text-coral
            accent-coral
            focus:ring-coral/30
          "
        />

        <span>{label}</span>
      </span>

      {count != null && (
        <span className="text-xs text-navy/35">
          ({count})
        </span>
      )}
    </label>
  );
}

/* ─────────────────────────────────────────────
   PET TYPE CHIP
───────────────────────────────────────────── */

function FilterChip({
  label,
  checked,
  onChange,
}) {
  return (
    <label
      className={`
        flex
        cursor-pointer
        items-center
        justify-center
        rounded-xl
        border
        px-3
        py-2.5
        text-xs
        font-medium
        transition
        ${
          checked
            ? 'border-coral bg-coral/10 text-coral'
            : 'border-navy/10 bg-white text-navy/70 hover:border-navy/20 hover:bg-navy/[0.025]'
        }
      `}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />

      <span>{label}</span>
    </label>
  );
}

/* ─────────────────────────────────────────────
   RATING
───────────────────────────────────────────── */

function RatingOption({
  rating,
  checked,
  onChange,
}) {
  return (
    <label
      className="
        flex
        cursor-pointer
        items-center
        gap-2
        rounded-lg
        px-2
        py-2
        text-sm
        transition
        hover:bg-navy/[0.035]
      "
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="
          h-4
          w-4
          rounded
          border-navy/25
          text-coral
          accent-coral
        "
      />

      <span className="tracking-wide text-amber-500">
        {'★'.repeat(rating)}
      </span>

      <span className="text-xs text-navy/50">
        &amp; above
      </span>
    </label>
  );
}

/* ─────────────────────────────────────────────
   PRICE RANGE
───────────────────────────────────────────── */

function PriceRange({
  min,
  max,
  onApply,
}) {
  const [localMin, setLocalMin] =
    useState(min);

  const [localMax, setLocalMax] =
    useState(max);

  useEffect(() => {
    setLocalMin(min);
    setLocalMax(max);
  }, [min, max]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-navy/40">
            ₹
          </span>

          <input
            type="number"
            min="0"
            placeholder="Min"
            value={localMin}
            onChange={(event) =>
              setLocalMin(
                event.target.value
              )
            }
            className="
              field-input
              w-full
              py-2
              pl-7
              text-xs
            "
          />
        </div>

        <span className="text-navy/30">
          –
        </span>

        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-navy/40">
            ₹
          </span>

          <input
            type="number"
            min="0"
            placeholder="Max"
            value={localMax}
            onChange={(event) =>
              setLocalMax(
                event.target.value
              )
            }
            className="
              field-input
              w-full
              py-2
              pl-7
              text-xs
            "
          />
        </div>

        <button
          type="button"
          onClick={() =>
            onApply(
              localMin,
              localMax
            )
          }
          className="
            rounded-lg
            bg-navy
            px-3
            py-2
            text-xs
            font-semibold
            text-white
            transition
            hover:bg-navy/90
          "
        >
          Go
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   QUICK PRICE
───────────────────────────────────────────── */

function QuickPrice({
  label,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-lg
        border
        px-2.5
        py-1.5
        text-[11px]
        font-medium
        transition
        ${
          active
            ? 'border-coral bg-coral/10 text-coral'
            : 'border-navy/10 text-navy/60 hover:border-navy/20 hover:bg-navy/[0.025]'
        }
      `}
    >
      {label}
    </button>
  );
}