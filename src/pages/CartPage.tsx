import React from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SneakerImage } from '../components/SneakerImage';
import { useCart } from '../context/CartContext';
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '../utils/format';

export function CartPage() {
  const { items, itemCount, subtotal, shipping, total, updateQuantity, updateSize, removeFromCart } =
    useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="bg-[#F8F7F4] min-h-[70vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white border border-stone-200 p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-[#F4F2EE] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7 text-stone-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#111827]">
            Your cart is waiting for something great.
          </h1>
          <p className="text-sm text-stone-500">
            Browse our architectural runners, heritage court lows, and numbered vault editions.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-2 px-7 py-3.5 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            SHOP SNEAKERS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F7F4] min-h-screen py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E85D2A] mb-1">
            Shopping Bag
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#111827]">
            Your Bag <span className="text-stone-400 font-normal tabular-nums">({itemCount})</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 bg-white border border-stone-200 divide-y divide-stone-200">
            {items.map((item) => {
              const unitPrice = item.product.sale_price ?? item.product.price;
              return (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center"
                >
                  <Link
                    to={`/product/${item.product.id}`}
                    className="w-28 h-24 bg-[#F4F2EE] shrink-0 overflow-hidden"
                  >
                    <SneakerImage
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs uppercase tracking-wider text-stone-500">
                      {item.product.brand} · {item.product.category}
                    </p>
                    <Link
                      to={`/product/${item.product.id}`}
                      className="font-display text-lg font-bold text-[#111827] hover:text-[#E85D2A] block"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-stone-500">
                      Colorway: {item.color} · Unit: {formatPrice(unitPrice)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <select
                      aria-label={`Size for ${item.product.name}`}
                      value={item.size}
                      onChange={(e) =>
                        updateSize(item.product.id, item.size, e.target.value, item.color)
                      }
                      className="px-2.5 py-2 border border-stone-300 bg-white text-xs font-semibold text-[#111827]"
                    >
                      {item.product.sizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <div className="inline-flex items-center border border-stone-300">
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
                        className="w-9 h-9 flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm font-semibold tabular-nums">
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
                        className="w-9 h-9 flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-base font-bold text-[#111827] tabular-nums min-w-[72px] text-right">
                      {formatPrice(unitPrice * item.quantity)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                      aria-label={`Remove ${item.product.name}`}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <aside className="lg:col-span-4 bg-white border border-stone-200 p-6 space-y-5">
            <h2 className="font-display text-lg font-bold text-[#111827] pb-3 border-b border-stone-200">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-[#111827] tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery</span>
                <span className="font-semibold text-[#111827] tabular-nums">
                  {shipping === 0 ? 'Complimentary' : formatPrice(shipping)}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {subtotal >= FREE_SHIPPING_THRESHOLD
                  ? 'Qualified for complimentary courier delivery.'
                  : `Add ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.`}
              </p>
              <div className="flex justify-between text-base font-bold text-[#111827] pt-3 border-t border-stone-200">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 bg-[#E85D2A] hover:bg-[#D14D1C] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/shop"
              className="block w-full py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-[#111827]"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
