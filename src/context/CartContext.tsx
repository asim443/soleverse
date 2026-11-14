import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Product } from '../types';
import { calculateShipping } from '../utils/format';

const CART_STORAGE_KEY = 'soleverse_cart_v1';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  addToCart: (product: Product, size: string, color?: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  updateSize: (productId: string, oldSize: string, newSize: string, color: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write failure
    }
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const openQuickView = useCallback((product: Product) => setQuickViewProduct(product), []);
  const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

  const addToCart = useCallback(
    (product: Product, size: string, color?: string, quantity = 1) => {
      const selectedColor = color || product.colors[0]?.name || 'Standard';
      const qtyToAdd = Math.max(1, quantity);

      setItems((prev) => {
        const idx = prev.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.size === size &&
            item.color === selectedColor
        );
        if (idx > -1) {
          const updated = [...prev];
          const maxAllowed = product.stock > 0 ? product.stock : 99;
          updated[idx] = {
            ...updated[idx],
            quantity: Math.min(updated[idx].quantity + qtyToAdd, maxAllowed),
          };
          return updated;
        }
        return [...prev, { product, size, color: selectedColor, quantity: qtyToAdd }];
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string, size: string, color: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.size === size && item.color === color)
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, color: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId, size, color);
        return;
      }
      setItems((prev) =>
        prev.map((item) => {
          if (
            item.product.id === productId &&
            item.size === size &&
            item.color === color
          ) {
            const maxAllowed = item.product.stock > 0 ? item.product.stock : 99;
            return { ...item, quantity: Math.min(quantity, maxAllowed) };
          }
          return item;
        })
      );
    },
    [removeFromCart]
  );

  const updateSize = useCallback(
    (productId: string, oldSize: string, newSize: string, color: string) => {
      if (oldSize === newSize) return;
      setItems((prev) => {
        const target = prev.find(
          (i) => i.product.id === productId && i.size === oldSize && i.color === color
        );
        if (!target) return prev;

        const existingNew = prev.find(
          (i) => i.product.id === productId && i.size === newSize && i.color === color
        );

        if (existingNew) {
          return prev
            .filter(
              (i) =>
                !(i.product.id === productId && i.size === oldSize && i.color === color)
            )
            .map((i) =>
              i.product.id === productId && i.size === newSize && i.color === color
                ? { ...i, quantity: i.quantity + target.quantity }
                : i
            );
        }

        return prev.map((i) =>
          i.product.id === productId && i.size === oldSize && i.color === color
            ? { ...i, size: newSize }
            : i
        );
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const unit = item.product.sale_price ?? item.product.price;
        return sum + unit * item.quantity;
      }, 0),
    [items]
  );

  const shipping = useMemo(() => calculateShipping(subtotal), [subtotal]);
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shipping,
        total,
        isCartOpen,
        openCart,
        closeCart,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSize,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
