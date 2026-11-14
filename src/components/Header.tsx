import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { formatPrice } from '../utils/format';
import { SneakerImage } from './SneakerImage';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Collections', to: '/shop?category=Limited+Edition' },
  { label: 'New Arrivals', to: '/shop?filter=new' },
  { label: 'Best Sellers', to: '/shop?sort=popularity' },
  { label: 'Sale', to: '/shop?filter=sale' },
];

export function Header() {
  const { itemCount, openCart } = useCart();
  const { user, isAdmin } = useAuth();
  const { products } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 4);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [products, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <div className="sticky top-0 z-40">
      {/* Slim Dismissible Announcement Strip (<= 32px) */}
      {showAnnouncement && (
        <div className="bg-[#0C1016] text-stone-200 h-8 px-4 flex items-center justify-center relative text-[11px] sm:text-xs tracking-wide">
          <p className="truncate pr-8 text-center">
            Complimentary Delivery on Orders $150+ · Cash on Delivery Available · 7-Day Size Exchange
          </p>
          <button
            type="button"
            onClick={() => setShowAnnouncement(false)}
            aria-label="Dismiss announcement"
            className="absolute right-3 text-stone-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <header
        className={`border-b border-stone-200/80 transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm h-14'
            : 'bg-white h-16'
        }`}
      >
        <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-6">
          {/* Brand Zone + Mobile Menu Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden w-10 h-10 -ml-2 flex items-center justify-center text-[#111827] hover:bg-stone-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/"
              className="font-display text-xl sm:text-2xl font-extrabold tracking-[0.14em] text-[#111827] whitespace-nowrap shrink-0"
            >
              SOLEVERSE
            </Link>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-stone-600"
          >
            {NAV_LINKS.map((link) => {
              const isActive =
                link.to === '/'
                  ? location.pathname === '/'
                  : `${location.pathname}${location.search}` === link.to;

              return (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors hover:text-[#111827] ${
                    isActive ? 'text-[#111827] font-semibold' : ''
                  } ${link.label === 'Sale' ? 'text-[#E85D2A] hover:text-[#D14D1C]' : ''}`}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search sneakers"
              className="w-10 h-10 flex items-center justify-center text-stone-700 hover:text-[#111827] hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {isAdmin && (
              <Link
                to="/admin"
                aria-label="Admin dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-[#E85D2A] whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}

            <Link
              to="/account"
              aria-label={user ? 'My account' : 'Sign in'}
              className="w-10 h-10 flex items-center justify-center text-stone-700 hover:text-[#111827] hover:bg-stone-100 transition-colors"
            >
              <User className="w-[18px] h-[18px]" />
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label={`Open shopping bag with ${itemCount} items`}
              className="ml-1 px-3.5 py-2 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="tabular-nums">Bag ({itemCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex flex-col">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 bg-white border-b border-stone-200 shadow-xl"
            >
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-stone-400 shrink-0" />
                  <input
                    type="search"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sneakers by name, brand, or category (e.g., Running, Vortex, Obsidian)..."
                    className="flex-1 text-base sm:text-lg text-[#111827] placeholder:text-stone-400 focus:outline-none py-2"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Close search"
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-[#111827] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </form>

                {/* Live Search Suggestions */}
                <div className="mt-5 pt-5 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      {searchQuery.trim() ? 'Matching Silhouettes' : 'Popular Silhouettes'}
                    </span>
                    <Link
                      to={
                        searchQuery.trim()
                          ? `/shop?q=${encodeURIComponent(searchQuery.trim())}`
                          : '/shop'
                      }
                      onClick={() => setSearchOpen(false)}
                      className="text-xs font-semibold text-[#E85D2A] hover:underline inline-flex items-center gap-1"
                    >
                      View all in Shop
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {searchResults.length === 0 ? (
                    <p className="text-sm text-stone-500 py-4">
                      No sneakers match &ldquo;{searchQuery}&rdquo;. Try searching Running, Trail, or SOLEVERSE.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 p-2 border border-stone-200/80 hover:border-[#111827] transition-colors"
                        >
                          <div className="w-16 h-12 bg-[#F4F2EE] shrink-0 overflow-hidden">
                            <SneakerImage
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wider text-stone-500 truncate">
                              {product.brand}
                            </p>
                            <p className="text-sm font-semibold text-[#111827] truncate">
                              {product.name}
                            </p>
                            <p className="text-xs font-bold text-[#E85D2A] tabular-nums">
                              {formatPrice(product.sale_price ?? product.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              aria-label="Mobile navigation"
              className="relative z-10 w-80 max-w-[85vw] bg-white h-full flex flex-col justify-between p-6 shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-stone-200">
                  <span className="font-display text-xl font-extrabold tracking-[0.14em] text-[#111827]">
                    SOLEVERSE
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close mobile menu"
                    className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-[#111827] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <ul className="mt-6 space-y-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between py-3 px-2 text-base font-medium border-b border-stone-100 ${
                          link.label === 'Sale' ? 'text-[#E85D2A]' : 'text-[#111827]'
                        }`}
                      >
                        {link.label}
                        <ArrowRight className="w-4 h-4 text-stone-400" />
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-3 px-2 text-base font-medium text-[#111827] border-b border-stone-100"
                    >
                      {user ? 'My Account & Orders' : 'Sign In / Register'}
                      <User className="w-4 h-4 text-stone-400" />
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-3 px-2 text-base font-semibold text-[#E85D2A] border-b border-stone-100"
                      >
                        Admin Dashboard
                        <ShieldCheck className="w-4 h-4" />
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              <div className="pt-6 border-t border-stone-200 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCart();
                  }}
                  className="w-full py-3 bg-[#111827] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  View Bag ({itemCount})
                </button>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
