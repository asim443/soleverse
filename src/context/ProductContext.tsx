import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchProducts } from '../services/productService';
import { Product } from '../types';

const WISHLIST_STORAGE_KEY = 'soleverse_wishlist_v1';

interface ProductContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  dataSource: 'supabase' | 'preview';
  refreshProducts: () => Promise<void>;
  wishlistIds: string[];
  toggleWishlist: (productId: string) => boolean;
  isWishlisted: (productId: string) => boolean;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'preview'>('preview');
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProducts();
      setProducts(result.products);
      setDataSource(result.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load sneaker catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [wishlistIds]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      let added = false;
      setWishlistIds((prev) => {
        if (prev.includes(productId)) {
          added = false;
          return prev.filter((id) => id !== productId);
        }
        added = true;
        return [...prev, productId];
      });
      return added;
    },
    []
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        dataSource,
        refreshProducts,
        wishlistIds,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts(): ProductContextValue {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return ctx;
}
