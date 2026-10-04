import React from "react";
import {
  Search,
  User,
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Stethoscope,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Send,
  ChevronRight,
  ChevronDown,
  Handshake,
  HelpCircle,
  PawPrint,
} from "lucide-react";

function Instagram({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
  );
}

function Facebook({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
  );
}

function Youtube({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
  );
}

function Linkedin({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
  );
}

const dogHero =
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=90";

const catHero =
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=90";

const corgi =
  "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=90";

const dogHappy =
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=90";

const dogVet =
  "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=900&q=90";

const catSleep =
  "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=90";

const dogCat =
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1000&q=90";

const questions = [
  "How can I track my order?",
  "How long does delivery take?",
  "What is your return policy?",
  "Are your products genuine?",
  "Do you offer vet consultation?",
  "How can I become a partner?",
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffded7]">
        <div className="relative">
          <PawPrint
            size={31}
            strokeWidth={2.8}
            className="fill-[#ff633f] text-[#ff633f]"
          />
        </div>
      </div>

      <div className="leading-none">
        <div className="text-[25px] font-black tracking-[-1.5px] text-[#112955]">
          FurNest
        </div>
        <div className="mt-1 text-[8px] font-semibold tracking-wide text-[#64708a]">
          Happy Pets. Happier Humans.
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="bg-[#102756] px-4 py-2.5 text-white">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 text-[12px] font-semibold">
        <div className="flex flex-wrap items-center gap-7">
          <span className="flex items-center gap-2">
            <Truck size={14} />
            Free shipping on orders above ₹999
          </span>

          <span className="flex items-center gap-2">
            <Stethoscope size={14} />
            Vet approved products
          </span>

          <span className="flex items-center gap-2">
            <ShieldCheck size={15} />
            100% authentic & safe
          </span>
        </div>

        <div className="flex items-center gap-5">
          <span>Need help?</span>

          <span className="flex items-center gap-2">
            <MessageCircle size={15} className="text-[#35c979]" />
            WhatsApp us
          </span>

          <Heart size={16} />
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="border-b border-[#eee8e3] bg-white px-4 py-3">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5">
        <Logo />

        <div className="hidden items-center gap-7 text-[14px] font-bold text-[#102756] lg:flex">
          <a href="#">Shop</a>
          <a href="#">Pet Care</a>
          <a href="#">Categories</a>
          <a href="#">Vet Approved</a>
          <a href="#">Community</a>
          <a href="#">Offers</a>
        </div>

        <div className="flex flex-1 justify-end gap-3">
          <div className="hidden h-12 max-w-[310px] flex-1 items-center rounded-2xl border border-[#ebe8e6] bg-[#fffdfb] px-4 shadow-sm md:flex">
            <Search size={18} className="text-[#758096]" />

            <input
              className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#929aaa]"
              placeholder="Search for food, toys, supplements..."
            />

            <button className="flex h-10 w-11 items-center justify-center rounded-xl bg-[#102756] text-white">
              <Search size={18} />
            </button>
          </div>

          <button className="hidden h-11 w-11 items-center justify-center rounded-xl bg-[#f9fafb] text-[#102756] md:flex">
            <User size={22} />
          </button>

          <button className="hidden h-11 w-11 items-center justify-center rounded-xl bg-[#f9fafb] text-[#102756] md:flex">
            <Heart size={21} />
          </button>

          <button className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#f9fafb] text-[#102756]">
            <ShoppingCart size={21} />
            <span className="absolute -right-1 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff703e] px-1 text-[10px] font-bold text-white">
              3
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

function Breadcrumb() {
  return (
    <div className="mx-auto max-w-[1500px] px-5 pt-4 text-[12px] font-semibold text-[#536078]">
      Home <span className="mx-2 text-[#b4bbc7]">›</span>
      <span className="text-[#102756]">Contact Us</span>
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto mt-2 max-w-[1500px] overflow-hidden rounded-[30px] bg-[#fce8df]">
      <div className="relative min-h-[390px] overflow-hidden px-7 py-9 md:min-h-[470px] md:px-16 lg:px-20">
        {/* Decorative blobs */}
        <div className="absolute -left-20 top-20 h-48 w-48 rounded-full bg-[#ffd5bd]" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#f9cbc4]" />
        <div className="absolute right-24 top-0 h-44 w-44 rounded-full bg-[#ffe0d5]" />

        {/* Leaves */}
        <div className="absolute bottom-0 left-0 hidden h-64 w-32 md:block">
          <div className="absolute bottom-0 left-0 h-48 w-16 rotate-[20deg] rounded-[100%] bg-[#236c54]" />
          <div className="absolute bottom-12 left-10 h-36 w-12 -rotate-[25deg] rounded-[100%] bg-[#3e8968]" />
        </div>

        {/* Hero text */}
        <div className="relative z-20 max-w-[500px]">
          <h1 className="font-[Arial,sans-serif] text-[70px] font-black leading-[.82] tracking-[-5px] text-[#102756] md:text-[95px]">
            Contact
          </h1>

          <h2 className="mt-2 font-[Arial,sans-serif] text-[68px] font-black leading-[.85] tracking-[-5px] text-[#ff6543] md:text-[88px]">
            Us
          </h2>

          <h3 className="mt-6 max-w-[380px] text-[26px] font-extrabold leading-[1.05] text-[#102756] md:text-[29px]">
            We're here for you and
            <br />
            your furry friends!
          </h3>

          <p className="mt-3 max-w-[400px] text-[15px] font-medium leading-6 text-[#283a5b]">
            Have a question, need help with an order,
            <br className="hidden md:block" />
            or looking for expert pet care advice?
            <br />
            Our team is always happy to help.
          </p>
        </div>

        {/* Main dog */}
        <div className="absolute bottom-[-25px] left-[32%] z-10 hidden w-[480px] md:block lg:left-[39%] lg:w-[550px]">
          <div className="relative">
            <img
              src={dogHero}
              alt="Happy dog"
              className="h-[390px] w-full rounded-[50%] object-cover object-center mix-blend-multiply"
            />

            <div className="absolute inset-0 rounded-[50%] bg-gradient-to-t from-[#fce8df] via-transparent to-transparent" />
          </div>
        </div>

        {/* Cat */}
        <div className="absolute bottom-[-15px] right-[15%] z-20 hidden w-[220px] md:block lg:right-[19%] lg:w-[270px]">
          <img
            src={catHero}
            alt="Cat"
            className="h-[260px] w-full rounded-[45%] object-cover object-center mix-blend-multiply"
          />
        </div>

        {/* Text decoration */}
        <div className="absolute right-[23%] top-7 hidden rotate-[-8deg] text-center font-bold text-[#102756] md:block">
          <div className="text-[24px] leading-7">Different</div>
          <div className="text-[24px] leading-7">Pets</div>
          <div className="text-[24px] leading-7">Same Love</div>
        </div>

        <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 rotate-[5deg] rounded-full bg-white/90 px-8 py-6 text-center text-[20px] font-bold leading-7 text-[#102756] shadow-sm md:block lg:right-12">
          Pets aren't
          <br />
          just animals,
          <br />
          they're family.
          <span className="text-[#ff5c5c]"> ♥</span>
        </div>

        {/* Mobile pets */}
        <div className="relative z-10 mt-8 flex justify-center md:hidden">
          <img
            src={dogHero}
            alt="Dog"
            className="h-[220px] w-[270px] rounded-[50%] object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function ContactCards() {
  const cards = [
    {
      icon: Phone,
      title: "Call Us",
      value: "+91 98765 43210",
      sub: "Mon - Sat, 9:00 AM - 7:00 PM",
      bg: "#dff5e9",
      iconBg: "#32aa7b",
    },
    {
      icon: Mail,
      title: "Email Us",
      value: "support@furnest.com",
      sub: "We reply within 24 hours",
      bg: "#ffe7ea",
      iconBg: "#ff5e68",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Us",
      value: "+91 98765 43210",
      sub: "Quick support for your queries",
      bg: "#fff0db",
      iconBg: "#ff8c21",
    },
    {
      icon: MapPin,
      title: "Our Location",
      value: "123 Pet Care Street,",
      sub: "Pune, Maharashtra 411001",
      bg: "#eee8ff",
      iconBg: "#7c65db",
    },
  ];

  return (
    <section className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="flex min-h-[120px] items-center gap-4 rounded-[22px] bg-white p-5 shadow-[0_4px_20px_rgba(25,40,70,.06)]"
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: item.iconBg }}
            >
              <Icon size={27} />
            </div>

            <div>
              <h3 className="text-[16px] font-extrabold text-[#102756]">
                {item.title}
              </h3>

              <p className="mt-1 text-[15px] font-bold text-[#102756]">
                {item.value}
              </p>

              <p className="mt-1 text-[11px] font-medium text-[#68748a]">
                {item.sub}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ContactForm() {
  return (
    <div className="rounded-[25px] bg-white p-6 shadow-[0_5px_30px_rgba(25,40,70,.05)] md:p-8">
      <div className="mb-7">
        <h2 className="text-[32px] font-black tracking-[-1.5px] text-[#102756]">
          Send Us a Message <span className="text-[#ff5c5c]">♥</span>
        </h2>

        <p className="mt-1 text-[14px] font-medium text-[#5d687d]">
          Fill out the form below and our team will get back to you soon.
        </p>
      </div>

      <form className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input label="Your Name" placeholder="Enter your name" required />
          <Input label="Email Address" placeholder="Enter your email" required />
          <Input label="Phone Number" placeholder="Enter your phone number" />

          <div>
            <label className="mb-2 block text-[12px] font-bold text-[#102756]">
              Subject <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select className="h-12 w-full appearance-none rounded-xl border border-[#dfe3e9] bg-white px-4 text-[13px] text-[#768196] outline-none focus:border-[#102756]">
                <option>Select a subject</option>
                <option>Order Support</option>
                <option>Product Information</option>
                <option>Delivery</option>
                <option>Returns</option>
                <option>Other</option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#68748a]"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[12px] font-bold text-[#102756]">
            Your Message <span className="text-red-500">*</span>
          </label>

          <textarea
            rows="7"
            placeholder="Type your message here..."
            className="w-full resize-none rounded-xl border border-[#dfe3e9] px-4 py-4 text-[13px] text-[#102756] outline-none placeholder:text-[#9aa2af] focus:border-[#102756]"
          />
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-3 rounded-full bg-[#102756] px-7 py-3.5 text-[14px] font-bold text-white transition hover:bg-[#17376f]"
        >
          <Send size={17} />
          Send Message
          <ChevronRight size={17} />
        </button>
      </form>

      <div className="mt-5 flex justify-end gap-3">
        <PawPrint className="text-[#ff6374]" size={35} />
        <PawPrint className="text-[#45b77c]" size={35} />
      </div>
    </div>
  );
}

function ImageCard() {
  return (
    <div className="relative h-[260px] overflow-hidden rounded-[25px]">
      <img
        src={corgi}
        alt="Happy pet"
        className="h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#ffe0d6]/90 via-transparent to-transparent" />

      <div className="absolute left-7 top-8 rotate-[-5deg] text-[18px] font-black leading-6 text-[#102756]">
        Good
        <br />
        Pets
        <br />
        Brighter
        <br />
        Days
      </div>

      <div className="absolute right-5 top-6 rounded-full bg-white/90 px-5 py-4 text-center text-[16px] font-black leading-5 text-[#102756]">
        Let's Talk
        <br />
        About a Happier
        <br />
        Tomorrow!
        <span className="text-[#ff5c5c]"> ♥</span>
      </div>
    </div>
  );
}

function MapSection() {
  return (
    <div className="mt-4 overflow-hidden rounded-[25px] bg-white shadow-[0_5px_30px_rgba(25,40,70,.05)]">
      <div className="px-5 pt-4">
        <h2 className="text-[27px] font-black tracking-[-1px] text-[#102756]">
          Find Us Here
        </h2>

        <p className="text-[13px] font-medium text-[#68748a]">
          Visit our store or find us on the map.
        </p>
      </div>

      <div className="relative mx-5 mt-4 h-[180px] overflow-hidden rounded-[16px] bg-[#e7ece7]">
        <iframe
          title="FurNest Location"
          src="https://www.google.com/maps?q=Pune,Maharashtra,India&output=embed"
          className="h-full w-full border-0"
          loading="lazy"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/30 to-transparent" />
      </div>

      <div className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 shrink-0 text-[#ff6543]" size={21} />

          <div>
            <p className="text-[12px] font-extrabold text-[#102756]">
              123 Pet Care Street, Pune, Maharashtra 411001
            </p>

            <p className="mt-1 text-[11px] text-[#758096]">
              Near Kothrud, Pune
            </p>
          </div>
        </div>

        <button className="hidden items-center gap-2 rounded-full border border-[#e1e5ea] bg-white px-4 py-2 text-[12px] font-bold text-[#102756] sm:flex">
          <MapPin size={15} />
          Get Directions
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function FAQ() {
  return (
    <section className="mx-auto max-w-[1500px] px-5 py-4">
      <div className="grid gap-5 rounded-[28px] bg-[#fff4e8] p-6 md:grid-cols-[.75fr_1.5fr] md:p-8">
        <div className="relative min-h-[190px] overflow-hidden">
          <div className="absolute left-0 top-3 text-[16px] font-black text-[#ff9b21]">
            <HelpCircle size={38} />
          </div>

          <h2 className="ml-10 text-[31px] font-black tracking-[-1px] text-[#102756]">
            Common Questions <span className="text-[#ff5c5c]">♥</span>
          </h2>

          <p className="mt-2 text-[14px] font-medium text-[#59657b]">
            Find quick answers to common queries.
          </p>

          <div className="absolute bottom-[-45px] left-[15%] w-[180px]">
            <img
              src={dogHappy}
              alt="Happy dog"
              className="h-[180px] w-full rounded-[50%] object-cover"
            />
          </div>
        </div>

        <div className="grid content-start grid-cols-1 gap-3 sm:grid-cols-2">
          {questions.map((question) => (
            <button
              key={question}
              className="flex min-h-[53px] items-center justify-between rounded-full bg-white px-5 text-left text-[13px] font-bold text-[#102756] shadow-sm transition hover:-translate-y-0.5"
            >
              <span>{question}</span>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partnership() {
  return (
    <section className="mx-auto max-w-[1500px] px-5 pb-5">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#edf8ef] via-[#f7fbef] to-[#dff3e9] px-7 py-8 md:px-12">
        <div className="absolute right-0 top-0 h-full w-[45%] bg-[#d9efe4] opacity-50" />

        <div className="relative z-10 grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-start gap-5">
            <div className="hidden rounded-2xl bg-white p-4 text-[#102756] shadow-sm sm:block">
              <Handshake size={42} />
            </div>

            <div>
              <h2 className="text-[28px] font-black leading-tight text-[#102756] md:text-[34px]">
                For Business &
                <br />
                Partnership Inquiries
              </h2>

              <p className="mt-2 max-w-[440px] text-[13px] font-medium text-[#59657b]">
                Interested in collaborating with FurNest?
                <br />
                We'd love to hear from you.
              </p>
            </div>
          </div>

          <button className="relative z-20 flex items-center justify-center gap-2 rounded-full bg-[#102756] px-7 py-3 text-[13px] font-bold text-white">
            partner@furnest.com
            <ChevronRight size={17} />
          </button>

          <div className="relative hidden h-[160px] md:block">
            <img
              src={dogCat}
              alt="Pets"
              className="h-full w-full rounded-[50%] object-cover"
            />

            <div className="absolute right-0 top-5 rotate-[4deg] text-center text-[15px] font-black leading-5 text-[#102756]">
              Real Pets
              <br />
              Real People
              <br />
              Real Partnerships
              <span className="text-[#ff5c5c]"> ♥</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#eadfd9] bg-[#fff7f2]">
      <div className="absolute bottom-0 left-0 h-28 w-[35%] rounded-tr-[100%] bg-[#ffd8d3]" />
      <div className="absolute right-0 top-0 h-32 w-[30%] rounded-bl-[100%] bg-[#ffe3dd]" />

      <div className="relative mx-auto max-w-[1500px] px-6 py-10">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.5fr]">
          <div>
            <Logo />

            <p className="mt-4 max-w-[230px] text-[12px] leading-5 text-[#657086]">
              Making pet care simpler, happier and healthier for every pet
              parent.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-[14px] font-black text-[#102756]">
              Shop
            </h3>

            <FooterLink text="Food" />
            <FooterLink text="Treats" />
            <FooterLink text="Supplements" />
            <FooterLink text="Toys" />
            <FooterLink text="Accessories" />
          </div>

          <div>
            <h3 className="mb-4 text-[14px] font-black text-[#102756]">
              About
            </h3>

            <FooterLink text="Our Story" />
            <FooterLink text="Vet Partners" />
            <FooterLink text="Sustainability" />
            <FooterLink text="Careers" />

            <h3 className="mb-4 mt-6 text-[14px] font-black text-[#102756]">
              Support
            </h3>

            <FooterLink text="Contact Us" />
            <FooterLink text="Shipping" />
            <FooterLink text="Returns" />
            <FooterLink text="FAQs" />
          </div>

          <div>
            <h3 className="text-[14px] font-black text-[#102756]">
              Join Our Pack
            </h3>

            <p className="mt-1 text-[11px] text-[#68748a]">
              Get exclusive offers, pet care tips and more.
            </p>

            <div className="mt-4 flex overflow-hidden rounded-xl border border-[#e3e3e3] bg-white">
              <input
                placeholder="Your email"
                className="min-w-0 flex-1 px-4 py-3 text-[12px] outline-none"
              />

              <button className="bg-[#102756] px-5 text-[12px] font-bold text-white">
                Subscribe
              </button>
            </div>

            <div className="mt-5 flex gap-5 text-[#102756]">
              <Instagram size={18} />
              <Facebook size={18} />
              <Youtube size={18} />
              <Linkedin size={18} />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#e4ddd7] pt-5">
          <div className="flex flex-col justify-between gap-3 text-[10px] text-[#697388] md:flex-row">
            <span>© 2024 FurNest. All rights reserved.</span>

            <div className="flex gap-5">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Refund Policy</span>
            </div>

            <span>
              Made with <span className="text-[#ff5d62]">♥</span> for pets
              everywhere.
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 hidden rotate-[-4deg] text-center text-[15px] font-black leading-5 text-[#102756] lg:block">
        Good Pets
        <br />
        Happier Lives
        <br />
        Always ♥
      </div>
    </footer>
  );
}

function FooterLink({ text }) {
  return (
    <a
      href="#"
      className="block py-1 text-[12px] font-medium text-[#68748a] transition hover:text-[#102756]"
    >
      {text}
    </a>
  );
}

function Input({ label, placeholder, required }) {
  return (
    <div>
      <label className="mb-2 block text-[12px] font-bold text-[#102756]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-[#dfe3e9] bg-white px-4 text-[13px] text-[#102756] outline-none placeholder:text-[#9aa2af] focus:border-[#102756]"
      />
    </div>
  );
}

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-[#fffaf7] font-[Arial,sans-serif] text-[#102756]">
      <TopBar />
      <Navbar />

      <main>
        <Breadcrumb />
        <Hero />
        <ContactCards />

        <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-4 lg:grid-cols-[1.08fr_.92fr]">
          <ContactForm />

          <div>
            <ImageCard />
            <MapSection />
          </div>
        </section>

        <FAQ />
        <Partnership />
      </main>

      <Footer />
    </div>
  );
}