import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Database,
  DollarSign,
  Edit3,
  Loader2,
  Package,
  Plus,
  ShieldAlert,
  ShoppingCart,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SneakerImage } from '../components/SneakerImage';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useToast } from '../context/ToastContext';
import { fetchAdminOrders, updateOrderStatus } from '../services/orderService';
import {
  createProduct,
  deleteProduct,
  seedCatalogProducts,
  updateProduct,
  uploadProductImage,
} from '../services/productService';
import { Order, OrderStatus, Product, ProductCategory, ProductInput } from '../types';
import { formatOrderDate, formatPrice } from '../utils/format';

type AdminTab = 'overview' | 'products' | 'orders';

const CATEGORIES: ProductCategory[] = [
  'Running',
  'Lifestyle',
  'Basketball',
  'Training',
  'Streetwear',
  'Casual',
  'Premium',
  'Limited Edition',
];

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const EMPTY_FORM: ProductInput = {
  name: '',
  brand: 'SOLEVERSE ATELIER',
  category: 'Running',
  description: '',
  price: 180,
  sale_price: null,
  image_url: 'asset:chalk_high',
  images: ['asset:chalk_high'],
  sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
  colors: [{ name: 'Chalk White', hex: '#F2EFE9' }],
  stock: 20,
  badge: 'NEW DROP',
  rating: 4.9,
};

export function AdminPage() {
  const { user, isAdmin, loading: authLoading, isConfigured } = useAuth();
  const { products, refreshProducts } = useProducts();
  const { showToast } = useToast();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [productSearch, setProductSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [sizesInput, setSizesInput] = useState('US 7, US 8, US 9, US 10, US 11, US 12');
  const [colorNameInput, setColorNameInput] = useState('Chalk White');
  const [colorHexInput, setColorHexInput] = useState('#F2EFE9');
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!isConfigured || !isAdmin) return;
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await fetchAdminOrders();
      setOrders(data);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : 'Unable to fetch orders.');
    } finally {
      setOrdersLoading(false);
    }
  }, [isConfigured, isAdmin]);

  useEffect(() => {
    if (isAdmin && isConfigured) {
      void loadOrders();
    }
  }, [isAdmin, isConfigured, loadOrders]);

  const metrics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    const revenue = validOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const pendingCount = orders.filter((o) => o.status === 'Pending').length;
    const lowStockCount = products.filter((p) => p.stock <= 5).length;
    return {
      revenue,
      orderCount: orders.length,
      pendingCount,
      lowStockCount,
    };
  }, [orders, products]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSizesInput(EMPTY_FORM.sizes.join(', '));
    setColorNameInput(EMPTY_FORM.colors[0].name);
    setColorHexInput(EMPTY_FORM.colors[0].hex);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      price: product.price,
      sale_price: product.sale_price,
      image_url: product.image_url,
      images: product.images,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,
      badge: product.badge,
      rating: product.rating,
    });
    setSizesInput(product.sizes.join(', '));
    setColorNameInput(product.colors[0]?.name || 'Standard');
    setColorHexInput(product.colors[0]?.hex || '#111827');
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setForm((prev) => ({
        ...prev,
        image_url: url,
        images: [url, ...prev.images.filter((i) => i !== url)],
      }));
      showToast({
        type: 'success',
        title: 'Image Uploaded',
        description: 'Stored in Supabase Storage (product-images).',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Upload Failed',
        description: err instanceof Error ? err.message : 'Unable to upload image.',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const parsedSizes = sizesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload: ProductInput = {
        ...form,
        sizes: parsedSizes.length > 0 ? parsedSizes : ['US 8', 'US 9', 'US 10'],
        colors: [{ name: colorNameInput.trim() || 'Standard', hex: colorHexInput || '#111827' }],
        images: [form.image_url],
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        showToast({ type: 'success', title: 'Sneaker Updated', description: payload.name });
      } else {
        await createProduct(payload);
        showToast({ type: 'success', title: 'Sneaker Created', description: payload.name });
      }
      setModalOpen(false);
      await refreshProducts();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Database operation failed.',
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}" from Supabase?`)) return;
    try {
      await deleteProduct(product.id);
      showToast({ type: 'success', title: 'Sneaker Deleted', description: product.name });
      await refreshProducts();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        description: err instanceof Error ? err.message : 'Unable to delete product.',
      });
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast({
        type: 'success',
        title: 'Order Status Updated',
        description: `#${orderId.slice(0, 8)} → ${status}`,
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Unable to update order status.',
      });
    }
  };

  const handleSeedCatalog = async () => {
    setSeeding(true);
    try {
      await seedCatalogProducts();
      await refreshProducts();
      showToast({
        type: 'success',
        title: '18 Catalog Sneakers Seeded',
        description: 'All 18 silhouettes are now live in Supabase products.',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Seeding Failed',
        description: err instanceof Error ? err.message : 'Could not seed catalog.',
      });
    } finally {
      setSeeding(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-stone-500" />
      </div>
    );
  }

  if (!isConfigured || !user || !isAdmin) {
    return (
      <div className="bg-[#F8F7F4] min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full bg-white border border-stone-200 p-8 sm:p-10 space-y-5">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-[#E85D2A]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#111827]">
            Protected Admin Dashboard
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            {!isConfigured
              ? 'Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment variables and run supabase/schema.sql.'
              : !user
                ? 'Please sign in with an authorized SOLEVERSE administrator account to manage inventory and orders.'
                : `Signed in as ${user.email}, which does not carry the admin role in Supabase app_metadata.`}
          </p>

          <div className="bg-[#F8F7F4] border border-stone-200 p-4 text-xs text-stone-700 space-y-1.5">
            <p className="font-semibold text-[#111827]">How to grant Admin access securely:</p>
            <p>Run in Supabase SQL Editor:</p>
            <pre className="p-2.5 bg-[#0C1016] text-stone-200 font-mono overflow-x-auto text-[11px]">
{`update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
where email = '${user?.email || 'your-admin@email.com'}';`}
            </pre>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/account"
              className="px-6 py-3 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              {user ? 'Switch Account' : 'Sign In'}
            </Link>
            <Link
              to="/"
              className="px-6 py-3 border border-stone-300 text-xs font-semibold uppercase tracking-wider text-[#111827]"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F7F4] min-h-screen py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E85D2A] mb-1">
              SOLEVERSE Operations
            </p>
            <h1 className="font-display text-3xl font-bold text-[#111827]">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSeedCatalog}
              disabled={seeding}
              className="px-4 py-2.5 border border-stone-300 bg-white hover:border-[#111827] text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5" />
              {seeding ? 'Seeding...' : 'Seed 18 Sneakers'}
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-[#E85D2A] hover:bg-[#D14D1C] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Sneaker
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'products', label: `Products (${products.length})` },
              { id: 'orders', label: `Orders (${orders.length})` },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                tab === item.id
                  ? 'border-[#E85D2A] text-[#111827]'
                  : 'border-transparent text-stone-500 hover:text-[#111827]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-stone-200 p-6">
                <div className="flex items-center justify-between text-stone-500 text-xs uppercase tracking-wider">
                  <span>Gross Revenue</span>
                  <DollarSign className="w-4 h-4 text-[#E85D2A]" />
                </div>
                <p className="font-display text-3xl font-bold text-[#111827] mt-2 tabular-nums">
                  {formatPrice(metrics.revenue)}
                </p>
              </div>
              <div className="bg-white border border-stone-200 p-6">
                <div className="flex items-center justify-between text-stone-500 text-xs uppercase tracking-wider">
                  <span>Total Orders</span>
                  <ShoppingCart className="w-4 h-4 text-[#111827]" />
                </div>
                <p className="font-display text-3xl font-bold text-[#111827] mt-2 tabular-nums">
                  {metrics.orderCount}
                </p>
              </div>
              <div className="bg-white border border-stone-200 p-6">
                <div className="flex items-center justify-between text-stone-500 text-xs uppercase tracking-wider">
                  <span>Pending COD</span>
                  <Package className="w-4 h-4 text-amber-600" />
                </div>
                <p className="font-display text-3xl font-bold text-[#111827] mt-2 tabular-nums">
                  {metrics.pendingCount}
                </p>
              </div>
              <div className="bg-white border border-stone-200 p-6">
                <div className="flex items-center justify-between text-stone-500 text-xs uppercase tracking-wider">
                  <span>Active Sneakers</span>
                  <AlertCircle className="w-4 h-4 text-stone-500" />
                </div>
                <p className="font-display text-3xl font-bold text-[#111827] mt-2 tabular-nums">
                  {products.length}
                </p>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-6">
              <h2 className="font-display text-lg font-bold text-[#111827] mb-4">
                Recent Orders
              </h2>
              {orders.length === 0 ? (
                <p className="text-sm text-stone-500">No customer orders recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                      <tr>
                        <th className="py-3 pr-4">Order</th>
                        <th className="py-3 pr-4">Customer</th>
                        <th className="py-3 pr-4">City</th>
                        <th className="py-3 pr-4">Total</th>
                        <th className="py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id}>
                          <td className="py-3 pr-4 font-mono text-xs">{o.id.slice(0, 8)}</td>
                          <td className="py-3 pr-4 font-medium">{o.customer_name}</td>
                          <td className="py-3 pr-4 text-stone-500">{o.city}</td>
                          <td className="py-3 pr-4 font-bold tabular-nums">
                            {formatPrice(o.total_amount)}
                          </td>
                          <td className="py-3 font-semibold text-[#E85D2A]">{o.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div className="bg-white border border-stone-200 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <input
                type="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Filter sneakers by name, brand, or category..."
                className="px-3.5 py-2 border border-stone-300 text-sm w-full sm:w-80 focus:outline-none focus:border-[#111827]"
              />
              <span className="text-xs text-stone-500 tabular-nums">
                {filteredProducts.length} sneakers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="py-3 pr-4">Sneaker</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Price</th>
                    <th className="py-3 pr-4">Stock</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-11 bg-[#F4F2EE] shrink-0 overflow-hidden">
                            <SneakerImage
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-[#111827]">{p.name}</p>
                            <p className="text-xs text-stone-500">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-stone-600">{p.category}</td>
                      <td className="py-3.5 pr-4 tabular-nums">
                        {p.sale_price ? (
                          <div>
                            <span className="font-bold text-[#E85D2A]">
                              {formatPrice(p.sale_price)}
                            </span>
                            <span className="text-xs text-stone-400 line-through ml-1.5">
                              {formatPrice(p.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold">{formatPrice(p.price)}</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 tabular-nums font-medium">{p.stock}</td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            aria-label={`Edit ${p.name}`}
                            className="p-2 border border-stone-200 hover:border-[#111827] text-stone-700 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            aria-label={`Delete ${p.name}`}
                            className="p-2 border border-stone-200 hover:border-red-600 text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {ordersError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
                {ordersError}
              </div>
            )}

            {ordersLoading ? (
              <div className="bg-white border border-stone-200 p-10 text-center text-sm text-stone-500">
                Loading orders from Supabase...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-stone-200 p-10 text-center text-sm text-stone-500">
                No customer orders found.
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white border border-stone-200 p-6 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                    <div className="space-y-1">
                      <p className="font-mono text-xs text-stone-500">
                        Order {order.id} · {formatOrderDate(order.created_at)}
                      </p>
                      <p className="font-display text-lg font-bold text-[#111827]">
                        {order.customer_name} ·{' '}
                        <span className="font-normal text-sm text-stone-600">{order.email}</span>
                      </p>
                      <p className="text-xs text-stone-600">
                        {order.phone} · {order.delivery_address}, {order.city} ·{' '}
                        <span className="font-semibold">{order.payment_method}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-display text-xl font-bold text-[#111827] tabular-nums">
                        {formatPrice(order.total_amount)}
                      </span>
                      <select
                        aria-label={`Status for order ${order.id}`}
                        value={order.status}
                        onChange={(e) =>
                          handleOrderStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className="px-3 py-2 border border-stone-300 bg-white text-xs font-semibold text-[#111827]"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.order_items.map((item, idx) => (
                      <div
                        key={`${item.product_id}-${idx}`}
                        className="p-3 bg-[#F8F7F4] border border-stone-200/80 text-xs"
                      >
                        <p className="font-semibold text-[#111827]">{item.name}</p>
                        <p className="text-stone-500">
                          Size: {item.size} · Color: {item.color} · Qty: {item.quantity} ·{' '}
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Product Create/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-stone-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="font-display text-xl font-bold text-[#111827]">
                {editingId ? 'Edit Sneaker' : 'Add New Sneaker'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 text-stone-500 hover:text-[#111827] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as ProductCategory })
                    }
                    className="w-full px-3 py-2 border border-stone-300 text-sm bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={form.badge ?? ''}
                    onChange={(e) => setForm({ ...form, badge: e.target.value || null })}
                    placeholder="NEW DROP / BEST SELLER / LIMITED VAULT"
                    className="w-full px-3 py-2 border border-stone-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Sale Price (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sale_price ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sale_price: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Rating (0 - 5)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Sizes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Primary Color
                    </label>
                    <input
                      type="text"
                      value={colorNameInput}
                      onChange={(e) => setColorNameInput(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Hex
                    </label>
                    <input
                      type="color"
                      value={colorHexInput}
                      onChange={(e) => setColorHexInput(e.target.value)}
                      className="w-full h-[38px] border border-stone-300 p-0.5 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Product Image URL or Upload to Supabase Storage
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="flex-1 px-3 py-2 border border-stone-300 text-sm"
                  />
                  <label className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-stone-300 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-6 py-2.5 bg-[#111827] hover:bg-[#E85D2A] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {savingProduct ? 'Saving...' : editingId ? 'Update Sneaker' : 'Create Sneaker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
