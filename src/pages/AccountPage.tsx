import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  LogOut,
  Package,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useToast } from '../context/ToastContext';
import { fetchUserOrders } from '../services/orderService';
import { Order } from '../types';
import { formatOrderDate, formatPrice } from '../utils/format';

type AuthMode = 'login' | 'signup' | 'forgot';

export function AccountPage() {
  const { user, loading: authLoading, isAdmin, isConfigured, signIn, signUp, signOut, resetPassword } =
    useAuth();
  const { products, wishlistIds } = useProducts();
  const { showToast } = useToast();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const wishlistedProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds]
  );

  useEffect(() => {
    if (!user || !isConfigured) {
      setOrders([]);
      return;
    }

    let active = true;
    setOrdersLoading(true);
    setOrdersError(null);

    fetchUserOrders(user.id)
      .then((data) => {
        if (!active) return;
        setOrders(data);
        setOrdersLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setOrdersError(err instanceof Error ? err.message : 'Unable to fetch order history.');
        setOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, isConfigured]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setAuthSubmitting(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        showToast({ type: 'success', title: 'Signed in to SOLEVERSE' });
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        const res = await signUp(email, password, fullName);
        if (res.needsEmailConfirmation) {
          setAuthMessage(
            'Account created! Check your inbox for the Supabase confirmation link before signing in.'
          );
        } else {
          showToast({ type: 'success', title: 'Welcome to SOLEVERSE' });
        }
      } else {
        await resetPassword(email);
        setAuthMessage('Password reset instructions sent to your email.');
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast({ type: 'info', title: 'Signed out' });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Sign out failed',
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <div className="bg-[#F8F7F4] min-h-screen py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
        {!user ? (
          <div className="max-w-md mx-auto bg-white border border-stone-200 p-8 space-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E85D2A] mb-1">
                Client Portal
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                {mode === 'login'
                  ? 'Sign In'
                  : mode === 'signup'
                    ? 'Create Account'
                    : 'Reset Password'}
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                Manage your SOLEVERSE orders and saved footwear rotation.
              </p>
            </div>

            {!isConfigured && (
              <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Supabase Auth requires <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
                  <code className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> in{' '}
                  <code className="font-mono">.env</code>.
                </span>
              </div>
            )}

            {authError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs">
                {authError}
              </div>
            )}
            {authMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {authMessage}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="auth-fullname"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="auth-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-[#111827]"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-[#111827]"
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-[#111827]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting || !isConfigured}
                className="w-full py-3 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                {authSubmitting
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Sign In'
                    : mode === 'signup'
                      ? 'Create Account'
                      : 'Send Reset Link'}
              </button>
            </form>

            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
              {mode === 'login' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setAuthError(null);
                      setAuthMessage(null);
                    }}
                    className="hover:text-[#E85D2A] font-medium cursor-pointer"
                  >
                    Need an account? Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setAuthError(null);
                      setAuthMessage(null);
                    }}
                    className="hover:text-[#111827] cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setAuthError(null);
                    setAuthMessage(null);
                  }}
                  className="hover:text-[#E85D2A] font-medium cursor-pointer"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Authenticated Profile Bar */}
            <div className="bg-white border border-stone-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#111827] text-white flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-500">
                    {isAdmin ? 'Administrator Account' : 'Verified Client'}
                  </p>
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-[#111827]">
                    {(user.user_metadata?.full_name as string) || user.email}
                  </h1>
                  <p className="text-xs text-stone-500">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2.5 bg-[#E85D2A] hover:bg-[#D14D1C] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Open Admin Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2.5 border border-stone-300 hover:border-[#111827] text-xs font-semibold uppercase tracking-wider text-[#111827] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Order History */}
            <section className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-[#111827]">
                Your Order History
              </h2>

              {ordersError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
                  {ordersError}
                </div>
              )}

              {ordersLoading ? (
                <div className="bg-white border border-stone-200 p-10 text-center text-sm text-stone-500">
                  Loading your orders from Supabase...
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white border border-stone-200 p-10 text-center space-y-3">
                  <Package className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="font-display text-lg font-semibold text-[#111827]">
                    You haven&apos;t placed any orders yet.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block px-6 py-2.5 bg-[#111827] text-white text-xs font-semibold uppercase tracking-wider"
                  >
                    Explore Sneakers
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-stone-200 p-6 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                        <div>
                          <p className="font-mono text-xs text-stone-500">
                            Order #{order.id.slice(0, 8).toUpperCase()} ·{' '}
                            {formatOrderDate(order.created_at)}
                          </p>
                          <p className="text-xs text-stone-600 mt-1">
                            Deliver to: {order.delivery_address}, {order.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-2.5 py-1 bg-[#F4F2EE] text-xs font-semibold text-[#111827]">
                            {order.status}
                          </span>
                          <span className="font-display text-lg font-bold text-[#111827] tabular-nums">
                            {formatPrice(order.total_amount)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {order.order_items.map((item, idx) => (
                          <div
                            key={`${item.product_id}-${idx}`}
                            className="p-3 bg-[#F8F7F4] border border-stone-200/80 text-xs"
                          >
                            <p className="font-semibold text-[#111827]">{item.name}</p>
                            <p className="text-stone-500 mt-0.5">
                              {item.size} · {item.color} · Qty {item.quantity} ·{' '}
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Saved Wishlist Section */}
        {wishlistedProducts.length > 0 && (
          <section className="space-y-5 pt-4">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold text-[#111827]">
                Saved Wishlist ({wishlistedProducts.length})
              </h2>
              <Link
                to="/shop"
                className="text-xs font-semibold uppercase tracking-wider text-[#E85D2A]"
              >
                Browse More
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
