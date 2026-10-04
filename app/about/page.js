import React from "react";
import { CheckCircle, Heart, ShieldCheck, Truck, Users, Star, Package, ThumbsUp } from "lucide-react";
import Link from "next/link";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#FFF8F5] font-sans selection:bg-coral/20">

      {/* ─────────────────────────────────────────────────────────
          HERO SECTION
      ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20">
        {/* Background Decorative Blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FFF0E8] rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute top-20 right-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-orange-100 shadow-sm mb-6">
                <span className="text-[11px] font-bold text-[#142653] uppercase tracking-wider">Home / About Us</span>
              </div>
              
              <h1 className="text-5xl sm:text-[4rem] font-black text-[#142653] leading-[1.05] mb-6">
                About <br />
                <span className="text-coral">FurNest</span>
                <Heart className="inline-block w-8 h-8 text-coral fill-coral ml-3 -translate-y-4" />
              </h1>
              
              <p className="text-lg sm:text-2xl font-bold text-[#142653]/80 leading-snug mb-8 max-w-md">
                Because every pet deserves a happier, healthier tomorrow.
              </p>
            </div>

            {/* Right Image Composition */}
            <div className="relative">
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-white rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80" 
                  alt="Happy dogs and cats" 
                  className="w-full h-[400px] object-cover"
                />
              </div>

              {/* Floating Badges */}
              <div className="absolute -top-6 -right-6 bg-white px-6 py-4 rounded-3xl shadow-xl rotate-6 animate-[pulse_4s_ease-in-out_infinite]">
                <p className="text-sm font-black text-coral leading-tight text-center">
                  Different <br /> Pets <br /> <span className="text-[#142653] font-bold text-xs">Same Love</span>
                </p>
                <Heart className="absolute -top-2 -right-2 w-5 h-5 text-coral fill-coral" />
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-3xl shadow-xl -rotate-6">
                <p className="text-sm font-bold text-[#142653] leading-tight text-center">
                  Pets aren't <br /> just animals, <br /> <span className="text-coral">they're family.</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          OUR STORY
      ────────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFF0E8] rounded-[3rem] p-8 sm:p-12 relative overflow-hidden">
            
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#142653] mb-2 flex items-center gap-3">
                  Our Story <Heart className="w-6 h-6 text-coral fill-coral" />
                </h2>
                <h3 className="text-base sm:text-lg font-bold text-[#142653]/70 mb-6">Built by Pet Parents, for Pet Parents</h3>
                
                <p className="text-[#142653]/80 font-medium leading-relaxed text-sm sm:text-base mb-4">
                  FurNest was born from a simple belief — pets make our lives brighter, and they deserve the very best care. What started as a small idea among passionate pet lovers has grown into a trusted platform for thousands of families across India.
                </p>
                
                <button className="mt-6 bg-[#142653] text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg shadow-navy/20 hover:bg-[#142653]/90 transition-all hover:-translate-y-1">
                  Our Journey →
                </button>
              </div>
              
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80" 
                  alt="Pet parent with dog" 
                  className="rounded-[2.5rem] shadow-xl border-8 border-white -rotate-2 hover:rotate-0 transition-transform duration-500 h-[300px] w-full object-cover"
                />
                
                <div className="absolute -right-4 -bottom-4 sm:-right-6 sm:-bottom-6 bg-white p-5 rounded-3xl shadow-xl max-w-[200px] sm:max-w-[240px] rotate-3">
                  <p className="text-xs sm:text-sm font-bold text-[#142653] italic">
                    "A happier tomorrow begins with healthier, happier pets today."
                  </p>
                  <p className="text-right mt-1 text-coral font-bold text-xl">☺</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          WHY FURNEST
      ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#142653] mb-2 flex items-center gap-3">
                Why FurNest? <Heart className="w-6 h-6 text-coral fill-coral" />
              </h2>
              <p className="text-base sm:text-lg font-bold text-[#142653]/70">
                More than just a pet store — we're a community.
              </p>
            </div>
            
            <div className="bg-[#FFF0E8] p-3 sm:p-4 rounded-3xl flex items-center gap-3 sm:gap-4 rotate-2 shadow-sm border border-orange-100 hidden sm:flex">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-inner bg-white flex-shrink-0">
                <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=150&q=80" alt="Dog waving" className="w-full h-full object-cover" />
              </div>
              <p className="font-black text-[#142653] leading-tight text-xs sm:text-sm">Happy<br/>Pets.<br/><span className="text-coral">Happier<br/>Humans</span></p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50", title: "Vet Approved", desc: "Carefully curated & recommended by experts." },
              { icon: Truck, color: "text-blue-500", bg: "bg-blue-50", title: "Fast & Reliable Delivery", desc: "Get your pet's essentials at your doorstep." },
              { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", title: "100% Authentic", desc: "Only trusted and original products." },
              { icon: Heart, color: "text-coral", bg: "bg-[#FFF0E8]", title: "Loved by 50K+ Pet Parents", desc: "A growing community of happy pets and people.", fill: true }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gray-100 hover:border-coral/30 hover:shadow-[0_20px_40px_rgba(20,38,83,0.05)] transition-all duration-300 hover:-translate-y-2 group">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${feature.color} ${feature.fill ? 'fill-coral' : ''}`} />
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#142653] mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm font-medium text-[#142653]/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          OUR MISSION
      ────────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-[#FFF0E8] rounded-[3rem] p-8 sm:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              <div className="relative order-2 lg:order-1">
                <img 
                  src="https://images.unsplash.com/photo-1548802673-3809cd4d7c3e?auto=format&fit=crop&w=800&q=80" 
                  alt="Dogs playing" 
                  className="rounded-[2.5rem] shadow-xl border-8 border-white rotate-2 hover:-rotate-0 transition-transform w-full h-[300px] object-cover"
                />
              </div>

              <div className="order-1 lg:order-2">
                <h2 className="text-3xl sm:text-4xl font-black text-[#142653] mb-2 flex items-center gap-3">
                  Our Mission <Heart className="w-6 h-6 text-coral fill-coral" />
                </h2>
                <h3 className="text-lg sm:text-xl font-bold text-[#142653]/80 mb-6">Better Care. Brighter Days.</h3>
                
                <p className="text-[#142653]/70 font-medium leading-relaxed text-sm sm:text-base mb-8">
                  We aim to make high-quality pet care products and expert advice accessible to every pet parent, helping you give your furry, feathered, or finned friends a longer, healthier, and happier life.
                </p>

                <div className="inline-flex items-center gap-4 bg-white px-5 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-sm border border-gray-100 rotate-1">
                  <div className="flex -space-x-4">
                    <img className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white object-cover" src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=100&q=80" alt="Dog" />
                    <img className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white object-cover" src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=100&q=80" alt="Cat" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-emerald-600">Good Pets</p>
                    <p className="text-[10px] sm:text-xs font-bold text-[#142653]/50">Brighter Lives Always ♡</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          OUR VALUES
      ────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#142653] mb-2 flex items-center gap-3">
              Our Values <Heart className="w-6 h-6 text-coral fill-coral" />
            </h2>
            <p className="text-base sm:text-xl font-bold text-[#142653]/70">The heart behind everything we do.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            
            <div className="space-y-4 sm:space-y-6 lg:col-span-2">
              {[
                { icon: Heart, color: "text-coral", bg: "bg-red-50", title: "Compassion", desc: "We put the well-being of pets at the center of every decision." },
                { icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", title: "Trust", desc: "We work with trusted brands and vet-approved products." },
                { icon: Users, color: "text-blue-600", bg: "bg-blue-50", title: "Community", desc: "We're building a community of pet parents who share knowledge, love, and care." }
              ].map((val, idx) => (
                <div key={idx} className="bg-gray-50 rounded-3xl p-5 sm:p-6 flex items-center gap-4 sm:gap-6 border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex-shrink-0 ${val.bg} flex items-center justify-center`}>
                    <val.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${val.color} fill-current opacity-80`} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#142653] mb-1">{val.title}</h3>
                    <p className="text-xs sm:text-sm font-medium text-[#142653]/60">{val.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative rounded-[3rem] overflow-hidden shadow-xl border-8 border-white bg-white hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?auto=format&fit=crop&w=600&q=80" 
                alt="Happy puppy" 
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl rotate-6 shadow-sm">
                <p className="text-xs font-black text-coral">Real Pets<br/>Real Stories<br/>Real Love</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          NUMBERS
      ────────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#142653] mb-2 flex items-center gap-3">
              FurNest in Numbers <Heart className="w-5 h-5 text-coral fill-coral" />
            </h2>
            <p className="text-sm sm:text-base font-bold text-[#142653]/60">A growing family of happy pets and people.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Users, color: "text-coral", title: "50K+", sub: "Happy Pet Parents" },
              { icon: Package, color: "text-emerald-600", title: "1M+", sub: "Products Delivered" },
              { icon: Star, color: "text-amber-500", title: "4.8", sub: "Average Rating" },
              { icon: ThumbsUp, color: "text-blue-600", title: "100+", sub: "Trusted Brands" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-5 sm:p-6 text-center border-2 border-gray-50 shadow-sm hover:-translate-y-1 transition-transform">
                <stat.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${stat.color} mx-auto mb-3 opacity-80`} />
                <h3 className="text-2xl sm:text-3xl font-black text-[#142653] mb-1">{stat.title}</h3>
                <p className="text-[10px] sm:text-xs font-bold text-[#142653]/50 uppercase tracking-wider">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-coral/10 to-orange-50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 overflow-hidden">
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#142653]">Thank you <br className="hidden sm:block" /> for being part <br className="hidden sm:block" /> of our journey!</p>
            </div>
            <div className="flex -space-x-4 sm:-space-x-6">
              <img className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg object-cover" src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=200&q=80" alt="Happy dog" />
              <img className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg object-cover" src="https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=200&q=80" alt="Happy cat" />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
