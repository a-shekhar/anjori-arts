-- 00_create_tables.sql
-- Unified Schema for Anjori Arts

CREATE SCHEMA IF NOT EXISTS arts;

-- ==========================================
-- 1. TAXONOMY & CONFIGURATION TABLES
-- ==========================================

CREATE TABLE arts.categories (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  cover_image text DEFAULT '' NOT NULL
);

CREATE TABLE arts.surfaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text NOT NULL,
  description text,
  display_order integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE arts.mediums (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text
);


-- ==========================================
-- 2. CORE E-COMMERCE TABLES
-- ==========================================

CREATE TABLE arts.artworks (
  -- Identifiers & Relations
  id text PRIMARY KEY,
  category_id text NOT NULL REFERENCES arts.categories(id) ON DELETE CASCADE,
  surface_id uuid REFERENCES arts.surfaces(id) ON DELETE SET NULL,
  
  -- Core Data
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  price integer NOT NULL, -- in paise
  
  -- Details
  short_description text,
  description text NOT NULL,
  artist_note text,
  dimensions text NOT NULL,
  tags text[] DEFAULT '{}'::text[] NOT NULL,
  images jsonb DEFAULT '[]'::jsonb NOT NULL,
  
  -- Status
  is_available boolean DEFAULT true NOT NULL,
  is_featured boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE arts.artwork_mediums (
  artwork_id text NOT NULL REFERENCES arts.artworks(id) ON DELETE CASCADE,
  medium_id text NOT NULL REFERENCES arts.mediums(id) ON DELETE CASCADE,
  PRIMARY KEY (artwork_id, medium_id)
);

CREATE TABLE arts.artwork_variants (
  id text PRIMARY KEY,
  artwork_id text NOT NULL REFERENCES arts.artworks(id) ON DELETE CASCADE,
  label text NOT NULL,
  width_inches numeric NOT NULL,
  height_inches numeric NOT NULL,
  mrp integer NOT NULL, -- in paise
  selling_price integer NOT NULL, -- in paise
  stock_quantity integer NOT NULL, -- -1 for infinite (made to order)
  is_active boolean DEFAULT true NOT NULL
);


-- ==========================================
-- 3. CONTENT & MARKETING TABLES
-- ==========================================

CREATE TABLE arts.blog_posts (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  author text NOT NULL,
  cover_image text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}'::text[] NOT NULL,
  published_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- 4. CRM & INQUIRIES
-- ==========================================

CREATE TABLE arts.inquiries (
  -- System Fields
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_reference text UNIQUE NOT NULL, -- e.g. INQ-XXXX
  status text DEFAULT 'new' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Customer Info
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  country_code text DEFAULT '+91' NOT NULL,
  phone text,
  
  -- Request Details
  category text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL
);

CREATE TABLE arts.custom_orders (
  -- System Fields
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference text UNIQUE NOT NULL, -- e.g. CUS-XXXX
  status text DEFAULT 'new' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Customer Info
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  country_code text DEFAULT '+91' NOT NULL,
  phone text,
  
  -- Artwork Specs (From Customer)
  category text NOT NULL,
  medium text,
  surface text,
  preferred_size text,
  budget text,
  reference_link text,
  reference_images text[] DEFAULT '{}'::text[] NOT NULL,
  message text NOT NULL
);


-- ==========================================
-- 5. GRANTS & RLS POLICIES
-- ==========================================

-- Grants
GRANT USAGE ON SCHEMA arts TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA arts TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA arts TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA arts TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Enable RLS
ALTER TABLE arts.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.surfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.mediums ENABLE ROW LEVEL SECURITY;

ALTER TABLE arts.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.artwork_mediums ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.artwork_variants ENABLE ROW LEVEL SECURITY;

ALTER TABLE arts.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.custom_orders ENABLE ROW LEVEL SECURITY;

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

-- Admin ALL Policies (Using authenticated role for now)
CREATE POLICY "Admins can manage surfaces" ON arts.surfaces FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can view inquiries" ON arts.inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update inquiries" ON arts.inquiries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can view custom orders" ON arts.custom_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update custom orders" ON arts.custom_orders FOR UPDATE USING (auth.role() = 'authenticated');
