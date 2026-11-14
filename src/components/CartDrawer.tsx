import React, { useEffect } from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '../utils/format';
import { SneakerImage } from './SneakerImage';

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    isCartOpen,
    closeCart,
    updateQuantity,
    updateSize,
    removeFromCart,
  } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) closeCart();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCartOpen, closeCart]);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Bag"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-stone-200"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#111827]" />
                <h2 className="font-display text-lg font-bold text-[#111827]">
                  Your Bag <span className="text-stone-500 font-normal tabular-nums">({itemCount})</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close shopping bag"
                className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-[#111827] hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free shipping indicator */}
            {items.length > 0 && (
              <div className="px-6 py-3 bg-[#F8F7F4] border-b border-stone-200">
                <p className="text-xs text-stone-700 mb-1.5">
                  {remainingForFreeShipping === 0 ? (
                    <span className="font-semibold text-emerald-700">
                      Unlocked complimentary nationwide delivery.
                    </span>
                  ) : (
                    <>
                      Add <span className="font-semibold tabular-nums">{formatPrice(remainingForFreeShipping)}</span> more for complimentary delivery.
                    </>
                  )}
                </p>
                <div className="w-full h-1.5 bg-stone-200 overflow-hidden">
                  <div
                    className="h-full bg-[#E85D2A] transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 bg-[#F4F2EE] flex items-center justify-center mb-4">
                    <ShoppingBag className="w-7 h-7 text-stone-400" />
                  </div>
                  <p className="font-display text-lg font-semibold text-[#111827]">
                    Your cart is waiting for something great.
                  </p>
                  <p className="text-sm text-stone-500 mt-1.5 max-w-xs">
                    Explore our latest silhouettes across running, lifestyle, and limited vault editions.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeCart();
                      navigate('/shop');
                    }}
                    className="mt-6 px-6 py-3 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    SHOP SNEAKERS
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-stone-200">
                  {items.map((item) => {
                    const unitPrice = item.product.sale_price ?? item.product.price;
                    return (
                      <li
                        key={`${item.product.id}-${item.size}-${item.color}`}
                        className="py-4 flex gap-4"
                      >
                        <Link
                          to={`/product/${item.product.id}`}
                          onClick={closeCart}
                          className="w-24 h-20 bg-[#F4F2EE] shrink-0 overflow-hidden"
                        >
                          <SneakerImage
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                to={`/product/${item.product.id}`}
                                onClick={closeCart}
                                className="font-display text-sm font-semibold text-[#111827] hover:text-[#E85D2A] truncate"
                              >
                                {item.product.name}
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  removeFromCart(item.product.id, item.size, item.color)
                                }
                                aria-label={`Remove ${item.product.name}`}
                                className="text-stone-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {item.product.brand} · {item.color}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-3">
                            <div className="flex items-center gap-2">
                              <label className="sr-only" htmlFor={`drawer-size-${item.product.id}-${item.size}`}>
                                Size
                              </label>
                              <select
                                id={`drawer-size-${item.product.id}-${item.size}`}
                                value={item.size}
                                onChange={(e) =>
                                  updateSize(item.product.id, item.size, e.target.value, item.color)
                                }
                                className="text-xs border border-stone-200 bg-white px-2 py-1 text-stone-800 focus:outline-none focus:border-[#111827]"
                              >
                                {item.product.sizes.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>

                              <div className="inline-flex items-center border border-stone-200">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id,
                                      item.size,
                                      item.color,
                                      item.quantity - 1
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                  className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-7 text-center text-xs font-semibold tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id,
                                      item.size,
                                      item.color,
                                      item.quantity + 1
                                    )
                                  }
                                  aria-label="Increase quantity"
                                  className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <span className="text-sm font-bold text-[#111827] tabular-nums">
                              {formatPrice(unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-stone-200 bg-[#F8F7F4] space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-medium text-[#111827]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Shipping</span>
                    <span className="tabular-nums font-medium text-[#111827]">
                      {shipping === 0 ? 'Complimentary' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#111827] pt-2 border-t border-stone-200">
                    <span>Total</span>
                    <span className="tabular-nums">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/cart"
                    onClick={closeCart}
                    className="py-3 px-4 border border-stone-300 bg-white text-center text-xs font-semibold uppercase tracking-wider text-[#111827] hover:border-[#111827] transition-colors"
                  >
                    View Bag
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeCart();
                      navigate('/checkout');
                    }}
                    className="py-3 px-4 bg-[#E85D2A] hover:bg-[#D14D1C] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    Checkout
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
