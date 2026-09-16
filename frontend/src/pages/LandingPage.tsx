import { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronRight, Star, Clock, Truck, Shield, Headphones, Zap, ArrowRight, Package, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { storesApi } from '@/api/stores';
import { productsApi } from '@/api/products';
import { LocationModal } from '@/components/location/LocationModal';
import { StoreCard } from '@/components/store/StoreCard';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductModal } from '@/components/product/ProductModal';
import { useLocationStore } from '@/store/useLocationStore';
import type { Product } from '@/types';

// Images
import heroProduce from '@/assets/hero_produce.png';
import promoVegetables from '@/assets/promo_vegetables.png';
import promoFruits from '@/assets/promo_fruits.png';
import promoSnacks from '@/assets/promo_snacks.png';
import deliveryRider from '@/assets/delivery_rider.png';
import trustFresh from '@/assets/trust_fresh.png';
import appLifestyle from '@/assets/app_lifestyle.png';

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCounter(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// ─── Intersection observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const CATEGORIES = [
  { id: 'cat-01', name: 'Fruits & Vegetables', icon: '🥦', color: 'from-green-100 to-emerald-50 hover:from-green-200 hover:to-emerald-100' },
  { id: 'cat-02', name: 'Dairy & Eggs', icon: '🥛', color: 'from-blue-100 to-sky-50 hover:from-blue-200 hover:to-sky-100' },
  { id: 'cat-03', name: 'Meat & Seafood', icon: '🐟', color: 'from-orange-100 to-amber-50 hover:from-orange-200 hover:to-amber-100' },
  { id: 'cat-04', name: 'Bakery', icon: '🍞', color: 'from-yellow-100 to-amber-50 hover:from-yellow-200 hover:to-amber-100' },
  { id: 'cat-05', name: 'Beverages', icon: '🧃', color: 'from-purple-100 to-violet-50 hover:from-purple-200 hover:to-violet-100' },
  { id: 'cat-06', name: 'Snacks', icon: '🍿', color: 'from-pink-100 to-rose-50 hover:from-pink-200 hover:to-rose-100' },
  { id: 'cat-07', name: 'Rice & Grains', icon: '🍚', color: 'from-amber-100 to-yellow-50 hover:from-amber-200 hover:to-yellow-100' },
  { id: 'cat-08', name: 'Spices', icon: '🌶️', color: 'from-red-100 to-orange-50 hover:from-red-200 hover:to-orange-100' },
  { id: 'cat-09', name: 'Household', icon: '🧹', color: 'from-teal-100 to-cyan-50 hover:from-teal-200 hover:to-cyan-100' },
  { id: 'cat-10', name: 'Personal Care', icon: '🧴', color: 'from-indigo-100 to-blue-50 hover:from-indigo-200 hover:to-blue-100' },
  { id: 'cat-11', name: 'Frozen Food', icon: '🧊', color: 'from-cyan-100 to-blue-50 hover:from-cyan-200 hover:to-blue-100' },
  { id: 'cat-12', name: 'Baby & Kids', icon: '🍼', color: 'from-rose-100 to-pink-50 hover:from-rose-200 hover:to-pink-100' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: MapPin, title: 'Select Location', desc: 'Enter your delivery address in Colombo to see available stores near you.' },
  { step: '02', icon: Package, title: 'Choose a Store', desc: 'Browse stores serving your area and pick your favourite grocery shop.' },
  { step: '03', icon: Zap, title: 'Add to Cart', desc: 'Browse products, add items to your cart, and apply any available offers.' },
  { step: '04', icon: Truck, title: 'Fast Delivery', desc: 'Our bike riders deliver fresh groceries to your door in minutes.' },
];

const BENEFITS = [
  { icon: Truck, title: 'Super Fast Delivery', desc: 'As little as 30 minutes', color: 'bg-green-50 text-green-600', border: 'border-green-100' },
  { icon: Shield, title: 'Fresh & Quality', desc: 'Handpicked with care', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
  { icon: Star, title: 'Best Prices', desc: 'Save more every day', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
  { icon: Headphones, title: '24/7 Support', desc: "We're here for you", color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
];

const STATS = [
  { value: 5000, suffix: '+', label: 'Happy Customers' },
  { value: 30, suffix: ' min', label: 'Avg. Delivery Time' },
  { value: 50, suffix: '+', label: 'Partner Stores' },
  { value: 99, suffix: '%', label: 'Satisfaction Rate' },
];

const PROMOS = [
  { badge: 'Deal of the Day', title: 'Up to 40% OFF', subtitle: 'On selected items', color: 'from-primary-600 to-primary-800', image: promoVegetables },
  { badge: 'Fresh Fridays', title: 'Flat 20% Off on Fruits', subtitle: 'Every Friday', color: 'from-amber-500 to-orange-600', image: promoFruits },
  { badge: 'Weekend Special', title: 'Buy 1 Get 1 FREE', subtitle: 'On selected snacks', color: 'from-purple-600 to-pink-600', image: promoSnacks },
];

const TRUST_ITEMS = [
  { icon: CheckCircle, text: 'Farm-fresh produce sourced daily' },
  { icon: CheckCircle, text: 'Verified Sri Lankan partner stores' },
  { icon: CheckCircle, text: 'Secure payment — cash or card' },
  { icon: CheckCircle, text: '100% satisfaction guaranteed' },
];

// ─── Floating particle component ──────────────────────────────────────────────
function FloatingParticle({ emoji, style }: { emoji: string; style: React.CSSProperties }) {
  return (
    <div
      className="absolute text-2xl opacity-30 pointer-events-none select-none"
      style={{
        animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 3}s`,
        ...style,
      }}
    >
      {emoji}
    </div>
  );
}

export function LandingPage() {
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activePromo, setActivePromo] = useState(0);
  const { selectedLocation } = useLocationStore();

  // Auto-rotate promo banners
  useEffect(() => {
    const t = setInterval(() => setActivePromo((p) => (p + 1) % PROMOS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Stats animation
  const { ref: statsRef, inView: statsInView } = useInView();
  const stat0 = useCounter(STATS[0].value, 1800, statsInView);
  const stat1 = useCounter(STATS[1].value, 1400, statsInView);
  const stat2 = useCounter(STATS[2].value, 1600, statsInView);
  const stat3 = useCounter(STATS[3].value, 2000, statsInView);
  const statCounts = [stat0, stat1, stat2, stat3];

  const { ref: howRef, inView: howInView } = useInView();
  const { ref: benefitsRef, inView: benefitsInView } = useInView();

  const { data: stores, isLoading: storesLoading } = useQuery({
    queryKey: ['stores', selectedLocation?.id],
    queryFn: () => selectedLocation
      ? storesApi.getStoresByLocation(selectedLocation.id)
      : storesApi.getFeaturedStores(),
  });

  const { data: popularProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['popular-products'],
    queryFn: () => productsApi.getPopularProducts(),
  });

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] flex items-center" style={{ background: 'linear-gradient(135deg, #0a2e1a 0%, #0f4a2a 30%, #0d3b21 60%, #071c11 100%)' }}>

        {/* Animated mesh gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #52bc81 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite' }} />
          <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite 2s' }} />
          <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #74c898 0%, transparent 70%)', animation: 'pulse 10s ease-in-out infinite 1s' }} />
        </div>

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />

        {/* Floating emoji particles — more visible on dark bg */}
        <FloatingParticle emoji="🥦" style={{ top: '12%', left: '4%', opacity: 0.5, fontSize: '2rem' }} />
        <FloatingParticle emoji="🍎" style={{ top: '22%', right: '6%', opacity: 0.45, fontSize: '1.8rem' }} />
        <FloatingParticle emoji="🥕" style={{ bottom: '28%', left: '2%', opacity: 0.4, fontSize: '1.6rem' }} />
        <FloatingParticle emoji="🌶️" style={{ top: '58%', right: '4%', opacity: 0.45, fontSize: '1.6rem' }} />
        <FloatingParticle emoji="🍋" style={{ top: '42%', left: '1.5%', opacity: 0.4, fontSize: '1.5rem' }} />
        <FloatingParticle emoji="🧅" style={{ bottom: '12%', left: '12%', opacity: 0.35, fontSize: '1.4rem' }} />

        <div className="container-app relative z-10 py-16 md:py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">

            {/* ── LEFT — copy ── */}
            <div className="animate-slide-up order-2 lg:order-1">

              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold mb-7 border border-white/10 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.08)', color: '#74c898' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#52bc81' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#52bc81' }} />
                </span>
                🇱🇰&nbsp; 100% Fresh &amp; Local — Colombo
              </div>

              {/* Headline */}
              <h1 className="font-extrabold leading-[1.05] mb-6" style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)' }}>
                <span className="block text-white">Fresh Groceries,</span>
                <span
                  className="block"
                  style={{ background: 'linear-gradient(90deg, #52bc81 0%, #a8e6c3 50%, #f97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  Delivered Fast.
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-lg leading-relaxed mb-8 max-w-md" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Get farm-fresh fruits, vegetables, and daily essentials delivered to your door across Colombo in as little as{' '}
                <strong style={{ color: '#74c898', fontWeight: 700 }}>30 minutes</strong>.
              </p>

              {/* CTA row */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                {/* Location pill */}
                <button
                  id="location-selector-hero"
                  onClick={() => setLocationModalOpen(true)}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-2xl font-medium transition-all duration-300 group flex-1 sm:flex-initial"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', color: 'white' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all" style={{ background: 'rgba(82,188,129,0.25)' }}>
                    <MapPin size={16} style={{ color: '#52bc81' }} />
                  </div>
                  <span className="truncate text-left">
                    {selectedLocation ? (
                      <span>
                        <span className="block text-[10px] leading-none" style={{ color: 'rgba(255,255,255,0.45)' }}>Delivering to</span>
                        <span className="font-semibold text-white">{selectedLocation.name}</span>
                      </span>
                    ) : (
                      <span>
                        <span className="block text-[10px] leading-none" style={{ color: 'rgba(255,255,255,0.45)' }}>Where to deliver?</span>
                        <span className="font-semibold text-white">Select your area</span>
                      </span>
                    )}
                  </span>
                  <ChevronRight size={15} className="ml-auto opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Shop Now */}
                <button
                  id="shop-now-hero"
                  onClick={() => selectedLocation ? document.getElementById('stores')?.scrollIntoView({ behavior: 'smooth' }) : setLocationModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #1a7a4a 0%, #157040 100%)', boxShadow: '0 8px 32px rgba(26,122,74,0.45), 0 0 0 1px rgba(82,188,129,0.3)' }}
                >
                  Shop Now <ArrowRight size={18} />
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
                    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
                  ].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-9 h-9 rounded-full object-cover" style={{ border: '2px solid rgba(255,255,255,0.25)' }} />
                  ))}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'rgba(82,188,129,0.25)', border: '2px solid rgba(255,255,255,0.2)', color: '#74c898' }}>+5K</div>
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                    <span className="text-amber-400 text-xs font-bold ml-1">4.9</span>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Loved by <strong className="text-white">5,000+</strong> customers in Colombo
                  </p>
                </div>
              </div>
            </div>

            {/* ── RIGHT — image collage ── */}
            <div className="relative flex justify-center items-center order-1 lg:order-2">
              {/* Glow behind image */}
              <div className="absolute w-[380px] h-[380px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(82,188,129,0.3) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

              {/* Decorative dashed ring */}
              <div className="absolute w-[460px] h-[460px] border border-dashed rounded-full animate-spin-slow pointer-events-none" style={{ borderColor: 'rgba(82,188,129,0.2)' }} />
              <div className="absolute w-[380px] h-[380px] border rounded-full animate-spin-slow pointer-events-none" style={{ borderColor: 'rgba(249,115,22,0.1)', animationDirection: 'reverse', animationDuration: '30s' }} />

              {/* Main image */}
              <div className="relative z-10">
                <div className="relative overflow-hidden" style={{ borderRadius: '2.5rem', width: '420px', height: '420px', boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)' }}>
                  <img
                    src={heroProduce}
                    alt="Fresh Sri Lankan produce – fruits and vegetables"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle inner vignette */}
                  <div className="absolute inset-0 rounded-[2.5rem]" style={{ background: 'linear-gradient(to top, rgba(7,28,17,0.35) 0%, transparent 50%)' }} />
                </div>
              </div>

              {/* Float card — Veggies */}
              <div
                className="absolute -left-6 top-10 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl animate-float-slow"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'rgba(82,188,129,0.2)' }}>🥦</div>
                <div>
                  <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Fresh Veggies</p>
                  <p className="text-sm font-bold text-white">From LKR 80</p>
                </div>
              </div>

              {/* Float card — Delivery time */}
              <div
                className="absolute -right-6 bottom-16 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', animationDelay: '1.5s' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(82,188,129,0.2)' }}>
                  <Clock size={18} style={{ color: '#74c898' }} />
                </div>
                <div>
                  <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Avg. delivery</p>
                  <p className="text-sm font-bold" style={{ color: '#74c898' }}>30 minutes</p>
                </div>
              </div>

              {/* Deal badge */}
              <div
                className="absolute -right-4 top-12 z-20 text-center px-4 py-3 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #e05e05 100%)', boxShadow: '0 8px 24px rgba(249,115,22,0.45)' }}
              >
                <p className="text-[9px] text-white/80 font-semibold uppercase tracking-wider">Today's deal</p>
                <p className="font-black text-white" style={{ fontSize: '1.8rem', lineHeight: 1 }}>40%</p>
                <p className="text-[9px] text-white/80 font-semibold uppercase tracking-wider">OFF</p>
              </div>

              {/* Verified badge */}
              <div
                className="absolute -left-4 bottom-10 z-20 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <CheckCircle size={14} style={{ color: '#52bc81' }} />
                <span className="text-xs font-semibold text-white">Farm verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce" style={{ opacity: 0.4 }}>
          <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>scroll</span>
          <div className="w-px h-6 rounded-full" style={{ background: 'rgba(82,188,129,0.6)' }} />
        </div>
      </section>

      {/* ─── STATS BAR ─────────────────────────────────────────────────────── */}
      <div ref={statsRef} className="bg-primary-500 py-8">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="text-center text-white">
                <p className="text-3xl md:text-4xl font-extrabold">
                  {statCounts[i]}{stat.suffix}
                </p>
                <p className="text-primary-100 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CATEGORIES ────────────────────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="container-app">
          <div className="text-center mb-8">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Everything you need, all in one place</p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.id}
                id={`category-${cat.id}`}
                onClick={() => selectedLocation
                  ? document.getElementById('stores')?.scrollIntoView({ behavior: 'smooth' })
                  : setLocationModalOpen(true)
                }
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br ${cat.color} transition-all duration-300 col-span-2 group`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="text-3xl group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300">{cat.icon}</div>
                <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROMO BANNERS ─────────────────────────────────────────────────── */}
      <section className="py-10 bg-gray-50">
        <div className="container-app">
          {/* Desktop: 3 column grid */}
          <div className="hidden md:grid grid-cols-3 gap-5">
            {PROMOS.map((promo, i) => (
              <div
                key={promo.title}
                className={`relative overflow-hidden rounded-3xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${i === activePromo ? 'ring-2 ring-primary-400 ring-offset-2' : ''}`}
                onClick={() => setActivePromo(i)}
              >
                {/* Background image */}
                <div className="absolute inset-0">
                  <img src={promo.image} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${promo.color} opacity-80`} />
                </div>
                {/* Content */}
                <div className="relative z-10 p-6 min-h-[200px] flex flex-col justify-between">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full self-start">
                    {promo.badge}
                  </span>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white leading-tight mb-1">{promo.title}</h3>
                    <p className="text-white/80 text-sm mb-4">{promo.subtitle}</p>
                    <button className="px-4 py-2 bg-white text-gray-800 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors shadow-sm">
                      Shop Now →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: auto-sliding single banner */}
          <div className="md:hidden">
            <div className="relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0">
                <img src={PROMOS[activePromo].image} alt={PROMOS[activePromo].title} className="w-full h-full object-cover transition-all duration-700" />
                <div className={`absolute inset-0 bg-gradient-to-t ${PROMOS[activePromo].color} opacity-80`} />
              </div>
              <div className="relative z-10 p-6 min-h-[180px] flex flex-col justify-between">
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full self-start">
                  {PROMOS[activePromo].badge}
                </span>
                <div>
                  <h3 className="text-2xl font-extrabold text-white mb-1">{PROMOS[activePromo].title}</h3>
                  <p className="text-white/80 text-sm mb-4">{PROMOS[activePromo].subtitle}</p>
                  <button className="px-4 py-2 bg-white text-gray-800 font-semibold rounded-xl text-sm">Shop Now →</button>
                </div>
              </div>
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {PROMOS.map((_, i) => (
                <button key={i} onClick={() => setActivePromo(i)} className={`h-2 rounded-full transition-all duration-300 ${i === activePromo ? 'bg-primary-500 w-6' : 'bg-gray-300 w-2'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STORES ────────────────────────────────────────────────────────── */}
      <section id="stores" className="py-14 bg-white">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">
                {selectedLocation ? `Stores in ${selectedLocation.name}` : 'Featured Stores'}
              </h2>
              <p className="section-subtitle">
                {selectedLocation
                  ? `${stores?.length ?? 0} stores available for delivery`
                  : 'Select your location to see stores near you'}
              </p>
            </div>
            {!selectedLocation && (
              <button id="set-location-stores" onClick={() => setLocationModalOpen(true)} className="btn-secondary text-sm hidden sm:flex">
                <MapPin size={15} /> Set Location
              </button>
            )}
          </div>

          {storesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-72 rounded-2xl" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          ) : !stores?.length ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No stores in this area yet</h3>
              <p className="text-gray-400 text-sm mb-4">We're expanding! Try a nearby area.</p>
              <button onClick={() => setLocationModalOpen(true)} className="btn-primary">Change Location</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stores.map((store, i) => (
                <div key={store.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <StoreCard store={store} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── POPULAR PRODUCTS ──────────────────────────────────────────────── */}
      <section className="py-14 bg-gray-50">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Best Sellers</h2>
              <p className="section-subtitle">Loved by Colombo's grocery shoppers</p>
            </div>
            <button className="text-primary-500 font-semibold text-sm hover:text-primary-700 transition-colors flex items-center gap-1 group">
              View All <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {popularProducts?.slice(0, 10).map((product, i) => (
                <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <ProductCard product={product} onViewDetails={setSelectedProduct} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container-app">
          <div ref={howRef} className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left — image */}
            <div className={`relative transition-all duration-700 ${howInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-primary-50 rounded-full -z-10" />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-accent-50 rounded-full -z-10" />
              <img
                src={deliveryRider}
                alt="Freshora delivery rider"
                className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
              />
              {/* Delivery time badge */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-card-hover px-5 py-3 border border-gray-100">
                <p className="text-xs text-gray-400">Average delivery</p>
                <p className="text-2xl font-extrabold text-primary-600">30 min</p>
              </div>
            </div>

            {/* Right — steps */}
            <div className={`transition-all duration-700 delay-200 ${howInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                How it works
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                Groceries in 4 simple steps
              </h2>
              <p className="text-gray-500 mb-8">From tap to door — it's never been easier to get fresh groceries in Colombo.</p>

              <div className="space-y-5">
                {HOW_IT_WORKS.map((step, i) => (
                  <div
                    key={step.step}
                    className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-500 hover:bg-primary-50 group ${howInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    style={{ transitionDelay: `${300 + i * 100}ms` }}
                  >
                    <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                      <step.icon size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-primary-400 tracking-widest">STEP {step.step}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-0.5">{step.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST / BENEFITS ──────────────────────────────────────────────── */}
      <section ref={benefitsRef} className="py-20 bg-gray-50 overflow-hidden">
        <div className="container-app">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className={`transition-all duration-700 ${benefitsInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                Why choose Freshora?
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                Quality you can taste,<br />service you can trust.
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                We partner only with verified local stores and ensure every item is fresh, fairly priced, and delivered with care across Colombo.
              </p>

              {/* Trust checklist */}
              <div className="space-y-3 mb-8">
                {TRUST_ITEMS.map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-primary-500 shrink-0" />
                    <span className="text-gray-700 font-medium text-sm">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {BENEFITS.map((b, i) => (
                  <div
                    key={b.title}
                    className={`card p-4 border ${b.border} hover:shadow-card-hover transition-all duration-300 group`}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className={`w-10 h-10 ${b.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <b.icon size={18} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-0.5">{b.title}</h3>
                    <p className="text-xs text-gray-500">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — lifestyle image */}
            <div className={`relative transition-all duration-700 delay-200 ${benefitsInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <div className="absolute -top-8 -right-8 w-72 h-72 bg-primary-100 rounded-full -z-10 opacity-60" />
              <img
                src={trustFresh}
                alt="Fresh quality groceries"
                className="w-full rounded-3xl shadow-2xl mb-4"
              />
              <img
                src={appLifestyle}
                alt="Sri Lankan customer ordering groceries"
                className="w-3/4 ml-auto rounded-3xl shadow-xl -mt-16 border-4 border-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800">
        {/* Animated background dots */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        <div className="container-app text-center relative z-10">
          <div className="text-6xl mb-6">🛍️</div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Ready to shop fresh?
          </h2>
          <p className="text-primary-100 text-xl mb-10 max-w-xl mx-auto">
            Select your location and discover grocery stores delivering to your neighbourhood right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              id="get-started-cta"
              onClick={() => setLocationModalOpen(true)}
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-xl text-lg hover:scale-105"
            >
              <MapPin size={20} /> Get Started Free
            </button>
            <button
              onClick={() => document.getElementById('stores')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all text-lg border border-white/30"
            >
              View Stores <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <LocationModal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
