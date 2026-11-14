import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Loader2,
  Lock,
  ShoppingBag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SneakerImage } from '../components/SneakerImage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { createOrder } from '../services/orderService';
import { Order } from '../types';
import { formatPrice } from '../utils/format';

export function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(
    (user?.user_metadata?.full_name as string) || ''
  );
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod] = useState<'Cash on Delivery'>('Cash on Delivery');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
    if (user?.user_metadata?.full_name && !fullName) {
      setFullName(String(user.user_metadata.full_name));
    }
  }, [user, email, fullName]);

  if (confirmedOrder) {
    return (
      <div className="bg-[#F8F7F4] min-h-screen py-14 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-stone-200 p-8 sm:p-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                Order Confirmed
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#111827] mt-1">
                Thank you, {confirmedOrder.customer_name}.
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Your Cash on Delivery order has been saved and queued for atelier inspection.
              </p>
            </div>
          </div>

          <div className="bg-[#F8F7F4] border border-stone-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-stone-500 block">Order Reference</span>
              <span className="font-mono font-semibold text-[#111827] break-all">
                {confirmedOrder.id}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Payment Method</span>
              <span className="font-semibold text-[#111827]">{confirmedOrder.payment_method}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Status</span>
              <span className="font-semibold text-[#E85D2A]">{confirmedOrder.status}</span>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
              Ordered Sneakers
            </h2>
            <ul className="divide-y divide-stone-200 border border-stone-200">
              {confirmedOrder.order_items.map((item, idx) => (
                <li
                  key={`${item.product_id}-${item.size}-${idx}`}
                  className="p-4 flex items-center justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-[#111827]">{item.name}</p>
                    <p className="text-xs text-stone-500">
                      Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-[#111827] tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stone-200">
            <div className="text-xs text-stone-600">
              Delivering to: <span className="font-medium text-[#111827]">{confirmedOrder.delivery_address}, {confirmedOrder.city}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-500 block">Total Due on Delivery</span>
              <span className="font-display text-2xl font-bold text-[#111827] tabular-nums">
                {formatPrice(confirmedOrder.total_amount)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/shop"
              className="px-6 py-3 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Continue Shopping
            </Link>
            {user && (
              <Link
                to="/account"
                className="px-6 py-3 border border-stone-300 text-xs font-semibold uppercase tracking-wider text-[#111827] hover:border-[#111827]"
              >
                View Order History
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#F8F7F4] min-h-[70vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white border border-stone-200 p-10 text-center space-y-4">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
          <h1 className="font-display text-2xl font-bold text-[#111827]">
            Your bag is empty
          </h1>
          <p className="text-sm text-stone-500">
            Add sneakers to your bag before proceeding to Cash on Delivery checkout.
          </p>
          <Link
            to="/shop"
            className="inline-block px-7 py-3 bg-[#111827] text-white text-xs font-semibold uppercase tracking-wider"
          >
            Shop Sneakers
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !deliveryAddress.trim() ||
      !city.trim()
    ) {
      setSubmitError('Please fill in all required customer delivery fields.');
      return;
    }

    if (!isSupabaseConfigured) {
      setSubmitError(
        'Cannot place order: Supabase backend is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment variables and run supabase/schema.sql.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const created = await createOrder({
        user_id: user?.id ?? null,
        customer_name: fullName,
        email,
        phone,
        delivery_address: deliveryAddress,
        city,
        order_items: items.map((item) => ({
          product_id: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          image_url: item.product.image_url,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.product.sale_price ?? item.product.price,
        })),
        total_amount: total,
        payment_method: paymentMethod,
      });

      clearCart();
      setConfirmedOrder(created);
      showToast({
        type: 'success',
        title: 'Order Placed Successfully',
        description: `Order #${created.id.slice(0, 8)} saved to Supabase.`,
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to submit your order. Please try again.';
      setSubmitError(msg);
      showToast({
        type: 'error',
        title: 'Order Failed',
        description: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F7F4] min-h-screen py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E85D2A] mb-1">
              Express Checkout
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#111827]">
              Shipping &amp; Cash on Delivery
            </h1>
          </div>
          {!user && (
            <p className="text-xs text-stone-600">
              Checking out as Guest ·{' '}
              <Link to="/account" className="font-semibold text-[#E85D2A] hover:underline">
                Sign in
              </Link>{' '}
              to save order to your history
            </p>
          )}
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 text-amber-900 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-700" />
            <div>
              <p className="font-semibold">Supabase Connection Required for Live Orders</p>
              <p className="text-xs mt-0.5">
                Configure <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
                <code className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> in{' '}
                <code className="font-mono">.env</code> to insert real orders into the{' '}
                <code className="font-mono">orders</code> table.
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Customer Details Form */}
          <div className="lg:col-span-7 bg-white border border-stone-200 p-6 sm:p-8 space-y-6">
            <h2 className="font-display text-lg font-bold text-[#111827] pb-3 border-b border-stone-200">
              1. Delivery Information
            </h2>

            {submitError && (
              <div
                role="alert"
                className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Full Name *
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full px-4 py-3 border border-stone-300 text-sm text-[#111827] focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Email Address *
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-3 border border-stone-300 text-sm text-[#111827] focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Phone Number *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-4 py-3 border border-stone-300 text-sm text-[#111827] focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-address"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Delivery Address *
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="742 Evergreen Terrace, Apt 4B"
                  className="w-full px-4 py-3 border border-stone-300 text-sm text-[#111827] focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-city"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  City *
                </label>
                <input
                  id="checkout-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Chicago"
                  className="w-full px-4 py-3 border border-stone-300 text-sm text-[#111827] focus:outline-none focus:border-[#111827]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 space-y-3">
              <h2 className="font-display text-lg font-bold text-[#111827]">
                2. Payment Method
              </h2>
              <div className="p-4 border-2 border-[#111827] bg-[#F8F7F4] flex items-start gap-3">
                <Banknote className="w-5 h-5 text-[#E85D2A] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#111827]">Cash on Delivery</p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Pay in cash directly to our courier when your double-boxed SOLEVERSE order arrives at your doorstep.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Review */}
          <aside className="lg:col-span-5 bg-white border border-stone-200 p-6 sm:p-8 space-y-5">
            <h2 className="font-display text-lg font-bold text-[#111827] pb-3 border-b border-stone-200">
              Order Review ({items.reduce((s, i) => s + i.quantity, 0)} pairs)
            </h2>

            <ul className="divide-y divide-stone-200 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => {
                const unit = item.product.sale_price ?? item.product.price;
                return (
                  <li
                    key={`${item.product.id}-${item.size}-${item.color}`}
                    className="py-3.5 flex items-center gap-3.5"
                  >
                    <div className="w-16 h-14 bg-[#F4F2EE] shrink-0 overflow-hidden">
                      <SneakerImage
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111827] truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        Size: {item.size} · {item.color} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#111827] tabular-nums">
                      {formatPrice(unit * item.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-2 text-sm pt-3 border-t border-stone-200">
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
              <div className="flex justify-between text-lg font-bold text-[#111827] pt-3 border-t border-stone-200">
                <span>Total (COD)</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 bg-[#E85D2A] hover:bg-[#D14D1C] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Order...
                </>
              ) : (
                <>
                  Place Order
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" />
              Orders are persisted directly to Supabase PostgreSQL
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
