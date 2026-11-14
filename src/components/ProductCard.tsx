import React from 'react';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useToast } from '../context/ToastContext';
import { Product } from '../types';
import { formatPrice, getDiscountPercent } from '../utils/format';
import { SneakerImage } from './SneakerImage';

interface ProductCardProps {
  product: Product;
  variant?: 'light' | 'dark';
}

export function ProductCard({ product, variant = 'light' }: ProductCardProps) {
  const { addToCart, openCart, openQuickView } = useCart();
  const { toggleWishlist, isWishlisted } = useProducts();
  const { showToast } = useToast();

  const wishlisted = isWishlisted(product.id);
  const discount = getDiscountPercent(product.price, product.sale_price);
  const isDark = variant === 'dark';
  const defaultSize = product.sizes[0] || 'US 9';
  const defaultColor = product.colors[0]?.name || 'Standard';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      showToast({
        type: 'error',
        title: 'Currently Out of Stock',
        description: `${product.name} is temporarily unavailable.`,
      });
      return;
    }
    addToCart(product, defaultSize, defaultColor, 1);
    showToast({
      type: 'success',
      title: 'Added to Bag',
      description: `${product.name} (${defaultSize}) added.`,
    });
    openCart();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    showToast({
      type: 'info',
      title: added ? 'Saved to Wishlist' : 'Removed from Wishlist',
      description: product.name,
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const tagLabel = discount ? `-${discount}% SALE` : product.badge;

  return (
    <article
      className={`group flex flex-col transition-transform duration-200 ease-out hover:-translate-y-0.5 ${
        isDark
          ? 'bg-[#141922] border border-white/10 text-white'
          : 'bg-white border border-stone-200/80 text-[#111827]'
      }`}
    >
      {/* Image Frame (4:3 uniform) */}
      <div
        className={`relative aspect-[4/3] overflow-hidden ${
          isDark ? 'bg-[#0C1016]' : 'bg-[#F4F2EE]'
        }`}
      >
        <Link
          to={`/product/${product.id}`}
          className="block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D2A]"
        >
          <SneakerImage
            src={product.image_url}
            alt={`${product.brand} ${product.name} sneaker`}
            darkFallback={isDark}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        {/* Single rectangular corner label (no pill badge spam) */}
        {tagLabel && (
          <span
            className={`absolute top-3 left-3 px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase ${
              discount
                ? 'bg-[#E85D2A] text-white'
                : isDark
                  ? 'bg-white text-[#111827]'
                  : 'bg-[#111827] text-white'
            }`}
          >
            {tagLabel}
          </span>
        )}

        {/* Quick View & Wishlist Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleQuickView}
            aria-label={`Quick view ${product.name}`}
            className={`w-9 h-9 flex items-center justify-center border transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D2A] ${
              isDark
                ? 'bg-[#0C1016]/85 border-white/15 text-stone-200 hover:bg-white hover:text-[#111827]'
                : 'bg-white/95 border-stone-200 text-stone-700 hover:bg-[#111827] hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className={`w-9 h-9 flex items-center justify-center border transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D2A] ${
              wishlisted
                ? 'bg-[#E85D2A] border-[#E85D2A] text-white'
                : isDark
                  ? 'bg-[#0C1016]/85 border-white/15 text-stone-200 hover:border-white/40'
                  : 'bg-white/95 border-stone-200 text-stone-700 hover:border-stone-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Hover Quick-Add Bar */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`w-full py-2.5 px-4 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-white text-[#111827] hover:bg-[#E85D2A] hover:text-white'
                : 'bg-[#111827] text-white hover:bg-[#E85D2A]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock > 0 ? `Add to Bag · ${defaultSize}` : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* Product Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wider mb-1.5">
            <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>
              {product.brand} · {product.category}
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums font-medium">
              <Star className="w-3 h-3 fill-[#E85D2A] text-[#E85D2A]" />
              {product.rating.toFixed(1)}
            </span>
          </div>

          <Link
            to={`/product/${product.id}`}
            className={`block font-display text-base font-semibold leading-snug hover:text-[#E85D2A] transition-colors ${
              isDark ? 'text-white' : 'text-[#111827]'
            }`}
          >
            {product.name}
          </Link>

          <p className={`text-xs mt-1 truncate ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            {product.colors.map((c) => c.name).join(' / ') || 'Signature Edition'}
          </p>
        </div>

        <div
          className={`pt-3 border-t flex items-center justify-between gap-2 ${
            isDark ? 'border-white/10' : 'border-stone-100'
          }`}
        >
          <div className="flex items-baseline gap-2 tabular-nums">
            {product.sale_price !== null && product.sale_price < product.price ? (
              <>
                <span className="text-[15px] font-bold text-[#E85D2A]">
                  {formatPrice(product.sale_price)}
                </span>
                <span
                  className={`text-xs line-through ${
                    isDark ? 'text-stone-500' : 'text-stone-400'
                  }`}
                >
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-[15px] font-bold">{formatPrice(product.price)}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {product.colors.slice(0, 3).map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="w-3 h-3 rounded-full border border-stone-400/40"
                style={{ backgroundColor: color.hex }}
              />
            ))}
            <span
              className={`text-[11px] font-medium ml-1 ${
                product.stock <= 0
                  ? 'text-red-500'
                  : product.stock <= 8
                    ? 'text-amber-600'
                    : isDark
                      ? 'text-emerald-400'
                      : 'text-emerald-700'
              }`}
            >
              {product.stock <= 0 ? 'Sold Out' : product.stock <= 8 ? 'Only Few Left' : 'In Stock'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
