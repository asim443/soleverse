import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { EDITORIAL_IMAGES } from '../assets/sneakerImages';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton } from '../components/ProductSkeleton';
import { SneakerImage } from '../components/SneakerImage';
import { useProducts } from '../context/ProductContext';
import { useToast } from '../context/ToastContext';

const HOUSE_BRANDS = [
  'SOLEVERSE ATELIER',
  'VORTEX LAB',
  'MONOLITH STUDIO',
  'APEX COURT',
  'KINETIX PRO',
  'NORDIC TREAD',
];

const FAQ_ITEMS = [
  {
    q: 'How does Cash on Delivery (COD) work?',
    a: 'Place your order online with zero upfront card payment. Our courier delivers straight to your doorstep, and you pay in cash upon delivery. Orders $150 or above ship completely free; orders under $150 carry a flat $12 shipping fee.',
  },
  {
    q: 'How accurate is SOLEVERSE sizing?',
    a: 'All SOLEVERSE silhouettes follow standard US footwear sizing (US 6 to US 13). Running and knit trainers offer an anatomical true-to-size fit; if you are between half sizes, we recommend sizing up for thicker athletic socks.',
  },
  {
    q: 'What is your return and size exchange policy?',
    a: 'Unworn pairs in original archival packaging with tags attached qualify for a 7-day size exchange or return from the date of delivery.',
  },
  {
    q: 'Are Limited Edition Vault drops restocked?',
    a: 'Numbered Vault releases are crafted in small batches and archived once sold out. Join our Release Dispatch to receive early access before public launch.',
  },
];

const CUSTOMER_REVIEWS = [
  {
    name: 'Marcus Vance',
    location: 'Chicago, IL',
    item: 'Titanium Carbon Velocity · US 10',
    quote:
      'Took the Titanium Carbon Velocity out for a 10K tempo session along the lakefront. Featherweight upper, zero heel slip, and courier arrived within 48 hours.',
  },
  {
    name: 'Elena Rostova',
    location: 'Brooklyn, NY',
    item: 'Ivory Sculpt Platform · US 7',
    quote:
      'The leather grain and warm ivory tone look genuinely architectural in person. True to size and the rigid archival box arrived completely crisp.',
  },
  {
    name: 'Tariq Al-Mansoor',
    location: 'Austin, TX',
    item: 'Copper Obsidian Archive · US 11',
    quote:
      'Hand-burnished bronze calfskin against matte obsidian suede makes this the sharpest sneaker in my rotation. Easily punches above European luxury pairs.',
  },
];

export function HomePage() {
  const { products, loading, error } = useProducts();
  const { showToast } = useToast();

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [earlyEmail, setEarlyEmail] = useState('');

  const trendingProducts = useMemo(() => products.slice(0, 4), [products]);
  const newArrivals = useMemo(
    () =>
      products
        .filter((p) => p.badge === 'NEW DROP' || p.category === 'Premium')
        .slice(0, 4),
    [products]
  );
  const bestSellers = useMemo(
    () =>
      products
        .filter((p) => p.badge === 'BEST SELLER' || p.rating >= 4.9)
        .slice(0, 4),
    [products]
  );
  const vaultProducts = useMemo(() => {
    const vault = products.filter(
      (p) => p.category === 'Limited Edition' || p.badge === 'LIMITED VAULT'
    );
    return (vault.length >= 3 ? vault : products.slice(12, 15)).slice(0, 3);
  }, [products]);
  const runningProducts = useMemo(() => {
    const runners = products.filter(
      (p) => p.category === 'Running' || p.category === 'Training'
    );
    return runners.slice(0, 3);
  }, [products]);
  const courtAndStreet = useMemo(() => {
    const picks = products.filter(
      (p) =>
        p.category === 'Basketball' ||
        p.category === 'Streetwear' ||
        p.category === 'Lifestyle'
    );
    return picks.slice(0, 4);
  }, [products]);

  const categoryShowcase = useMemo(() => {
    const defs = [
      { title: 'Running Shoes', category: 'Running', code: '01' },
      { title: 'Lifestyle Sneakers', category: 'Lifestyle', code: '02' },
      { title: 'Basketball Shoes', category: 'Basketball', code: '03' },
      { title: 'Streetwear Sneakers', category: 'Streetwear', code: '04' },
      { title: 'Training Shoes', category: 'Training', code: '05' },
      { title: 'Casual Sneakers', category: 'Casual', code: '06' },
      { title: 'Premium Atelier', category: 'Premium', code: '07' },
      { title: 'Limited Edition', category: 'Limited Edition', code: '08' },
    ];
    return defs.map((def, idx) => {
      const match =
        products.find((p) => p.category === def.category) || products[idx % Math.max(1, products.length)];
      return {
        ...def,
        image: match?.image_url || 'asset:chalk_high',
      };
    });
  }, [products]);

  const handleEarlyAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!earlyEmail.trim() || !earlyEmail.includes('@')) {
      showToast({ type: 'error', title: 'Please enter a valid email address.' });
      return;
    }
    showToast({
      type: 'success',
      title: 'Private Client Access Confirmed',
      description: `Vault invitations will arrive at ${earlyEmail.trim()}.`,
    });
    setEarlyEmail('');
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#0C1016] text-white overflow-hidden">
        <div className="relative min-h-[580px] lg:min-h-[680px] flex items-center">
          {/* Background Editorial Photo */}
          <div className="absolute inset-0">
            <img
              src={EDITORIAL_IMAGES.heroFlagship}
              alt="SOLEVERSE architectural streetwear editorial"
              loading="eager"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0C1016] via-[#0C1016]/85 to-[#0C1016]/25" />
          </div>

          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl space-y-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E85D2A]">
                SOLEVERSE Flagship Footwear Atelier
              </p>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-balance">
                Step Into Your World. Engineered for the Street.
              </h1>

              <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-xl">
                Premium sneakers designed for every move—spanning technical marathon runners, hardwood court icons, and numbered luxury leather releases with Cash on Delivery.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/shop"
                  className="px-7 py-3.5 bg-[#E85D2A] hover:bg-[#D14D1C] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/shop?category=Limited+Edition"
                  className="px-7 py-3.5 bg-white/10 hover:bg-white hover:text-[#111827] border border-white/25 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Explore Collection
                </Link>
              </div>

              {/* Hero Metrics Row */}
              <div className="pt-8 mt-8 border-t border-white/15 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-bold tabular-nums text-white">
                    {products.length || 18}+
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">Unique Silhouettes</p>
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-bold tabular-nums text-white">
                    8
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">Curated Categories</p>
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-bold tabular-nums text-emerald-400">
                    48 Hr
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">Major City Dispatch</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 2. HOUSE FOOTWEAR BRANDS STRIP */}
        <div className="bg-white text-[#111827] border-b border-stone-200">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
              House Footwear Divisions
            </span>
            <div className="flex flex-wrap items-center gap-6 sm:gap-10">
              {HOUSE_BRANDS.map((brand) => (
                <Link
                  key={brand}
                  to={`/shop?brand=${encodeURIComponent(brand)}`}
                  className="font-display text-xs sm:text-sm font-bold tracking-[0.14em] text-stone-700 hover:text-[#E85D2A] transition-colors whitespace-nowrap"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. DUAL EDITORIAL CAMPAIGN SPLIT */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Campaign */}
          <Link
            to="/shop?category=Running"
            className="group relative aspect-[4/3] overflow-hidden bg-[#0C1016] block"
          >
            <img
              src={EDITORIAL_IMAGES.campaignMens}
              alt="Architectural Performance Rotation"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E85D2A] mb-2">
                Performance Campaign · Season 04
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                Architectural Street &amp; Tempo Rotation
              </h2>
              <p className="text-sm text-stone-300 mt-2 max-w-md">
                Carbon-plated tempo runners, rugged trail ripstop, and Italian calfskin court lows.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#111827] group-hover:bg-[#E85D2A] group-hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors">
                Shop Performance
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Right Campaign */}
          <Link
            to="/shop?category=Casual"
            className="group relative aspect-[4/3] overflow-hidden bg-[#ECE8E0] block"
          >
            <img
              src={EDITORIAL_IMAGES.campaignWomens}
              alt="Sculpted Atelier Silhouettes"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-200 mb-2">
                Atelier Edit · Sculpted Forms
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                Sculpted Everyday Silhouettes
              </h2>
              <p className="text-sm text-stone-200 mt-2 max-w-md">
                Weightless 45mm leather platforms, warm sandstone suede, and breathable knit runners.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#E85D2A] text-white group-hover:bg-white group-hover:text-[#111827] text-xs font-semibold uppercase tracking-wider transition-colors">
                Explore Everyday
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. SHOP BY CATEGORY (01 - 08) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pb-16 lg:pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E85D2A] mb-1">
              Eight Disciplines
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
              Shop By Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-[#E85D2A] inline-flex items-center gap-1.5"
          >
            Browse All Sneakers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categoryShowcase.map((cat) => (
            <Link
              key={cat.category}
              to={`/shop?category=${encodeURIComponent(cat.category)}`}
              className="group bg-white border border-stone-200/90 hover:border-[#111827] transition-colors overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-[#F4F2EE] overflow-hidden">
                <SneakerImage
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-[#111827] text-white font-mono text-[11px] px-2 py-0.5 tabular-nums">
                  {cat.code}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-sm sm:text-base font-semibold text-[#111827] group-hover:text-[#E85D2A] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Explore Edit</p>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#E85D2A] group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Error Banner if Supabase fetch failed */}
      {error && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 mb-8">
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* 5. TRENDING SNEAKERS */}
      <section className="bg-[#F8F7F4] border-y border-stone-200/80 py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E85D2A] mb-1">
                In High Demand
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                Trending Now
              </h2>
            </div>
            <Link
              to="/shop?sort=popularity"
              className="text-xs font-semibold uppercase tracking-wider text-[#111827] hover:text-[#E85D2A] inline-flex items-center gap-1.5"
            >
              Shop All Trending
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <ProductSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. NEW ARRIVALS — DROP 04 */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-9">
            <div className="lg:col-span-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E85D2A] mb-1">
                Fresh From The Atelier
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#111827]">
                New Arrivals — Drop 04
              </h2>
            </div>
            <div className="lg:col-span-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-stone-600 max-w-md">
                Newly landed colorways engineered with brushed suede, breathable ribbed knit, and full-grain leather.
              </p>
              <Link
                to="/shop?filter=new"
                className="px-5 py-2.5 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                View Drop
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {loading ? (
            <ProductSkeleton count={4} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 7. BEST SELLERS */}
      <section className="bg-[#F3F1EC] border-y border-stone-200/80 py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E85D2A] mb-1">
                Collector Favorites · 4.8+ Rated
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                Best Sellers
              </h2>
            </div>
            <Link
              to="/shop?sort=popularity"
              className="text-xs font-semibold uppercase tracking-wider text-[#111827] hover:text-[#E85D2A] inline-flex items-center gap-1.5"
            >
              Shop Best Sellers
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <ProductSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8. EXCLUSIVE LIMITED EDITION VAULT (DARK SECTION) */}
      <section className="bg-[#0C1016] text-white py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E85D2A]">
                Numbered Vault Drops
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight text-balance">
                Exclusive Limited Edition. Made to Stand Out.
              </h2>
              <p className="text-sm sm:text-base text-stone-400 leading-relaxed">
                Small-batch collector releases featuring brushed brass hardware, hand-burnished Tuscan calfskin, and ballistic shroud overlays. Once archived, these runs do not restock.
              </p>
              <Link
                to="/shop?category=Limited+Edition"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#E85D2A] hover:bg-[#D14D1C] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Enter The Limited Vault
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:col-span-7">
              <div className="aspect-[16/9] overflow-hidden border border-white/10">
                <img
                  src={EDITORIAL_IMAGES.vaultShowcase}
                  alt="SOLEVERSE Limited Edition Vault Gallery"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vaultProducts.map((product) => (
              <ProductCard key={product.id} product={product} variant="dark" />
            ))}
          </div>
        </div>
      </section>

      {/* 9. PREMIUM RUNNING DIVISION (DARK SLATE SPLIT) */}
      <section className="bg-[#11161F] text-white border-t border-white/10 py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="aspect-[16/9] overflow-hidden border border-white/10">
                <img
                  src={EDITORIAL_IMAGES.runningMacro}
                  alt="Nitrogen foam and carbon propulsion running sneaker"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-5 space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Nitrogen Foam &amp; Carbon Propulsion
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
                Premium Running Division
              </h2>
              <p className="text-sm text-stone-300 leading-relaxed">
                Tuned for dawn tempo intervals and marathon distances with dual-density rebound midsoles and razor-thin breathable engineered mesh.
              </p>

              <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/10">
                <div>
                  <p className="font-display text-xl font-bold tabular-nums">218g</p>
                  <p className="text-xs text-stone-400">Featherweight Build</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold tabular-nums">8mm</p>
                  <p className="text-xs text-stone-400">Heel-to-Toe Drop</p>
                </div>
                <div>
                  <p className="font-display text-xl font-bold tabular-nums text-emerald-400">
                    84%
                  </p>
                  <p className="text-xs text-stone-400">Energy Return</p>
                </div>
              </div>

              <Link
                to="/shop?category=Running"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#111827] hover:bg-[#E85D2A] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Shop Running Division
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {runningProducts.map((product) => (
              <ProductCard key={product.id} product={product} variant="dark" />
            ))}
          </div>
        </div>
      </section>

      {/* 10. COURT, STREETWEAR & LIFESTYLE ROTATION */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E85D2A] mb-1">
                Court · Streetwear · Heritage
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                Court &amp; Streetwear Rotation
              </h2>
            </div>
            <Link
              to="/shop?category=Streetwear"
              className="text-xs font-semibold uppercase tracking-wider text-[#111827] hover:text-[#E85D2A] inline-flex items-center gap-1.5"
            >
              Explore Street &amp; Court
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courtAndStreet.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 11. MID-SEASON ARCHIVE SALE BANNER */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pb-16">
        <div className="bg-gradient-to-r from-[#D94E1F] via-[#B83B19] to-[#111827] text-white p-8 sm:p-12 lg:p-14 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-100">
              Mid-Season Archive Event
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold leading-tight">
              Save Up to 20% on Select Releases + Free Delivery Over $150
            </h2>
            <p className="text-sm text-orange-50/90">
              Automatic complimentary courier delivery on orders $150 or more with Cash on Delivery support.
            </p>
          </div>
          <Link
            to="/shop?filter=sale"
            className="px-7 py-3.5 bg-white text-[#111827] hover:bg-[#111827] hover:text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 transition-colors whitespace-nowrap self-start lg:self-auto"
          >
            Shop Sale Releases
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 12. THE SOLEVERSE STORY & ATELIER STANDARDS */}
      <section id="story" className="bg-[#F8F7F4] border-y border-stone-200/80 py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <div className="aspect-[16/10] overflow-hidden border border-stone-200">
                <img
                  src={EDITORIAL_IMAGES.atelierCraft}
                  alt="SOLEVERSE footwear designer inspecting sneaker prototypes"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-6 space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E85D2A]">
                The SOLEVERSE Story
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#111827] leading-tight text-balance">
                Architectural Footwear Built Without Compromise
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Born from a desire to bring precision sneaker engineering directly to collectors, SOLEVERSE pairs minimalist architectural proportions with tactile Italian calfskin, technical ripstop, and high-rebound nitrogen foams.
              </p>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Every silhouette passes an 18-point quality inspection at our atelier before being sealed in rigid numbered packaging and dispatched with Cash on Delivery.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="px-6 py-3 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Explore All Silhouettes
                </Link>
              </div>
            </div>
          </div>

          {/* 4 Numbered Atelier Standards */}
          <div>
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E85D2A] mb-1">
                The Atelier Standard
              </p>
              <h3 className="font-display text-2xl font-bold text-[#111827]">
                Why Choose SOLEVERSE
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  num: '01',
                  title: 'Cash on Delivery (COD)',
                  body: 'Pay conveniently upon delivery at your doorstep with zero upfront card requirement.',
                },
                {
                  num: '02',
                  title: '7-Day Size Exchange',
                  body: 'Unworn pairs qualify for doorstep courier size exchange within 7 days of delivery.',
                },
                {
                  num: '03',
                  title: 'Italian & Technical Materials',
                  body: 'Full-grain calfskin, water-resistant ripstop, and nitrogen-infused midsole compounds.',
                },
                {
                  num: '04',
                  title: 'Rigid Archival Packaging',
                  body: 'Every pair ships double-boxed in our numbered rigid carton with spare waxed laces.',
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="bg-white border border-stone-200/90 p-6 space-y-2.5"
                >
                  <span className="font-mono text-xs font-semibold text-[#E85D2A] tabular-nums">
                    {item.num}
                  </span>
                  <h4 className="font-display text-base font-bold text-[#111827]">
                    {item.title}
                  </h4>
                  <p className="text-sm text-stone-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 13. VERIFIED CUSTOMER REVIEWS */}
      <section id="reviews" className="bg-white py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E85D2A] mb-1">
                Verified Deliveries
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                Customer Reviews
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111827] tabular-nums">
              <Star className="w-4 h-4 fill-[#E85D2A] text-[#E85D2A]" />
              <span>4.9 / 5.0</span>
              <span className="text-stone-500 font-normal">Across 2,400+ Pairs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CUSTOMER_REVIEWS.map((review) => (
              <blockquote
                key={review.name}
                className="bg-[#F8F7F4] border border-stone-200/80 p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-0.5 text-[#E85D2A]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span>Verified COD Purchase</span>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>
                <footer className="pt-4 border-t border-stone-200/80 text-xs">
                  <p className="font-semibold text-[#111827]">{review.name}</p>
                  <p className="text-stone-500 mt-0.5">
                    {review.location} · {review.item}
                  </p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* 14. EARLY ACCESS & FAQ ACCORDION */}
      <section id="faq" className="bg-[#F3F1EC] border-t border-stone-200/80 py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-14">
          {/* Private Client List */}
          <div className="bg-[#0C1016] text-white p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E85D2A]">
                Private Client List
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                Unlock Early Access to Limited Vault Drops
              </h2>
              <p className="text-sm text-stone-400">
                Receive restock alerts, archival sale previews, and numbered drop invitations before general release.
              </p>
            </div>
            <form
              onSubmit={handleEarlyAccess}
              className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:min-w-[420px]"
            >
              <label htmlFor="early-access-email" className="sr-only">
                Email address
              </label>
              <input
                id="early-access-email"
                type="email"
                value={earlyEmail}
                onChange={(e) => setEarlyEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-[#141922] border border-white/15 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E85D2A]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#E85D2A] hover:bg-[#D14D1C] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                Subscribe
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E85D2A] mb-1">
                Client Concierge
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="divide-y divide-stone-200 bg-white border border-stone-200">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50 transition-colors"
                    >
                      <span className="font-display text-sm sm:text-base font-semibold text-[#111827]">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-sm text-stone-600 leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
