# SOLEVERSE — Architectural Sneakers & Footwear Atelier

A full-stack sneaker e-commerce storefront built with React, TypeScript, Tailwind CSS, React Router, and Supabase (PostgreSQL, Authentication, Row Level Security, and Storage).

## Features

- **Editorial Storefront**: Long-form multi-section homepage featuring Hero Editorial, House Footwear Divisions, Dual Campaign Split, 8 Numbered Categories, Trending Sneakers, New Arrivals, Best Sellers, Limited Edition Vault, Premium Running Division, Archive Sale Banner, Atelier Craftsmanship Story, Customer Reviews, and Client Concierge FAQ.
- **18 Unique Sneaker Silhouettes**: Each product has its own dedicated studio image, colorway swatches, size grid, stock tracking, and pricing.
- **Full Shop Catalog (`/shop`)**: Dynamic search, category, brand, price range, size, color, sale/new filters, sorting, and responsive mobile filter drawer.
- **Product Detail Page (`/product/:id`)**: High-res gallery, interactive size/color/quantity selection, Wishlist toggle, Buy Now, and Related Products.
- **Quick View & Slide-Over Bag**: Animated Quick View modal and slide-over Shopping Bag backed by `localStorage` persistence.
- **Real Cash on Delivery Checkout (`/checkout`)**: Inserts real orders into Supabase `orders` table with client-side validation and explicit database error handling.
- **Supabase Authentication & Order History (`/account`)**: Real Sign Up, Sign In, Password Reset, and authenticated user-scoped Order History.
- **Protected Admin Dashboard (`/admin`)**: Role-gated by Supabase `app_metadata.role = 'admin'` and PostgreSQL RLS policies, supporting Product CRUD, Supabase Storage image uploads (`product-images` bucket), 18-item catalog seeding, and Order status updates.

---

## 1. Local Installation

```bash
git clone <your-repo-url>
cd soleverse
npm install
```

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

---

## 2. Environment Variables

Open `.env` and fill in your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
```

### Where to find these values in Supabase:
1. Log in to [https://supabase.com/dashboard](https://supabase.com/dashboard) and open your project.
2. Navigate to **Project Settings → API** (or **API Keys**).
3. Copy **Project URL** into `VITE_SUPABASE_URL`.
4. Copy the **anon / publishable** key into `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. **Security Note**: Never place `service_role` or secret keys in `.env` or any frontend file.

---

## 3. Supabase Database, RLS & Storage Setup

1. Open your Supabase Dashboard → **SQL Editor**.
2. Copy the entire contents of `supabase/schema.sql` and run it. This creates:
   - `public.products` table + indexes + constraints
   - `public.orders` table + foreign key to `auth.users` + indexes
   - `public.is_admin()` helper reading `auth.jwt() -> 'app_metadata' ->> 'role'`
   - Row Level Security (RLS) policies for public product reads, admin-only product writes, owner/guest order creation, owner/admin order reads, and admin order updates
   - `product-images` public Storage bucket + RLS policies for admin uploads
3. *(Optional)* Run `supabase/seed.sql` in the SQL Editor to populate the 18 curated sneaker products immediately (or use the **Seed 18 Sneakers** button inside `/admin`).

---

## 4. Authentication & Admin Setup

1. In Supabase Dashboard → **Authentication → Providers**, ensure **Email** provider is enabled.
2. Under **Authentication → URL Configuration**, add your local URL (`http://localhost:3000`) and production Vercel URL to **Redirect URLs**.
3. Sign up for an account via `/account` in the app.
4. To promote your user to **Admin**, run the following in **Supabase SQL Editor**:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where email = 'your-admin@example.com';
```

Sign out and sign back in on `/account` to refresh your JWT with `app_metadata.role = 'admin'`, then navigate to `/admin`.

---

## 5. Local Development & Build

```bash
npm run dev
```

Runs on `http://localhost:3000`.

Verify TypeScript and production bundle:

```bash
npm run lint
npm run build
```

---

## 6. Deploying to GitHub & Vercel

1. Push the repository to GitHub (`.env` is gitignored via `.gitignore`).
2. Import the repository in [Vercel](https://vercel.com).
3. Framework Preset: **Vite** (`npm run build`, output directory `dist`).
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under **Project Settings → Environment Variables**.
5. Deploy! `vercel.json` is preconfigured to rewrite all React Router paths (`/shop`, `/product/:id`, `/checkout`, `/account`, `/admin`) cleanly to `index.html`.
