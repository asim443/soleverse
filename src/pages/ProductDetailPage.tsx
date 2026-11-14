import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SneakerImage } from '../components/SneakerImage';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useToast } from '../context/ToastContext';
import { fetchProductById } from '../services/productService';
import { Product } from '../types';
import { formatPrice, getDiscountPercent } from '../utils/format';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, toggleWishlist, isWishlisted } = useProducts();
  const { addToCart, openCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState<string>('US 9');
  const [selectedColor, setSelectedColor] = useState<string>('Standard');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!id) return;

    let active = true;
    setLoading(true);
    setError(null);

    fetchProductById(id)
      .then((res) => {
        if (!active) return;
        const found = res.product || products.find((p) => p.id === id) || null;
        setProduct(found);
        if (found) {
          setSelectedSize(found.sizes[0] || 'US 9');
          setSelectedColor(found.colors[0]?.name || 'Standard');
          setQuantity(1);
          setActiveImageIdx(0);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load product details.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, products]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCategory = products.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    const others = products.filter(
      (p) => p.id !== product.id && p.category !== product.category
    );
    return [...sameCategory, ...others].slice(0, 4);
  }, [products, product]);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 aspect-[4/3] bg-stone-200" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-4 w-32 bg-stone-200" />
            <div className="h-10 w-3/4 bg-stone-200" />
            <div className="h-6 w-28 bg-stone-200" />
            <div className="h-24 w-full bg-stone-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#111827]">
          {error ? 'Error Loading Sneaker' : 'Sneaker Not Found'}
        </h1>
        <p className="text-sm text-stone-600">
          {error || 'The requested sneaker silhouette could not be found in our catalog.'}
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#111827] text-white text-xs font-semibold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Shop
        </Link>
      </div>
    );
  }

  const gallery = product.images.length > 0 ? product.images : [product.image_url];
  const discount = getDiscountPercent(product.price, product.sale_price);
  const wishlisted = isWishlisted(product.id);

  const handleAddToBag = () => {
    if (product.stock <= 0) {
      showToast({
        type: 'error',
        title: 'Out of Stock',
        description: `${product.name} is temporarily out of stock.`,
      });
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    showToast({
      type: 'success',
      title: 'Added to Bag',
      description: `${quantity} × ${product.name} (${selectedSize})`,
    });
    openCart();
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  const handleWishlist = () => {
    const added = toggleWishlist(product.id);
    showToast({
      type: 'info',
      title: added ? 'Saved to Wishlist' : 'Removed from Wishlist',
      description: product.name,
    });
  };

  return (
    <div className="bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 mb-8">
          <Link to="/" className="hover:text-[#111827]">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#111827]">
            Shop
          </Link>
          <span>/</span>
          <Link
            to={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#111827]"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium truncate">{product.name}</span>
        </nav>

        {/* Contiguous PDP Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] bg-[#F4F2EE] border border-stone-200 overflow-hidden">
              <SneakerImage
                src={gallery[activeImageIdx] || product.image_url}
                alt={`${product.brand} ${product.name}`}
                loading="eager"
                className="w-full h-full object-cover"
              />
              {discount && (
                <span className="absolute top-4 left-4 bg-[#E85D2A] text-white text-xs font-semibold px-3 py-1 uppercase tracking-wider">
                  -{discount}% Archive Sale
                </span>
              )}
              {!discount && product.badge && (
                <span className="absolute top-4 left-4 bg-[#111827] text-white text-xs font-semibold px-3 py-1 uppercase tracking-wider">
                  {product.badge}
                </span>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => setActiveImageIdx(i)}
                    className={`aspect-[4/3] bg-[#F4F2EE] border overflow-hidden cursor-pointer ${
                      activeImageIdx === i ? 'border-[#111827]' : 'border-stone-200'
                    }`}
                  >
                    <SneakerImage
                      src={img}
                      alt={`${product.name} angle ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Purchase Module */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-stone-500 mb-2">
                <span>
                  {product.brand} · {product.category}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#111827] tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-[#E85D2A] text-[#E85D2A]" />
                  {product.rating.toFixed(1)}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#111827]">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mt-3 tabular-nums">
                {product.sale_price !== null && product.sale_price < product.price ? (
                  <>
                    <span className="text-2xl font-bold text-[#E85D2A]">
                      {formatPrice(product.sale_price)}
                    </span>
                    <span className="text-base text-stone-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                    {discount && (
                      <span className="text-xs font-semibold text-[#E85D2A]">
                        Save {discount}%
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-bold text-[#111827]">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="pt-2 border-t border-stone-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 block mb-2.5">
                  Colorway: <span className="text-[#111827]">{selectedColor}</span>
                </span>
                <div className="flex items-center gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      aria-label={`Color ${c.name}`}
                      className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                        selectedColor === c.name
                          ? 'border-[#111827] scale-110'
                          : 'border-stone-300'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            <div className="pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Select Size
                </span>
                <span
                  className={`text-xs font-medium tabular-nums ${
                    product.stock <= 0
                      ? 'text-red-600'
                      : product.stock <= 8
                        ? 'text-amber-600'
                        : 'text-emerald-700'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} pairs in stock` : 'Currently Sold Out'}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`py-2.5 text-xs font-semibold border transition-colors cursor-pointer ${
                      selectedSize === s
                        ? 'bg-[#111827] text-white border-[#111827]'
                        : 'bg-white text-stone-800 border-stone-300 hover:border-[#111827]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-stone-300 h-12">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-11 h-full flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-11 text-center text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(product.stock > 0 ? product.stock : 10, q + 1)
                      )
                    }
                    aria-label="Increase quantity"
                    className="w-11 h-full flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToBag}
                  disabled={product.stock <= 0}
                  className="flex-1 h-12 px-6 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <button
                  type="button"
                  onClick={handleWishlist}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`w-12 h-12 border flex items-center justify-center transition-colors cursor-pointer ${
                    wishlisted
                      ? 'bg-[#E85D2A] border-[#E85D2A] text-white'
                      : 'border-stone-300 text-stone-700 hover:border-[#111827]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full h-12 bg-[#E85D2A] hover:bg-[#D14D1C] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                Buy Now — Cash on Delivery
              </button>
            </div>

            {/* Trust Specs */}
            <div className="pt-4 border-t border-stone-200 space-y-2.5 text-xs text-stone-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#111827] shrink-0" />
                <span>Complimentary delivery on orders $150+ · 48 Hr major city dispatch</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#111827] shrink-0" />
                <span>Cash on Delivery (COD) available with doorstep inspection</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#111827] shrink-0" />
                <span>18-point atelier QC &amp; 7-day unworn size exchange</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-14 border-t border-stone-200">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E85D2A] mb-1">
                  Curated Pairings
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                  Related Sneakers
                </h2>
              </div>
              <Link
                to={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-[#E85D2A]"
              >
                View All {product.category}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
