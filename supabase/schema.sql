-- ==============================================================================
-- SOLEVERSE — Supabase PostgreSQL Schema, Indexes, RLS Policies & Storage Setup
-- ==============================================================================
-- Run this entire script inside your Supabase Dashboard -> SQL Editor.
-- Architecture: Strictly uses 2 application tables (`products` and `orders`)
-- plus Supabase Auth (`auth.users`) and Storage (`product-images`).
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. TABLE: products
-- ==============================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  brand text not null check (char_length(trim(brand)) > 0),
  category text not null check (
    category in (
      'Running',
      'Lifestyle',
      'Basketball',
      'Training',
      'Streetwear',
      'Casual',
      'Premium',
      'Limited Edition'
    )
  ),
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  sale_price numeric(10, 2) null check (sale_price is null or (sale_price >= 0 and sale_price < price)),
  image_url text not null,
  images jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '["US 7","US 8","US 9","US 10","US 11","US 12"]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  badge text null,
  rating numeric(2, 1) not null default 4.8 check (rating >= 0 and rating <= 5),
  created_at timestamptz not null default now()
);

-- Indexes for fast filtering, sorting, and search
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_brand on public.products (brand);
create index if not exists idx_products_price on public.products (price);
create index if not exists idx_products_created_at on public.products (created_at desc);
create index if not exists idx_products_badge on public.products (badge);

-- ==============================================================================
-- 2. TABLE: orders
-- ==============================================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  customer_name text not null check (char_length(trim(customer_name)) > 0),
  email text not null check (char_length(trim(email)) > 0),
  phone text not null check (char_length(trim(phone)) > 0),
  delivery_address text not null check (char_length(trim(delivery_address)) > 0),
  city text not null check (char_length(trim(city)) > 0),
  order_items jsonb not null check (jsonb_typeof(order_items) = 'array' and jsonb_array_length(order_items) > 0),
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  payment_method text not null default 'Cash on Delivery' check (payment_method in ('Cash on Delivery')),
  status text not null default 'Pending' check (
    status in ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')
  ),
  created_at timestamptz not null default now()
);

-- Indexes for user order history and admin order management
create index if not exists idx_orders_user_id on public.orders (user_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

-- ==============================================================================
-- 3. ADMIN AUTHORIZATION HELPER
-- ==============================================================================
-- Checks `app_metadata.role = 'admin'` inside the signed Supabase JWT.
-- Set an admin user via Supabase Dashboard -> Authentication -> Users ->
-- Raw App Meta Data (or SQL):
--   update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
--   where email = 'admin@soleverse.com';
-- ==============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Drop existing policies if re-running script
drop policy if exists "Public can read products" on public.products;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;

drop policy if exists "Customers can create own or guest COD orders" on public.orders;
drop policy if exists "Users can read own orders and admins read all" on public.orders;
drop policy if exists "Admins can update order status" on public.orders;

-- PRODUCTS POLICIES
create policy "Public can read products"
  on public.products
  for select
  using (true);

create policy "Admins can insert products"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

-- ORDERS POLICIES
-- Authenticated users can insert orders linked to their own auth.uid().
-- Unauthenticated guests can place Cash on Delivery orders with user_id IS NULL.
create policy "Customers can create own or guest COD orders"
  on public.orders
  for insert
  with check (
    (auth.uid() is not null and user_id = auth.uid())
    or
    (auth.uid() is null and user_id is null)
  );

-- Authenticated users can only read their own orders; admins can read all orders.
create policy "Users can read own orders and admins read all"
  on public.orders
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin()
  );

-- Only admins can update orders (e.g., status transitions).
create policy "Admins can update order status"
  on public.orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ==============================================================================
-- 5. SUPABASE STORAGE BUCKET: product-images
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;

create policy "Public can view product images"
  on storage.objects
  for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can update product images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
