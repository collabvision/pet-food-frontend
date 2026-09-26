import Link from "next/link";
import HomeProductCard from "@/components/HomeProductCard";
import {
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Stethoscope,
  Headphones,
  ArrowRight,
  CheckCircle2,
  PawPrint,
  Star,
  Sparkles,
  Search,
  UserRound,
} from "lucide-react";

import {
  getCategories,
  getFeaturedProducts,
} from "../lib/products";

/* =========================================================
   IMAGE DATA
   ========================================================= */

const images = {
  hero:
    "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1600&q=90",

  nutrition:
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=90",

  wellness:
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=90",

  toys:
    "https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&w=900&q=90",

  food:
    "https://images.unsplash.com/photo-1589924691106-073b9fafa1e9?auto=format&fit=crop&w=900&q=90",

  cat:
    "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=90",

  expert:
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=90",

  dogArticle:
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=90",

  catArticle:
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=90",

  birdArticle:
    "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=90",

  community:
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=90",

  dog:
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=85",

  bird:
    "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=500&q=85",

  fish:
    "https://images.unsplash.com/photo-1520302519878-8c1a0d7b8b31?auto=format&fit=crop&w=500&q=85",

  rabbit:
    "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=500&q=85",

  smallPet:
    "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=500&q=85",
};


/* =========================================================
   CATEGORY VISUALS
   ========================================================= */

const categoryVisuals = {
  dog: images.dog,
  cat: images.cat,
  bird: images.bird,
  fish: images.fish,
  "small pets": images.smallPet,
  food: images.food,
  treats: images.food,
  vet: images.expert,
  supplements: images.food,
  grooming: images.dog,
  toys: images.toys,
  accessories: images.dog,
  prescriptions: images.expert,
};


/* =========================================================
   PAGE
   ========================================================= */

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(6),
  ]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf5] text-[#142653]">

      {/* =====================================================
          HERO
          ===================================================== */}

      <HeroSection />


      {/* =====================================================
          CATEGORY STRIP
          ===================================================== */}

      <CategoryStrip categories={categories} />


      {/* =====================================================
          TRUST STRIP
          ===================================================== */}

      <TrustStrip />


      {/* =====================================================
          THREE FEATURE CARDS
          ===================================================== */}

      <FeatureSection />


      {/* =====================================================
          FEATURED PRODUCTS
          ===================================================== */}

      <FeaturedProducts products={featured} />


      {/* =====================================================
          EXPERT + ARTICLES
          ===================================================== */}

      <ExpertSection />


      {/* =====================================================
          COMMUNITY
          ===================================================== */}

      <CommunitySection />

    </main>
  );
}


/* =========================================================
   HERO
   ========================================================= */

function HeroSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-3 pt-3 sm:px-5 lg:px-6">

      <div className="grid gap-3 lg:grid-cols-[2.08fr_0.92fr]">

        {/* MAIN HERO */}

        <div className="relative min-h-[420px] overflow-hidden rounded-[24px] bg-[#142653] sm:min-h-[500px]">

          <img
            src={images.hero}
            alt="Happy pets"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#142653] via-[#142653]/80 to-[#142653]/10" />

          {/* decorative elements */}

          <div className="absolute left-7 top-6 text-4xl">
            🧡
          </div>

          <div className="absolute bottom-5 left-5 text-4xl">
            🌿
          </div>

          <div className="absolute right-[34%] top-12 text-2xl">
            ✨
          </div>

          {/* content */}

          <div className="relative z-10 flex h-full max-w-[620px] flex-col justify-center px-7 py-12 sm:px-10 lg:px-12">

            <p className="text-sm font-semibold text-white/80">
              Different Pets, Same Love
            </p>

            <h1 className="mt-3 font-display text-[42px] font-bold leading-[0.94] tracking-tight text-white sm:text-[52px] lg:text-[62px]">
              A Happier Tomorrow
              <br />
              for Your
              <br />
              <span className="text-[#ff876f]">
                Best Friend
              </span>
            </h1>

            <p className="mt-5 max-w-[400px] text-sm leading-6 text-white/85 sm:text-[15px]">
              Premium pet food, trusted care, expert advice
              and a loving community — all in one place.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#ff8973] px-7 py-3 text-sm font-bold text-[#142653] transition hover:-translate-y-0.5 hover:bg-[#ff9c88]"
            >
              Shop Now
              <ArrowRight size={17} />
            </Link>

          </div>

          {/* speech bubble */}

          <div className="absolute bottom-8 right-6 hidden w-[150px] rotate-[-4deg] rounded-[50%] bg-white px-5 py-6 text-center shadow-xl sm:block">

            <p className="font-display text-sm font-bold leading-5 text-[#142653]">
              Pets aren't
              <br />
              just animals,
              <br />
              they're family.
            </p>

            <span className="absolute bottom-[-5px] left-8">
              ❤️
            </span>

          </div>

        </div>


        {/* PROMO CARDS */}

        <div className="grid gap-3">

          <PromoCard
            image={images.nutrition}
            eyebrow="Personalized"
            title="Nutrition for a Longer, Happier Life"
            points={[
              "Tailored by age, breed & needs",
              "Vet recommended",
              "Backed by science",
            ]}
            button="Explore Pet Care"
            href="/pet-care"
            background="#ffe7df"
          />

          <PromoCard
            image={images.wellness}
            eyebrow="Monthly"
            title="Wellness Box"
            description="Curated essentials for your pet's health, happiness and playtime."
            button="Explore Boxes"
            href="/products"
            background="#ffe0d8"
          />

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   PROMO CARD
   ========================================================= */

function PromoCard({
  image,
  eyebrow,
  title,
  points,
  description,
  button,
  href,
  background,
}) {
  return (
    <div
      className="relative grid min-h-[205px] grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-[22px]"
      style={{ background }}
    >

      {/* TEXT */}

      <div className="relative z-10 flex flex-col justify-center p-5 sm:p-6">

        <p className="font-display text-xl font-bold leading-none text-[#142653] sm:text-[22px]">
          {eyebrow}
        </p>

        <h2 className="mt-1 max-w-[220px] font-display text-[18px] font-bold leading-[1.05] text-[#142653] sm:text-[21px]">
          {title}
        </h2>

        {points && (
          <div className="mt-3 space-y-1">

            {points.map((point) => (
              <div
                key={point}
                className="flex items-center gap-1.5 text-[9px] font-medium text-[#142653]/75"
              >
                <CheckCircle2
                  size={13}
                  className="shrink-0 text-[#26956d]"
                />

                {point}
              </div>
            ))}

          </div>
        )}

        {description && (
          <p className="mt-2 max-w-[190px] text-[10px] leading-4 text-[#142653]/70">
            {description}
          </p>
        )}

        <Link
          href={href}
          className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-[#142653] px-4 py-2 text-[10px] font-bold text-white"
        >
          {button}
          <ArrowRight size={12} />
        </Link>

      </div>


      {/* IMAGE */}

      <div className="relative h-full min-h-[205px] overflow-hidden">

        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#ffe7df] to-transparent" />

      </div>

    </div>
  );
}


/* =========================================================
   CATEGORY STRIP
   ========================================================= */

function CategoryStrip({ categories = [] }) {

  const fallback = [
    "Dog",
    "Cat",
    "Bird",
    "Fish",
    "Small Pets",
    "Food",
    "Treats",
    "Vet",
    "Supplements",
    "Grooming",
    "Toys",
    "Accessories",
    "Prescriptions",
  ];

  const items =
    categories.length > 0
      ? categories.slice(0, 13)
      : fallback;

  return (
    <section className="mx-auto max-w-[1440px] px-3 pt-5 sm:px-5 lg:px-6">

      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {items.map((category, index) => {

          const name =
            typeof category === "string"
              ? category
              : category.name ||
                category.title ||
                `Category ${index + 1}`;

          const image =
            categoryVisuals[name.toLowerCase()] ||
            images.dog;

          return (
            <Link
              key={category._id || name}
              href={`/products?category=${encodeURIComponent(
                name.toLowerCase()
              )}`}
              className="group flex min-w-[70px] shrink-0 flex-col items-center"
            >

              <div className="flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#f9e8dc] shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md">

                <img
                  src={image}
                  alt={name}
                  className="h-full w-full object-cover"
                />

              </div>

              <span className="mt-2 text-center text-[10px] font-semibold text-[#142653]">
                {name}
              </span>

            </Link>
          );
        })}

      </div>

    </section>
  );
}


/* =========================================================
   TRUST STRIP
   ========================================================= */

function TrustStrip() {

  const items = [
    {
      icon: <Stethoscope size={27} />,
      title: "Vet Approved",
      subtitle: "Products",
    },
    {
      icon: <Truck size={27} />,
      title: "Fast & Reliable",
      subtitle: "Delivery",
    },
    {
      icon: <ShieldCheck size={27} />,
      title: "100% Authentic",
      subtitle: "& Safe",
    },
    {
      icon: <Headphones size={27} />,
      title: "Loved by 50K+",
      subtitle: "Pet Parents",
    },
  ];

  return (
    <section className="mx-auto max-w-[1440px] px-3 py-5 sm:px-5 lg:px-6">

      <div className="grid grid-cols-2 gap-2 rounded-[24px] bg-[#fff3e9] px-4 py-4 sm:grid-cols-4 sm:px-8">

        {items.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-center gap-2"
          >

            <div className="text-[#145c5a]">
              {item.icon}
            </div>

            <div>
              <p className="text-xs font-bold sm:text-sm">
                {item.title}
              </p>

              <p className="text-[10px] text-[#142653]/55 sm:text-xs">
                {item.subtitle}
              </p>
            </div>

          </div>
        ))}

      </div>

    </section>
  );
}


/* =========================================================
   FEATURE SECTION
   ========================================================= */

function FeatureSection() {

  return (
    <section className="mx-auto max-w-[1440px] px-3 pb-8 sm:px-5 lg:px-6">

      <div className="grid gap-4 lg:grid-cols-3">

        {/* TOYS */}

        <FeatureCard
          background="#cfeeda"
          title={
            <>
              Play
              <br />
              Learn
              <br />
              Bond
            </>
          }
          description="Explore our toy collection for endless happy moments."
          button="Shop Toys"
          href="/products?category=toys"
          image={images.toys}
          imagePosition="right"
        />


        {/* FOOD */}

        <FeatureCard
          background="#ffe1b9"
          title={
            <>
              Nutritious Meals
              <br />
              for a Brighter
              <br />
              Tomorrow
            </>
          }
          description="Better digestion, stronger immunity, healthier & happier pets."
          button="Shop Food"
          href="/products?category=food"
          image={images.food}
          imagePosition="right"
        />


        {/* CARE */}

        <FeatureCard
          background="#cce7f8"
          title={
            <>
              Care Beyond
              <br />
              Commerce
            </>
          }
          description="Expert advice, pet stories, care guides and a loving community."
          button="Read & Explore"
          href="/community"
          image={images.cat}
          imagePosition="right"
        />

      </div>

    </section>
  );
}


/* =========================================================
   FEATURE CARD
   ========================================================= */

function FeatureCard({
  background,
  title,
  description,
  button,
  href,
  image,
}) {

  return (
    <div
      className="grid min-h-[270px] grid-cols-[1fr_0.9fr] overflow-hidden rounded-[24px]"
      style={{ background }}
    >

      {/* TEXT SIDE */}

      <div className="flex flex-col justify-between p-6 sm:p-7">

        <div>

          <h3 className="font-display text-[23px] font-bold leading-[0.96] text-[#142653] sm:text-[26px]">
            {title}
          </h3>

          <p className="mt-4 max-w-[220px] text-[11px] leading-5 text-[#142653]/70 sm:text-xs">
            {description}
          </p>

        </div>

        <Link
          href={href}
          className="mt-6 inline-flex w-fit items-center gap-1 rounded-full bg-[#145c5a] px-4 py-2.5 text-[10px] font-bold text-white transition hover:bg-[#104c4b]"
        >
          {button}
          <ArrowRight size={12} />
        </Link>

      </div>


      {/* IMAGE SIDE */}

      <div className="relative min-h-[270px] overflow-hidden">

        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

      </div>

    </div>
  );
}


/* =========================================================
   FEATURED PRODUCTS
   ========================================================= */

function FeaturedProducts({ products = [] }) {

  return (
    <section className="mx-auto max-w-[1440px] px-3 py-8 sm:px-5 lg:px-6">

      <div className="mb-5 flex items-end justify-between">

        <div>

          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Featured for Your Furry Friends
          </h2>

          <p className="mt-1 text-xs text-[#142653]/60 sm:text-sm">
            Handpicked products for happier, healthier pets.
          </p>

        </div>

        <Link
          href="/products"
          className="hidden items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm sm:flex"
        >
          View All
          <ArrowRight size={14} />
        </Link>

      </div>


      {products.length > 0 ? (

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

          {products.slice(0, 6).map((product) => (
            <HomeProductCard
              key={product._id}
              product={product}
            />
          ))}

        </div>

      ) : (

        <div className="rounded-2xl bg-white p-10 text-center">
          <PawPrint
            size={42}
            className="mx-auto text-[#ff8066]"
          />

          <p className="mt-3 text-sm text-[#142653]/60">
            Featured products will appear here.
          </p>
        </div>

      )}

    </section>
  );
}





/* =========================================================
   EXPERT SECTION
   ========================================================= */

function ExpertSection() {

  const articles = [
    {
      image: images.dogArticle,
      title: "5 Tips for a Happier, Healthier Dog",
    },
    {
      image: images.catArticle,
      title: "Understanding Your Cat's Behavior",
    },
    {
      image: images.birdArticle,
      title: "Essential Care Tips for Pet Birds",
    },
  ];

  return (
    <section className="mx-auto max-w-[1440px] px-3 py-8 sm:px-5 lg:px-6">

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.55fr]">

        {/* EXPERT CARD */}

        <div className="grid min-h-[300px] grid-cols-[0.95fr_1.05fr] overflow-hidden rounded-[24px] bg-[#eee6f0]">

          {/* IMAGE */}

          <div className="relative min-h-[300px] overflow-hidden">

            <img
              src={images.expert}
              alt="Pet care expert"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />

          </div>


          {/* TEXT */}

          <div className="flex flex-col justify-center p-6 sm:p-7">

            <h2 className="font-display text-[29px] font-bold leading-[0.98] text-[#142653] sm:text-[32px]">
              Expert Advice
              <br />
              for Every Pet
              <br />
              Parent
            </h2>

            <p className="mt-5 text-[11px] leading-5 text-[#142653]/70 sm:text-xs">
              Tips, guides, and professional advice to keep
              your pets healthy and happy.
            </p>

            <Link
              href="/pet-care"
              className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#145c5a] px-5 py-3 text-xs font-bold text-white"
            >
              Read & Learn
              <ArrowRight size={14} />
            </Link>

          </div>

        </div>


        {/* ARTICLES */}

        <div>

          <div className="mb-4 flex items-center justify-between">

            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Latest from Our Pet Care Hub
            </h2>

            <Link
              href="/pet-care"
              className="hidden items-center gap-1 text-xs font-bold sm:flex"
            >
              View All Articles
              <ArrowRight size={14} />
            </Link>

          </div>


          <div className="grid gap-3 sm:grid-cols-3">

            {articles.map((article) => (
              <ArticleCard
                key={article.title}
                image={article.image}
                title={article.title}
              />
            ))}

          </div>

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   ARTICLE CARD
   ========================================================= */

function ArticleCard({ image, title }) {

  return (
    <Link
      href="/pet-care"
      className="group overflow-hidden rounded-[16px] bg-white shadow-sm"
    >

      <div className="aspect-[1.5/1] overflow-hidden">

        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

      </div>

      <div className="p-3">

        <p className="text-[11px] font-bold leading-4 sm:text-xs">
          {title}
        </p>

        <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#ff705d]">
          Read article
          <ArrowRight size={11} />
        </span>

      </div>

    </Link>
  );
}


/* =========================================================
   COMMUNITY
   ========================================================= */

function CommunitySection() {

  return (
    <section className="mx-auto max-w-[1440px] px-0 pb-0 sm:px-5 lg:px-6">

      <div className="relative min-h-[310px] overflow-hidden bg-[#ffd9d0] px-6 py-10 sm:rounded-[28px] sm:px-10">

        {/* IMAGE */}

        <img
          src={images.community}
          alt="Happy pets"
          className="absolute bottom-0 right-0 h-full w-[52%] object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#ffd9d0] via-[#ffd9d0]/95 to-transparent" />


        {/* CONTENT */}

        <div className="relative z-10 max-w-[510px]">

          <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            Join Our
            <br />
            Pet-Loving Community
          </h2>

          <p className="mt-3 max-w-[360px] text-sm leading-5 text-[#142653]/70">
            Share stories, get advice, and connect with
            fellow pet parents.
          </p>


          <div className="mt-5 flex flex-wrap gap-2">

            <span className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold">
              #FurNest
            </span>

            <span className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold">
              #HappyPets
            </span>

            <span className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold">
              #SmallButSpecial
            </span>

          </div>


          <Link
            href="/community"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ff705d] px-6 py-3 text-xs font-bold text-white"
          >
            Join Now
            <ArrowRight size={14} />
          </Link>

        </div>

      </div>

    </section>
  );
}