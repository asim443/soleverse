import { CATALOG_SEED_PRODUCTS } from '../data/catalogSeed';
import { isSupabaseConfigured, PRODUCT_IMAGES_BUCKET, requireSupabase, supabase } from '../lib/supabase';
import { Product, ProductColor, ProductInput } from '../types';

function normalizeProduct(row: Record<string, unknown>): Product {
  const rawSizes = Array.isArray(row.sizes) ? row.sizes.map(String) : ['US 8', 'US 9', 'US 10', 'US 11'];
  const rawImages = Array.isArray(row.images) ? row.images.map(String) : [];
  const rawColors: ProductColor[] = Array.isArray(row.colors)
    ? row.colors.map((c: unknown) => {
        if (typeof c === 'object' && c !== null && 'name' in c && 'hex' in c) {
          return { name: String((c as ProductColor).name), hex: String((c as ProductColor).hex) };
        }
        return { name: String(c), hex: '#111827' };
      })
    : [];

  return {
    id: String(row.id),
    name: String(row.name),
    brand: String(row.brand),
    category: row.category as Product['category'],
    description: String(row.description ?? ''),
    price: Number(row.price),
    sale_price: row.sale_price !== null && row.sale_price !== undefined ? Number(row.sale_price) : null,
    image_url: String(row.image_url),
    images: rawImages.length > 0 ? rawImages : [String(row.image_url)],
    sizes: rawSizes,
    colors: rawColors,
    stock: Number(row.stock ?? 0),
    badge: row.badge ? String(row.badge) : null,
    rating: Number(row.rating ?? 4.8),
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

export interface FetchProductsResult {
  products: Product[];
  source: 'supabase' | 'preview';
}

export async function fetchProducts(): Promise<FetchProductsResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { products: CATALOG_SEED_PRODUCTS, source: 'preview' };
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load products from Supabase: ${error.message}`);
  }

  const rows = (data ?? []).map((item) => normalizeProduct(item as Record<string, unknown>));
  return { products: rows, source: 'supabase' };
}

export async function fetchProductById(id: string): Promise<{ product: Product | null; source: 'supabase' | 'preview' }> {
  if (!isSupabaseConfigured || !supabase) {
    const found = CATALOG_SEED_PRODUCTS.find((p) => p.id === id) ?? null;
    return { product: found, source: 'preview' };
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load product details: ${error.message}`);
  }

  return {
    product: data ? normalizeProduct(data as Record<string, unknown>) : null,
    source: 'supabase',
  };
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const client = requireSupabase();
  const payload = {
    name: input.name.trim(),
    brand: input.brand.trim(),
    category: input.category,
    description: input.description.trim(),
    price: Number(input.price),
    sale_price: input.sale_price !== null && input.sale_price > 0 ? Number(input.sale_price) : null,
    image_url: input.image_url.trim(),
    images: input.images.length > 0 ? input.images : [input.image_url.trim()],
    sizes: input.sizes,
    colors: input.colors,
    stock: Number(input.stock),
    badge: input.badge?.trim() || null,
    rating: Number(input.rating),
  };

  const { data, error } = await client
    .from('products')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return normalizeProduct(data as Record<string, unknown>);
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('products')
    .update({
      ...input,
      sale_price:
        input.sale_price !== undefined
          ? input.sale_price !== null && input.sale_price > 0
            ? Number(input.sale_price)
            : null
          : undefined,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return normalizeProduct(data as Record<string, unknown>);
}

export async function deleteProduct(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('products').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  const client = requireSupabase();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .toLowerCase();
  const filePath = `sneakers/${Date.now()}-${safeName}.${ext}`;

  const { error: uploadError } = await client.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = client.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error('Could not resolve public URL for uploaded product image.');
  }

  return data.publicUrl;
}

export async function seedCatalogProducts(): Promise<Product[]> {
  const client = requireSupabase();
  const rows = CATALOG_SEED_PRODUCTS.map(({ created_at: _createdAt, ...rest }) => rest);

  const { data, error } = await client
    .from('products')
    .upsert(rows, { onConflict: 'id' })
    .select('*');

  if (error) {
    throw new Error(`Failed to seed catalog products: ${error.message}`);
  }

  return (data ?? []).map((item) => normalizeProduct(item as Record<string, unknown>));
}
