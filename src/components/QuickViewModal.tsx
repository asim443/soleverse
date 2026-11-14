import React, { useEffect, useState } from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, Star, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, getDiscountPercent } from '../utils/format';
import { SneakerImage } from './SneakerImage';

export function QuickViewModal() {
  const { quickViewProduct, closeQuickView, addToCart, openCart } = useCart();
  const { showToast } = useToast();

  const [selectedSize, setSelectedSize] = useState<string>('US 9');
  const [selectedColor, setSelectedColor] = useState<string>('Standard');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedSize(quickViewProduct.sizes[0] || 'US 9');
      setSelectedColor(quickViewProduct.colors[0]?.name || 'Standard');
      setQuantity(1);
    }
  }, [quickViewProduct]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && quickViewProduct) {
        closeQuickView();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [quickViewProduct, closeQuickView]);

  const handleAdd = () => {
    if (!quickViewProduct) return;
    if (quickViewProduct.stock <= 0) {
      showToast({
        type: 'error',
        title: 'Out of Stock',
        description: `${quickViewProduct.name} is currently sold out.`,
      });
      return;
    }
    addToCart(quickViewProduct, selectedSize, selectedColor, quantity);
    showToast({
      type: 'success',
      title: 'Added to Bag',
      description: `${quantity} × ${quickViewProduct.name} (${selectedSize})`,
    });
    closeQuickView();
    openCart();
  };

  return (
    <AnimatePresence>
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeQuickView}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
          >
            <button
              type="button"
              onClick={closeQuickView}
              aria-label="Close quick view"
              className="absolute top-4 right-4 z-20 w-9 h-9 bg-white/95 border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-[#111827] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-[#F4F2EE] aspect-[4/3] md:aspect-auto md:h-full relative overflow-hidden">
              <SneakerImage
                src={quickViewProduct.image_url}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
              {getDiscountPercent(quickViewProduct.price, quickViewProduct.sale_price) && (
                <span className="absolute top-4 left-4 bg-[#E85D2A] text-white text-xs font-semibold px-2.5 py-1 uppercase tracking-wider">
                  -{getDiscountPercent(quickViewProduct.price, quickViewProduct.sale_price)}% Sale
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-center justify-between text-xs uppercase tracking-wider text-stone-500 mb-2">
                  <span>
                    {quickViewProduct.brand} · {quickViewProduct.category}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#111827] tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-[#E85D2A] text-[#E85D2A]" />
                    {quickViewProduct.rating.toFixed(1)}
                  </span>
                </div>

                <h2 id="quick-view-title" className="font-display text-2xl font-bold text-[#111827]">
                  {quickViewProduct.name}
                </h2>

                <div className="flex items-baseline gap-2.5 mt-2 tabular-nums">
                  {quickViewProduct.sale_price !== null &&
                  quickViewProduct.sale_price < quickViewProduct.price ? (
                    <>
                      <span className="text-xl font-bold text-[#E85D2A]">
                        {formatPrice(quickViewProduct.sale_price)}
                      </span>
                      <span className="text-sm text-stone-400 line-through">
                        {formatPrice(quickViewProduct.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-[#111827]">
                      {formatPrice(quickViewProduct.price)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-stone-600 mt-3 leading-relaxed line-clamp-3">
                  {quickViewProduct.description}
                </p>

                {/* Color Selection */}
                {quickViewProduct.colors.length > 0 && (
                  <div className="mt-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 block mb-2">
                      Colorway: {selectedColor}
                    </span>
                    <div className="flex items-center gap-2">
                      {quickViewProduct.colors.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColor(color.name)}
                          aria-label={`Select ${color.name}`}
                          className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                            selectedColor === color.name
                              ? 'border-[#111827] scale-110'
                              : 'border-stone-300'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Select Size
                    </span>
                    <span className="text-xs text-stone-500 tabular-nums">
                      {quickViewProduct.stock > 0
                        ? `${quickViewProduct.stock} pairs available`
                        : 'Out of stock'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {quickViewProduct.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 text-xs font-semibold border transition-colors cursor-pointer ${
                          selectedSize === size
                            ? 'bg-[#111827] text-white border-[#111827]'
                            : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mt-5 flex items-center gap-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Quantity
                  </span>
                  <div className="inline-flex items-center border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="w-9 h-9 flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(quickViewProduct.stock > 0 ? quickViewProduct.stock : 10, q + 1)
                        )
                      }
                      aria-label="Increase quantity"
                      className="w-9 h-9 flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={quickViewProduct.stock <= 0}
                  className="w-full py-3.5 px-6 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {quickViewProduct.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
                </button>
                <Link
                  to={`/product/${quickViewProduct.id}`}
                  onClick={closeQuickView}
                  className="w-full py-2.5 px-4 border border-stone-300 text-xs font-semibold uppercase tracking-wider text-stone-800 hover:border-[#111827] flex items-center justify-center gap-1.5 transition-colors"
                >
                  View Full Specifications
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
