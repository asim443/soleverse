import React, { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export function Footer() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const handleDispatchSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast({
        type: 'error',
        title: 'Enter a valid email address',
      });
      return;
    }
    showToast({
      type: 'success',
      title: 'Added to Release Dispatch',
      description: `Early drop notifications will be sent to ${email.trim()}.`,
    });
    setEmail('');
  };

  return (
    <footer className="bg-[#0C1016] text-stone-300 border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              to="/"
              className="inline-block font-display text-2xl font-extrabold tracking-[0.14em] text-white"
            >
              SOLEVERSE
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              Architectural footwear atelier crafted with full-grain Italian calfskin, nitrogen-infused running midsoles, and technical ripstop. Nationwide Cash on Delivery available.
            </p>
            <div className="pt-2 space-y-1 text-xs text-stone-400">
              <p>Flagship Studio · 420 Mercer Architectural Row</p>
              <p>Mon–Sat, 10 AM – 8 PM · concierge@soleverse.com</p>
            </div>
            <div className="flex items-center gap-4 pt-2 text-xs font-medium text-stone-300">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#E85D2A] transition-colors"
              >
                Instagram
              </a>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#E85D2A] transition-colors"
              >
                Facebook
              </a>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#E85D2A] transition-colors"
              >
                TikTok
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Sneakers
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=new" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=popularity" className="hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=sale" className="hover:text-white transition-colors">
                  Archive Sale
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Limited+Edition" className="hover:text-white transition-colors">
                  Limited Vault
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Links */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">
              Help
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <a href="/#faq" className="hover:text-white transition-colors">
                  Shipping &amp; COD
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-white transition-colors">
                  Returns &amp; Exchanges
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-white transition-colors">
                  FAQ &amp; Sizing
                </a>
              </li>
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <a href="mailto:concierge@soleverse.com" className="hover:text-white transition-colors">
                  Contact Concierge
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <a href="/#story" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/#story" className="hover:text-white transition-colors">
                  Our Story
                </a>
              </li>
              <li>
                <a href="/#reviews" className="hover:text-white transition-colors">
                  Reviews
                </a>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-3">
            <div className="bg-[#141922] border border-white/10 p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#E85D2A]">
                Release Dispatch
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Private early access to limited-run drops, archive restocks, and atelier previews.
              </p>
              <form onSubmit={handleDispatchSubscribe} className="space-y-2.5">
                <label htmlFor="footer-dispatch-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-dispatch-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#0C1016] border border-white/15 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E85D2A]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#E85D2A] hover:bg-[#D14D1C] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  Join Dispatch
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex flex-wrap items-center gap-4">
            <span>Cash on Delivery (COD)</span>
            <span aria-hidden="true">·</span>
            <span>7-Day Unworn Size Exchange</span>
            <span aria-hidden="true">·</span>
            <span>18-Point Atelier Inspection</span>
          </div>
          <div className="flex items-center gap-5">
            <span>&copy; {new Date().getFullYear()} SOLEVERSE Footwear Atelier.</span>
            <a href="/#faq" className="hover:text-stone-300">
              Privacy
            </a>
            <a href="/#faq" className="hover:text-stone-300">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
