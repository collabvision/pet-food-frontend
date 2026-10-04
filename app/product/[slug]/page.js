"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  Star,
  Minus,
  Plus,
  Heart,
  Share2,
  Check,
  ShieldCheck,
  ArrowLeft,
  Truck,
  RotateCcw,
  Stethoscope,
  ShoppingCart,
  Zap,
  ChevronRight,
  PackageCheck,
  PawPrint,
  BadgeCheck,
  Clock3,
  MapPin,
} from "lucide-react";

import { productService } from "@/lib/services";
import { useStore } from "@/store/useStore";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [activeTab, setActiveTab] = useState("description");
  const [selectedImage, setSelectedImage] = useState("");

  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const { addToCart } = useStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await productService.getBySlug(slug);

        if (res && res.success) {
          setProduct(res.data);

          if (res.data.unit) {
            setSelectedSize(res.data.unit);
          }

          if (res.data.images?.length > 0) {
            setSelectedImage(res.data.images[0].url);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);

      await addToCart(product._id, quantity);

      setAddedToCart(true);

      setTimeout(() => {
        setAddedToCart(false);
      }, 2200);
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fffaf7]">
        <div className="mb-4 rounded-full bg-[#ffe4df] p-5">
          <PawPrint className="text-[#ff6543]" size={40} />
        </div>

        <h1 className="text-2xl font-black text-[#102756]">
          Product not found
        </h1>

        <button
          onClick={() => router.back()}
          className="mt-5 rounded-full bg-[#102756] px-6 py-3 text-sm font-bold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const sizes = product.unit
    ? [product.unit, "10 kg", "15 kg"]
    : ["3 kg", "10 kg", "15 kg"];

  const images =
    product.images?.length > 0
      ? product.images
      : [
          {
            url:
              selectedImage ||
              "https://images.unsplash.com/photo-1589924691995-400dc9ecc119",
          },
        ];

  const discount =
    product.compareAtPrice && product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) /
            product.compareAtPrice) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#fffaf7] text-[#102756]">
      {/* ------------------------------------------------ */}
      {/* TOP SHIPPING STRIP                              */}
      {/* ------------------------------------------------ */}

      <div className="bg-[#102756] px-4 py-2.5 text-white">
        <div className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-between gap-3 text-[11px] font-bold sm:text-xs">
          <div className="flex flex-wrap items-center gap-5 sm:gap-8">
            <span className="flex items-center gap-2">
              <Truck size={14} />
              Free shipping on orders above ₹999
            </span>

            <span className="hidden items-center gap-2 sm:flex">
              <Stethoscope size={14} />
              Vet approved products
            </span>

            <span className="hidden items-center gap-2 md:flex">
              <ShieldCheck size={14} />
              100% authentic & safe
            </span>
          </div>

          <span className="hidden items-center gap-2 sm:flex">
            Need help? WhatsApp us
          </span>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* NAVBAR                                          */}
      {/* ------------------------------------------------ */}

      <header className="sticky top-0 z-40 border-b border-[#eee7e2] bg-[#fffaf7]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffe0da]">
              <PawPrint
                size={27}
                className="fill-[#ff6543] text-[#ff6543]"
              />
            </div>

            <div className="leading-none">
              <div className="text-[23px] font-black tracking-[-1.5px]">
                FurNest
              </div>

              <div className="mt-1 text-[7px] font-bold text-[#748096]">
                Happy Pets. Happier Humans.
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold lg:flex">
            <Link href="/">Shop</Link>
            <Link href="/pet-care">Pet Care</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/vet-approved">Vet Approved</Link>
            <Link href="/community">Community</Link>
            <Link href="/offers">Offers</Link>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden h-10 w-[260px] items-center rounded-xl border border-[#e7e2de] bg-white px-3 lg:flex">
              <span className="text-xs text-[#98a0ad]">
                Search for food, toys, supplements...
              </span>
            </div>

            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <Heart size={19} />
            </button>

            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <ShoppingCart size={19} />

              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6543] px-1 text-[9px] font-black text-white">
                3
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------ */}
      {/* MAIN                                        */}
      {/* ------------------------------------------------ */}

      <main className="mx-auto max-w-[1450px] px-4 py-5 sm:px-6 lg:py-7">
        {/* Breadcrumb */}

        <div className="mb-5 flex items-center gap-2 overflow-hidden text-xs font-medium text-[#7a8496]">
          <button
            onClick={() => router.back()}
            className="flex shrink-0 items-center gap-1.5 font-bold text-[#102756]"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <span>/</span>

          <Link href="/" className="shrink-0 hover:text-[#ff6543]">
            Home
          </Link>

          <span>/</span>

          <Link href="/products" className="shrink-0 hover:text-[#ff6543]">
            Dog Food
          </Link>

          <span>/</span>

          <span className="truncate font-bold text-[#102756]">
            {product.name}
          </span>
        </div>

        {/* ------------------------------------------------ */}
        {/* PRODUCT HERO                                     */}
        {/* ------------------------------------------------ */}

        <section className="grid gap-6 lg:grid-cols-[1.04fr_.96fr]">
          {/* --------------------------------------------- */}
          {/* IMAGE SIDE                                    */}
          {/* --------------------------------------------- */}

          <div>
            <div className="relative overflow-hidden rounded-[30px] border border-[#eee5df] bg-white p-4 shadow-[0_12px_45px_rgba(31,45,75,.06)] sm:p-7">
              {/* decorative circles */}

              <div className="absolute -left-14 -top-14 h-40 w-40 rounded-full bg-[#ffe1d8]" />

              <div className="absolute -bottom-20 -right-10 h-48 w-48 rounded-full bg-[#e0f2e7]" />

              {/* badge */}

              {discount > 0 && (
                <div className="absolute left-7 top-7 z-20 rounded-full bg-[#ff6543] px-4 py-2 text-xs font-black text-white shadow-lg">
                  {discount}% OFF
                </div>
              )}

              {/* wishlist */}

              <button
                onClick={() => setWishlist(!wishlist)}
                className={`absolute right-7 top-7 z-20 flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm transition ${
                  wishlist
                    ? "border-[#ffb0a2] text-[#ff6543]"
                    : "border-[#eee7e2] text-[#718097]"
                }`}
              >
                <Heart
                  size={20}
                  className={wishlist ? "fill-[#ff6543]" : ""}
                />
              </button>

              {/* Main image */}

              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[25px] bg-gradient-to-br from-[#fff9f4] to-[#f7f4ee] p-7 sm:p-10">
                <img
                  src={selectedImage || images[0].url}
                  alt={product.name}
                  className="relative z-10 h-full w-full object-contain drop-shadow-[0_20px_25px_rgba(40,40,40,.16)] transition duration-500 hover:scale-[1.04]"
                />

                <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/90 px-5 py-2 text-[10px] font-bold text-[#566176] shadow-sm backdrop-blur">
                  Premium care for happier pets 🐾
                </div>
              </div>

              {/* thumbnails */}

              <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img.url)}
                    className={`h-[74px] w-[74px] shrink-0 rounded-2xl border-2 bg-[#fffaf7] p-2 transition ${
                      selectedImage === img.url
                        ? "border-[#ff6543] bg-[#fff1ec] shadow-md"
                        : "border-[#eee5df] hover:border-[#ffb7a7]"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* trust badges */}

            <div className="mt-4 grid grid-cols-3 gap-3">
              <TrustBadge
                icon={<Stethoscope size={19} />}
                title="Vet Approved"
                text="Expert selected"
                color="green"
              />

              <TrustBadge
                icon={<ShieldCheck size={19} />}
                title="100% Original"
                text="Authentic product"
                color="blue"
              />

              <TrustBadge
                icon={<RotateCcw size={19} />}
                title="Easy Returns"
                text="Hassle-free"
                color="orange"
              />
            </div>
          </div>

          {/* --------------------------------------------- */}
          {/* PRODUCT INFO                                  */}
          {/* --------------------------------------------- */}

          <div className="rounded-[30px] border border-[#eee5df] bg-white p-5 shadow-[0_12px_45px_rgba(31,45,75,.05)] sm:p-7">
            {/* Brand */}

            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-[#e9f6ed] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#27845c]">
                Vet Approved
              </span>

              <button className="rounded-full bg-[#f8f6f3] p-2.5 text-[#6d788c]">
                <Share2 size={18} />
              </button>
            </div>

            {/* Title */}

            <h1 className="max-w-2xl text-[30px] font-black leading-[1.08] tracking-[-1.5px] text-[#102756] sm:text-[39px]">
              {product.name}
            </h1>

            {/* rating */}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-full bg-[#fff3d7] px-3 py-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-[#ffae28] text-[#ffae28]"
                  />
                ))}

                <span className="ml-1 text-xs font-black text-[#8c6420]">
                  {product.rating != null
                    ? Number(product.rating).toFixed(1)
                    : "—"}
                </span>
              </div>

              <span className="text-xs font-semibold text-[#788296]">
                {product.reviewCount ?? 0} verified reviews
              </span>

              <span className="h-1 w-1 rounded-full bg-[#c4cad2]" />

              <span className="text-xs font-bold text-[#29915f]">
                In stock
              </span>
            </div>

            {/* price */}

            <div className="mt-6 rounded-[22px] bg-gradient-to-r from-[#fff4ed] to-[#fffaf7] p-5">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-[38px] font-black tracking-[-1.5px] text-[#102756]">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>

                {product.compareAtPrice && (
                  <span className="mb-1 text-base font-semibold text-[#9ca3af] line-through">
                    ₹
                    {Number(product.compareAtPrice).toLocaleString("en-IN")}
                  </span>
                )}

                {discount > 0 && (
                  <span className="mb-1 rounded-full bg-[#ff6543] px-3 py-1 text-xs font-black text-white">
                    SAVE {discount}%
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs font-medium text-[#68748a]">
                Inclusive of all taxes
              </p>
            </div>

            {/* description */}

            <p className="mt-5 text-[14px] font-medium leading-6 text-[#5e697d]">
              {product.description ||
                "Complete and balanced nutrition for your pet. Carefully selected ingredients support healthy digestion, strong immunity and everyday happiness."}
            </p>

            {/* highlights */}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniBenefit text="Supports healthy digestion" />
              <MiniBenefit text="Promotes ideal weight" />
              <MiniBenefit text="Highly digestible protein" />
              <MiniBenefit text="Omega enriched formula" />
            </div>

            {/* size */}

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black text-[#102756]">
                  Choose Size
                </h3>

                <span className="text-[11px] font-medium text-[#8790a0]">
                  Select your preferred pack
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-xl border px-5 py-3 text-sm font-black transition ${
                      selectedSize === size
                        ? "border-[#102756] bg-[#102756] text-white shadow-lg"
                        : "border-[#dedfe3] bg-white text-[#536078] hover:border-[#ff6543] hover:text-[#ff6543]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* quantity */}

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-black text-[#102756]">
                Quantity
              </h3>

              <div className="flex w-fit items-center overflow-hidden rounded-xl border border-[#dedfe3] bg-white">
                <button
                  onClick={() =>
                    setQuantity(Math.max(1, quantity - 1))
                  }
                  className="flex h-11 w-11 items-center justify-center text-[#536078] hover:bg-[#fff4ef]"
                >
                  <Minus size={16} />
                </button>

                <span className="flex h-11 w-12 items-center justify-center border-x border-[#dedfe3] text-sm font-black">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-11 w-11 items-center justify-center text-[#536078] hover:bg-[#fff4ef]"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* actions */}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`flex h-14 items-center justify-center gap-2 rounded-2xl text-sm font-black shadow-lg transition active:scale-[.98] ${
                  addedToCart
                    ? "bg-[#29915f] text-white"
                    : "bg-[#102756] text-white hover:bg-[#173a78]"
                }`}
              >
                {addingToCart ? (
                  "Adding..."
                ) : addedToCart ? (
                  <>
                    <Check size={19} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={19} />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#ff6543] text-sm font-black text-white shadow-lg shadow-[#ff6543]/20 transition hover:bg-[#f45332] active:scale-[.98]"
              >
                <Zap size={19} />
                Buy Now
              </button>
            </div>

            {/* delivery */}

            <div className="mt-4 rounded-2xl border border-[#f1dfc9] bg-[#fff9ef] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white p-2.5 text-[#ed8a24] shadow-sm">
                  <Truck size={19} />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-black text-[#102756]">
                    Fast & Reliable Delivery
                  </p>

                  <p className="mt-1 text-[11px] text-[#788296]">
                    Free delivery available on eligible orders
                  </p>
                </div>

                <ChevronRight size={17} className="text-[#9aa2b0]" />
              </div>
            </div>

            {/* delivery location */}

            <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-[#69748a]">
              <MapPin size={15} className="text-[#ff6543]" />
              Delivering to your location
              <span className="font-black text-[#102756]">
                • Check availability
              </span>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ */}
        {/* WHY FURNEST                                     */}
        {/* ------------------------------------------------ */}

        <section className="mt-8 overflow-hidden rounded-[30px] bg-[#102756] p-5 text-white sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_1.6fr] lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[#ffb09d]">
                <PawPrint size={21} />
                <span className="text-xs font-black uppercase tracking-widest">
                  FurNest Promise
                </span>
              </div>

              <h2 className="text-[29px] font-black leading-tight tracking-[-1px] sm:text-[36px]">
                Better products.
                <br />
                Happier pets. ❤️
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-[#d5dced]">
                Everything we offer is selected with your pet's health,
                happiness and everyday comfort in mind.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <PromiseCard
                icon={<Stethoscope />}
                title="Vet Approved"
                text="Carefully selected"
              />

              <PromiseCard
                icon={<BadgeCheck />}
                title="Authentic"
                text="100% genuine"
              />

              <PromiseCard
                icon={<Truck />}
                title="Fast Delivery"
                text="At your doorstep"
              />

              <PromiseCard
                icon={<Heart />}
                title="Pet Parents"
                text="Loved by 50K+"
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ */}
        {/* PRODUCT INFORMATION                             */}
        {/* ------------------------------------------------ */}

        <section className="mt-8 rounded-[30px] border border-[#eee5df] bg-white p-5 shadow-[0_10px_40px_rgba(31,45,75,.04)] sm:p-8">
          <div className="mb-6 overflow-x-auto border-b border-[#eee8e3]">
            <div className="flex min-w-max gap-7">
              {[
                ["description", "Description"],
                ["ingredients", "Ingredients"],
                ["feeding guide", "Feeding Guide"],
                ["reviews", "Reviews"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative pb-4 text-sm font-black transition ${
                    activeTab === key
                      ? "text-[#102756]"
                      : "text-[#8a93a2] hover:text-[#102756]"
                  }`}
                >
                  {label}

                  {activeTab === key && (
                    <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-[#ff6543]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "description" && (
            <DescriptionTab product={product} />
          )}

          {activeTab === "ingredients" && <IngredientsTab />}

          {activeTab === "feeding guide" && <FeedingTab />}

          {activeTab === "reviews" && <ReviewsTab product={product} />}
        </section>

        {/* ------------------------------------------------ */}
        {/* BOTTOM PET CARE BANNER                          */}
        {/* ------------------------------------------------ */}

        <section className="relative mt-8 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#ffe7df] via-[#fff4e9] to-[#e3f3e7] p-6 sm:p-10">
          <div className="relative z-10 max-w-[530px]">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#102756] shadow-sm">
              <PawPrint size={15} className="text-[#ff6543]" />
              Happy pets. Happier humans.
            </span>

            <h2 className="mt-4 text-[31px] font-black leading-tight tracking-[-1px] text-[#102756] sm:text-[40px]">
              Stronger.
              <br />
              Healthier.
              <br />
              Happier together. ❤️
            </h2>

            <p className="mt-3 max-w-[460px] text-sm leading-6 text-[#5d687d]">
              Give your furry friend the care they deserve with products
              chosen by FurNest for everyday happiness.
            </p>

            <Link
              href="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#102756] px-6 py-3.5 text-sm font-black text-white shadow-lg"
            >
              Explore More Products
              <ChevronRight size={17} />
            </Link>
          </div>

          <div className="absolute bottom-[-55px] right-[-25px] hidden w-[430px] md:block">
            <img
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=90"
              alt="Happy dog"
              className="h-[340px] w-full rounded-[50%] object-cover"
            />
          </div>

          <div className="absolute right-8 top-8 hidden rotate-6 text-center text-sm font-black leading-5 text-[#102756] md:block">
            Good Pets
            <br />
            Brighter Days
            <br />
            Always ♥
          </div>
        </section>
      </main>
    </div>
  );
}

/* ====================================================== */
/* COMPONENTS                                            */
/* ====================================================== */

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fffaf7]">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-[#ffe1d8]">
          <PawPrint
            size={31}
            className="fill-[#ff6543] text-[#ff6543]"
          />
        </div>

        <p className="mt-4 text-sm font-bold text-[#102756]">
          Finding something special for your pet...
        </p>
      </div>
    </div>
  );
}

function TrustBadge({ icon, title, text, color }) {
  const colors = {
    green: "bg-[#e8f6ee] text-[#29885e]",
    blue: "bg-[#e9effc] text-[#355da8]",
    orange: "bg-[#fff0e5] text-[#e4872c]",
  };

  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-[#eee5df] bg-white p-3 shadow-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colors[color]}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-black text-[#102756]">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[9px] font-medium text-[#8790a0]">
          {text}
        </p>
      </div>
    </div>
  );
}

function MiniBenefit({ text }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#f7fbf7] px-3 py-2.5">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d9f0df]">
        <Check size={12} className="text-[#27845c]" strokeWidth={3} />
      </div>

      <span className="text-[11px] font-bold text-[#536078]">
        {text}
      </span>
    </div>
  );
}

function PromiseCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#ffb09d]">
        {icon}
      </div>

      <p className="text-xs font-black">{title}</p>

      <p className="mt-1 text-[10px] text-[#c9d0df]">{text}</p>
    </div>
  );
}

function DescriptionTab({ product }) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h3 className="text-xl font-black text-[#102756]">
          Made for happier, healthier pets
        </h3>

        <p className="mt-3 text-sm leading-7 text-[#667187]">
          {product.description ||
            "Complete and balanced nutrition designed to support your pet's everyday health and wellbeing."}
        </p>

        <ul className="mt-5 space-y-3">
          {[
            "Supports bone & joint health",
            "Promotes healthy body weight",
            "Highly digestible proteins",
            "Enriched with essential nutrients",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-sm font-semibold text-[#536078]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dff2e5]">
                <Check
                  size={13}
                  className="text-[#29885e]"
                  strokeWidth={3}
                />
              </span>

              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative overflow-hidden rounded-[25px] bg-[#fff0e8] p-6">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#ffd3c6]" />

        <div className="relative z-10">
          <span className="text-xs font-black uppercase tracking-wider text-[#ff6543]">
            FurNest Care
          </span>

          <h3 className="mt-2 text-[28px] font-black leading-tight text-[#102756]">
            Stronger
            <br />
            Happier
            <br />
            Together ❤️
          </h3>

          <p className="mt-3 max-w-sm text-xs leading-5 text-[#69748a]">
            Quality products selected to make everyday pet care simpler and
            better.
          </p>
        </div>

        <img
          src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=90"
          alt="Happy dog"
          className="relative z-10 mt-5 h-[190px] w-full rounded-[25px] object-cover"
        />
      </div>
    </div>
  );
}

function IngredientsTab() {
  const ingredients = [
    "High-quality proteins",
    "Essential Omega fatty acids",
    "Balanced vitamins & minerals",
    "Digestive support nutrients",
    "No unnecessary fillers",
    "Carefully selected ingredients",
  ];

  return (
    <div>
      <h3 className="text-xl font-black text-[#102756]">
        Carefully selected ingredients
      </h3>

      <p className="mt-2 text-sm text-[#69748a]">
        Quality ingredients designed to support everyday nutrition.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ingredients.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-2xl bg-[#f8fbf8] p-4"
          >
            <div className="rounded-full bg-[#dff1e4] p-2 text-[#29885e]">
              <Check size={15} />
            </div>

            <span className="text-sm font-bold text-[#536078]">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedingTab() {
  return (
    <div>
      <h3 className="text-xl font-black text-[#102756]">
        Simple feeding guide
      </h3>

      <p className="mt-2 text-sm text-[#69748a]">
        Adjust portions based on your pet's size, age and activity level.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#eee5df]">
        <div className="grid grid-cols-3 bg-[#102756] px-4 py-3 text-xs font-black text-white">
          <span>Pet Size</span>
          <span>Daily Amount</span>
          <span>Meals</span>
        </div>

        {[
          ["Small", "50–100 g", "2 meals"],
          ["Medium", "100–200 g", "2 meals"],
          ["Large", "200–350 g", "2–3 meals"],
        ].map((row) => (
          <div
            key={row[0]}
            className="grid grid-cols-3 border-t border-[#eee5df] px-4 py-4 text-xs font-semibold text-[#5d687d]"
          >
            <span>{row[0]}</span>
            <span>{row[1]}</span>
            <span>{row[2]}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3 rounded-2xl bg-[#fff7e9] p-4 text-xs font-medium text-[#796037]">
        <Clock3 size={18} className="shrink-0 text-[#ed9b30]" />
        Always provide fresh drinking water alongside meals.
      </div>
    </div>
  );
}

function ReviewsTab({ product }) {
  const rating = product.rating != null ? Number(product.rating) : 0;

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <div className="rounded-[25px] bg-[#fff6e5] p-6 text-center">
          <div className="text-[50px] font-black text-[#102756]">
            {rating ? rating.toFixed(1) : "—"}
          </div>

          <div className="mt-1 flex justify-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                className="fill-[#ffae28] text-[#ffae28]"
              />
            ))}
          </div>

          <p className="mt-3 text-xs font-semibold text-[#737c8c]">
            Based on {product.reviewCount ?? 0} reviews
          </p>
        </div>

        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className="flex items-center gap-3"
            >
              <span className="w-8 text-xs font-bold text-[#69748a]">
                {star} ★
              </span>

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eeeef0]">
                <div
                  className="h-full rounded-full bg-[#ffae28]"
                  style={{
                    width:
                      star === 5
                        ? "85%"
                        : star === 4
                        ? "65%"
                        : star === 3
                        ? "30%"
                        : "10%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}