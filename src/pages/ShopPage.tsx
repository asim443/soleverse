import React, { useEffect, useMemo, useState } from 'react';
import { Filter, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton } from '../components/ProductSkeleton';
import { useProducts } from '../context/ProductContext';
import { SortOption } from '../types';
import { formatPrice } from '../utils/format';

const CATEGORIES = [
  'All',
  'Running',
  'Lifestyle',
  'Basketball',
  'Training',
  'Streetwear',
  'Casual',
  'Premium',
  'Limited Edition',
];

const SIZES = ['All', 'US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'US 13'];

export function ShopPage() {
  const { products, loading, error, dataSource } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'All');
  const [size, setSize] = useState('All');
  const [color, setColor] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(350);
  const [onlySale, setOnlySale] = useState(searchParams.get('filter') === 'sale');
  const [onlyNew, setOnlyNew] = useState(searchParams.get('filter') === 'new');
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'newest'
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync URL query params into filter state when navigating from Header/Home
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'All';
    const br = searchParams.get('brand') || 'All';
    const filter = searchParams.get('filter');
    const srt = (searchParams.get('sort') as SortOption) || 'newest';

    setSearch(q);
    setCategory(cat);
    setBrand(br);
    setOnlySale(filter === 'sale');
    setOnlyNew(filter === 'new');
    setSort(srt);
  }, [searchParams]);

  const availableBrands = useMemo(() => {
    const set = new Set<string>(products.map((p) => p.brand));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.colors.forEach((c) => set.add(c.name)));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const priceCeiling = useMemo(() => {
    if (products.length === 0) return 350;
    return Math.max(350, ...products.map((p) => Math.ceil(p.price / 10) * 10));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      const effectivePrice = p.sale_price ?? p.price;
      if (effectivePrice > maxPrice) return false;
      if (category !== 'All' && p.category !== category) return false;
      if (brand !== 'All' && p.brand !== brand) return false;
      if (size !== 'All' && !p.sizes.includes(size)) return false;
      if (
        color !== 'All' &&
        !p.colors.some((c) => c.name.toLowerCase() === color.toLowerCase())
      ) {
        return false;
      }
      if (onlySale && (p.sale_price === null || p.sale_price >= p.price)) return false;
      if (onlyNew && p.badge !== 'NEW DROP') return false;
      if (q) {
        const hay = `${p.name} ${p.brand} ${p.category} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
        break;
      case 'popularity':
        sorted.sort((a, b) => b.rating - a.rating || b.stock - a.stock);
        break;
      case 'newest':
      default:
        sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }
    return sorted;
  }, [products, search, category, brand, size, color, maxPrice, onlySale, onlyNew, sort]);

  const resetAllFilters = () => {
    setSearch('');
    setCategory('All');
    setBrand('All');
    setSize('All');
    setColor('All');
    setMaxPrice(priceCeiling);
    setOnlySale(false);
    setOnlyNew(false);
    setSort('newest');
    setSearchParams({});
  };

  const renderFiltersContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <span className="font-display text-sm font-bold uppercase tracking-wider text-[#111827]">
          Filters
        </span>
        <button
          type="button"
          onClick={resetAllFilters}
          className="text-xs font-medium text-stone-500 hover:text-[#E85D2A] inline-flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Quick Toggles */}
      <div className="space-y-2">
        <label className="flex items-center gap-2.5 text-sm text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyNew}
            onChange={(e) => setOnlyNew(e.target.checked)}
            className="w-4 h-4 accent-[#E85D2A]"
          />
          <span>New Arrivals Only</span>
        </label>
        <label className="flex items-center gap-2.5 text-sm text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            checked={onlySale}
            onChange={(e) => setOnlySale(e.target.checked)}
            className="w-4 h-4 accent-[#E85D2A]"
          />
          <span>On Sale Only</span>
        </label>
      </div>

      {/* Category */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
          Category
        </h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`w-full text-left px-2.5 py-1.5 text-sm transition-colors cursor-pointer ${
                category === cat
                  ? 'bg-[#111827] text-white font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <label
          htmlFor="filter-brand"
          className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2"
        >
          Brand Division
        </label>
        <select
          id="filter-brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 bg-white text-sm text-[#111827] focus:outline-none focus:border-[#111827]"
        >
          {availableBrands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Max Price */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="filter-price"
            className="text-xs font-semibold uppercase tracking-wider text-stone-500"
          >
            Max Price
          </label>
          <span className="text-xs font-bold text-[#111827] tabular-nums">
            {formatPrice(maxPrice)}
          </span>
        </div>
        <input
          id="filter-price"
          type="range"
          min={100}
          max={priceCeiling}
          step={5}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#E85D2A] cursor-pointer"
        />
      </div>

      {/* Size */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
          Size
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                size === s
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label
          htmlFor="filter-color"
          className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2"
        >
          Colorway
        </label>
        <select
          id="filter-color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 bg-white text-sm text-[#111827] focus:outline-none focus:border-[#111827]"
        >
          {availableColors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8F7F4] min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E85D2A] mb-1">
                SOLEVERSE Catalog
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#111827]">
                {category === 'All' ? 'All Sneakers' : category}
              </h1>
              <p className="text-sm text-stone-600 mt-1.5">
                Showing{' '}
                <span className="font-semibold text-[#111827] tabular-nums">
                  {filteredProducts.length}
                </span>{' '}
                silhouettes · Source:{' '}
                {dataSource === 'supabase'
                  ? 'Live Supabase Database'
                  : 'Catalog Preview (Configure Supabase .env for live DB)'}
              </p>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search sneakers..."
                  aria-label="Search sneakers"
                  className="pl-9 pr-4 py-2.5 w-full sm:w-64 border border-stone-300 bg-white text-sm text-[#111827] focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden px-4 py-2.5 border border-stone-300 bg-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters
                </button>

                <label htmlFor="shop-sort" className="sr-only">
                  Sort products
                </label>
                <select
                  id="shop-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="px-3.5 py-2.5 border border-stone-300 bg-white text-sm text-[#111827] focus:outline-none focus:border-[#111827]"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="popularity">Sort: Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white border border-stone-200 p-6 sticky top-20">
            {renderFiltersContent()}
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <ProductSkeleton count={6} />
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-stone-200 p-12 text-center">
                <Filter className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h2 className="font-display text-xl font-bold text-[#111827]">
                  No sneakers found.
                </h2>
                <p className="text-sm text-stone-500 mt-1.5 max-w-md mx-auto">
                  No pairs match your active filters or search query. Try adjusting the price range or resetting filters.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="mt-5 px-6 py-2.5 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-base font-bold">Filter Catalog</span>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="w-9 h-9 flex items-center justify-center text-stone-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderFiltersContent()}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full mt-6 py-3 bg-[#111827] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Show {filteredProducts.length} Results
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
