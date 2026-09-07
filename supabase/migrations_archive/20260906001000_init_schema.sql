-- ==========================================================
-- 20260906001000_init_schema.sql
-- Anjori Arts — Consolidated DDL Schema
-- Target Schema: `arts`
-- ==========================================================

-- 1. EXTENSIONS & SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE SCHEMA IF NOT EXISTS arts;

-- 2. CUSTOM ENUM TYPES
DO $$ BEGIN
  CREATE TYPE arts.user_role AS ENUM ('USER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE arts.artwork_availability AS ENUM ('available', 'reserved', 'sold', 'made_to_order');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE arts.order_status AS ENUM ('new', 'contacted', 'in_progress', 'quoted', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. CORE TAXONOMIES & CATALOG TABLES

-- 3.1 Categories
CREATE TABLE IF NOT EXISTS arts.categories (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  cover_image text,
  alt_text text DEFAULT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.2 Surfaces
CREATE TABLE IF NOT EXISTS arts.surfaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  display_order integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.3 Mediums
CREATE TABLE IF NOT EXISTS arts.mediums (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.4 Artworks
CREATE TABLE IF NOT EXISTS arts.artworks (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id text REFERENCES arts.categories(id) ON DELETE SET NULL,
  surface_id uuid REFERENCES arts.surfaces(id) ON DELETE SET NULL,
  price integer NOT NULL, -- in paise
  dimensions text,
  short_description text,
  description text,
  artist_note text,
  tags text[] DEFAULT '{}'::text[] NOT NULL,
  is_available boolean DEFAULT true NOT NULL,
  is_featured boolean DEFAULT false NOT NULL,
  images jsonb DEFAULT '[]'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.5 Artwork Mediums (Junction)
CREATE TABLE IF NOT EXISTS arts.artwork_mediums (
  artwork_id text REFERENCES arts.artworks(id) ON DELETE CASCADE,
  medium_id text REFERENCES arts.mediums(id) ON DELETE CASCADE,
  PRIMARY KEY (artwork_id, medium_id)
);

-- 3.6 Artwork Variants
CREATE TABLE IF NOT EXISTS arts.artwork_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id text REFERENCES arts.artworks(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  width_inches numeric(5,2) NOT NULL,
  height_inches numeric(5,2) NOT NULL,
  mrp integer NOT NULL, -- in paise
  selling_price integer NOT NULL, -- in paise
  stock_quantity integer DEFAULT 1 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  can_be_framed boolean DEFAULT false NOT NULL,
  framing_price integer DEFAULT 0 NOT NULL, -- in paise
  sku text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CRM, INQUIRIES & CUSTOM ORDERS

-- 4.1 Inquiries
CREATE TABLE IF NOT EXISTS arts.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_reference text UNIQUE NOT NULL,
  status text DEFAULT 'new' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  country_code text DEFAULT '+91' NOT NULL,
  phone text,
  category text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL
);

-- 4.2 Custom Orders
CREATE TABLE IF NOT EXISTS arts.custom_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference text UNIQUE NOT NULL,
  status text DEFAULT 'new' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  country_code text DEFAULT '+91' NOT NULL,
  phone text,
  category text NOT NULL,
  medium text,
  surface text,
  preferred_size text,
  budget text,
  reference_link text,
  reference_images text[] DEFAULT '{}'::text[] NOT NULL,
  message text NOT NULL,
  -- Agreed Commission Specs
  final_category text,
  final_medium text,
  final_surface text,
  final_size text,
  final_budget text,
  -- Itemized Quotation
  items jsonb DEFAULT '[]'::jsonb NOT NULL,
  quote_total numeric DEFAULT 0 NOT NULL,
  deposit_percentage numeric DEFAULT 50 NOT NULL,
  advance_deposit numeric DEFAULT 0 NOT NULL,
  estimated_timeline text,
  admin_notes text
);

-- 5. BLOG POSTS
CREATE TABLE IF NOT EXISTS arts.blog_posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  cover_image text NOT NULL,
  author text NOT NULL,
  tags text[] DEFAULT '{}'::text[] NOT NULL,
  is_published boolean DEFAULT false NOT NULL,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. USER PROFILES & ROLES
CREATE TABLE IF NOT EXISTS arts.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role arts.user_role DEFAULT 'USER'::arts.user_role NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_artworks_category ON arts.artworks(category_id);
CREATE INDEX IF NOT EXISTS idx_artworks_surface ON arts.artworks(surface_id);
CREATE INDEX IF NOT EXISTS idx_artworks_slug ON arts.artworks(slug);
CREATE INDEX IF NOT EXISTS idx_artwork_variants_artwork ON arts.artwork_variants(artwork_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_reference ON arts.inquiries(inquiry_reference);
CREATE INDEX IF NOT EXISTS idx_custom_orders_reference ON arts.custom_orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON arts.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON arts.blog_posts(published_at);

-- 8. FUNCTIONS & TRIGGERS

-- 8.1 Automated Profile Creation on User Signup
CREATE OR REPLACE FUNCTION arts.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = arts, public
AS $$
BEGIN
  INSERT INTO arts.profiles (id, role)
  VALUES (NEW.id, 'USER')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION arts.handle_new_user();

-- 8.2 Admin Role Verification Helper (for RLS)
CREATE OR REPLACE FUNCTION arts.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM arts.profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

GRANT EXECUTE ON FUNCTION arts.is_admin() TO authenticated, service_role;

-- 9. SCHEMA PERMISSIONS & GRANTS
GRANT USAGE ON SCHEMA arts TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA arts TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA arts TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA arts TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS across all tables
ALTER TABLE arts.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.surfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.mediums ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.artwork_mediums ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.artwork_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.profiles ENABLE ROW LEVEL SECURITY;

-- Public Select Policies
CREATE POLICY "Public read access for categories" ON arts.categories FOR SELECT USING (true);
CREATE POLICY "Public read access for active surfaces" ON arts.surfaces FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for mediums" ON arts.mediums FOR SELECT USING (true);
CREATE POLICY "Public read access for artworks" ON arts.artworks FOR SELECT USING (true);
CREATE POLICY "Public read access for artwork mediums" ON arts.artwork_mediums FOR SELECT USING (true);
CREATE POLICY "Public read access for artwork variants" ON arts.artwork_variants FOR SELECT USING (true);
CREATE POLICY "Public read access for blog posts" ON arts.blog_posts FOR SELECT USING (true);

-- Public Insert Policies (Forms)
CREATE POLICY "Public can insert inquiries" ON arts.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert custom orders" ON arts.custom_orders FOR INSERT WITH CHECK (true);

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
  ON arts.profiles FOR SELECT 
  USING ( auth.uid() = id );

CREATE POLICY "Admins can view all profiles" 
  ON arts.profiles FOR SELECT 
  USING ( arts.is_admin() );

-- Hardened Admin Management Policies
CREATE POLICY "Admins can manage surfaces" 
  ON arts.surfaces FOR ALL 
  USING ( arts.is_admin() ) 
  WITH CHECK ( arts.is_admin() );

CREATE POLICY "Admins can view inquiries" 
  ON arts.inquiries FOR SELECT 
  USING ( arts.is_admin() );

CREATE POLICY "Admins can update inquiries" 
  ON arts.inquiries FOR UPDATE 
  USING ( arts.is_admin() ) 
  WITH CHECK ( arts.is_admin() );

CREATE POLICY "Admins can view custom orders" 
  ON arts.custom_orders FOR SELECT 
  USING ( arts.is_admin() );

CREATE POLICY "Admins can update custom orders" 
  ON arts.custom_orders FOR UPDATE 
  USING ( arts.is_admin() ) 
  WITH CHECK ( arts.is_admin() );

-- 11. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

