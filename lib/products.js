const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// These are PUBLIC read endpoints per the API docs (GET /products, GET
// /categories) — no Authorization header, no cookies needed. They run on the
// server (Server Components), so a slow/offline backend never blocks
// client-side JS or leaks anything to the browser beyond the HTML result.

async function safeFetch(path, { revalidate = 60 } = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    // Backend not reachable from the build/runtime environment — the pages
    // fall back to placeholder content below instead of crashing.
    return null;
  }
}

export async function getCategories() {
  const body = await safeFetch('/categories');
  if (body?.data?.length) return body.data;
  return FALLBACK_CATEGORIES;
}

export async function getProducts(searchParams = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, value);
  }
  const qs = params.toString();
  const body = await safeFetch(`/products${qs ? `?${qs}` : ''}`);
  if (body?.data) {
    return {
      items: body.data.items ?? body.data,
      total: body.data.total ?? body.data.length ?? 0,
      page: body.data.page ?? Number(searchParams.page || 1),
      pages: body.data.pages ?? 1,
    };
  }
  return FALLBACK_PRODUCTS_RESPONSE(searchParams);
}

export async function getFeaturedProducts(limit = 6) {
  const body = await safeFetch(`/products?sort=featured&limit=${limit}`);
  if (body?.data) return body.data.items ?? body.data;
  return FALLBACK_PRODUCTS.slice(0, limit);
}

// ---- Fallback content -------------------------------------------------
// Shown only while the backend at NEXT_PUBLIC_API_URL is unreachable (e.g.
// running the frontend on its own), so the UI always renders something
// coherent instead of an empty/broken page.

const FALLBACK_CATEGORIES = [
  { _id: 'dog', name: 'Dog', slug: 'dog', icon: '🐶' },
  { _id: 'cat', name: 'Cat', slug: 'cat', icon: '🐱' },
  { _id: 'bird', name: 'Bird', slug: 'bird', icon: '🦜' },
  { _id: 'fish', name: 'Fish', slug: 'fish', icon: '🐠' },
  { _id: 'small-pets', name: 'Small Pets', slug: 'small-pets', icon: '🐹' },
  { _id: 'food', name: 'Food', slug: 'food', icon: '🥫' },
  { _id: 'treats', name: 'Treats', slug: 'treats', icon: '🦴' },
  { _id: 'supplements', name: 'Supplements', slug: 'supplements', icon: '💊' },
  { _id: 'grooming', name: 'Grooming', slug: 'grooming', icon: '🧴' },
  { _id: 'toys', name: 'Toys', slug: 'toys', icon: '🎾' },
  { _id: 'accessories', name: 'Accessories', slug: 'accessories', icon: '🦮' },
  { _id: 'prescriptions', name: 'Prescriptions', slug: 'prescriptions', icon: '💉' },
];

const FALLBACK_PRODUCTS = [
  { _id: '1', slug: 'royal-canin-maxi-adult', name: 'Royal Canin Maxi Adult Dog Food', price: 1759, compareAtPrice: 2199, rating: 4.8, reviewCount: 320, badge: '20% OFF' },
  { _id: '2', slug: 'pedigree-chicken-veg', name: 'Pedigree Chicken & Veg Adult Dog Food', price: 719, compareAtPrice: 899, rating: 4.6, reviewCount: 210 },
  { _id: '3', slug: 'hills-prescription-diet-zd', name: "Hill's Prescription Diet z/d", price: 2249, compareAtPrice: 2849, rating: 4.7, reviewCount: 180, badge: 'Vet Approved' },
  { _id: '4', slug: 'drools-puppy-nutrition', name: 'Drools Puppy Nutrition 3kg', price: 799, compareAtPrice: 649, rating: 4.5, reviewCount: 120, badge: 'Bestseller' },
  { _id: '5', slug: 'orijen-original-dog-food', name: 'Orijen Original Dog Food', price: 4499, rating: 4.9, reviewCount: 410 },
  { _id: '6', slug: 'kong-classic-dog-toy', name: 'KONG Classic Dog Toy', price: 699, rating: 4.8, reviewCount: 550 },
];

function FALLBACK_PRODUCTS_RESPONSE(searchParams) {
  const page = Number(searchParams.page || 1);
  const limit = Number(searchParams.limit || 12);
  return {
    items: FALLBACK_PRODUCTS,
    total: FALLBACK_PRODUCTS.length,
    page,
    pages: Math.max(1, Math.ceil(FALLBACK_PRODUCTS.length / limit)),
  };
}
