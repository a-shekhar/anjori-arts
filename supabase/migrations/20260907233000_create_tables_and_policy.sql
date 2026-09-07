-- ==========================================================
-- 20260907233000_create_tables_and_policy.sql
-- Anjori Arts — Consolidated DDL Schema & Security Policies
-- Target Schema: `arts`
-- ==========================================================

-- ==========================================================
-- 1. EXTENSIONS & SCHEMA
-- ==========================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE SCHEMA IF NOT EXISTS arts;

-- ==========================================================
-- 2. CUSTOM ENUM TYPES
-- ==========================================================
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

-- ==========================================================
-- 3. CORE TAXONOMIES & CATALOG TABLES
-- ==========================================================

-- 3.1 Categories
CREATE TABLE IF NOT EXISTS arts.categories (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  cover_image text,
  alt_text text DEFAULT NULL,
  display_order integer DEFAULT 0 NOT NULL,
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
  display_order integer DEFAULT 0 NOT NULL,
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

-- ==========================================================
-- 4. CRM, INQUIRIES & CUSTOM COMMISSIONS
-- ==========================================================

-- 4.1 Inquiries
CREATE TABLE IF NOT EXISTS arts.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_reference text UNIQUE NOT NULL,
  status text DEFAULT 'new' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  country_code text DEFAULT '+91' NOT NULL,
  phone text,
  category text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  admin_notes text,
  CONSTRAINT chk_inquiries_status CHECK (
    status IN ('new', 'reviewed', 'in_progress', 'resolved', 'archived')
  )
);

-- 4.2 Custom Orders
CREATE TABLE IF NOT EXISTS arts.custom_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference text UNIQUE NOT NULL,
  status text DEFAULT 'new' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  country_code text DEFAULT '+91' NOT NULL,
  phone text,
  category text DEFAULT 'Not specified',
  medium text,
  surface text,
  preferred_size text,
  budget text,
  reference_link text,
  reference_images text[] DEFAULT '{}'::text[] NOT NULL,
  message text DEFAULT '',
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
  admin_notes text,
  CONSTRAINT chk_custom_orders_status CHECK (
    status IN (
      'new',
      'submitted',
      'reviewed',
      'quoted',
      'accepted',
      'in_progress',
      'completed',
      'cancelled'
    )
  )
);

-- ==========================================================
-- 5. CONTENT & COMMUNITY (BLOG POSTS & TESTIMONIALS)
-- ==========================================================

-- 5.1 Blog Posts
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

-- 5.2 Testimonials & Reviews
CREATE TABLE IF NOT EXISTS arts.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_location text,
  artwork_title text,
  category_id text REFERENCES arts.categories(id) ON DELETE SET NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  quote text NOT NULL,
  image_url text,
  image_alt text,
  is_approved boolean DEFAULT false NOT NULL,
  is_featured boolean DEFAULT false NOT NULL,
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 6. USER PROFILES & AUTH ROLES
-- ==========================================================
CREATE TABLE IF NOT EXISTS arts.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role arts.user_role DEFAULT 'USER'::arts.user_role NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 7. E-COMMERCE ORDERS & CHECKOUT
-- ==========================================================

-- 7.1 Orders
CREATE TABLE IF NOT EXISTS arts.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  country_code text DEFAULT '+91' NOT NULL,
  shipping_address jsonb NOT NULL,
  delivery_instructions text,
  subtotal integer NOT NULL, -- in paise
  delivery_charge integer DEFAULT 0 NOT NULL, -- in paise
  discount_amount integer DEFAULT 0 NOT NULL, -- in paise
  total_amount integer NOT NULL, -- in paise
  currency text DEFAULT 'INR' NOT NULL,
  payment_method text DEFAULT 'upi_qr' NOT NULL,
  payment_status text DEFAULT 'pending' NOT NULL,
  payment_reference text, -- UTR / bank reference / Razorpay payment ID
  receipt_url text, -- Cloudinary proof URL for manual transfer
  order_status text DEFAULT 'received' NOT NULL,
  courier_name text,
  tracking_number text,
  tracking_url text,
  estimated_delivery text,
  admin_notes text,
  gateway_order_id text,
  paid_at timestamp with time zone,
  cancellation_reason text,
  refund_reference text,
  refund_amount integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT chk_orders_order_status CHECK (
    order_status IN (
      'received',
      'confirmed',
      'framing_packing',
      'dispatched',
      'delivered',
      'cancelled'
    )
  ),
  CONSTRAINT chk_orders_payment_status CHECK (
    payment_status IN (
      'pending',
      'receipt_uploaded',
      'verified',
      'paid',
      'failed',
      'refunded'
    )
  ),
  CONSTRAINT chk_orders_payment_method CHECK (
    payment_method IN (
      'upi_qr',
      'bank_transfer',
      'pay_on_dispatch',
      'razorpay'
    )
  )
);

-- 7.2 Order Items
CREATE TABLE IF NOT EXISTS arts.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES arts.orders(id) ON DELETE CASCADE,
  artwork_id text REFERENCES arts.artworks(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES arts.artwork_variants(id) ON DELETE SET NULL,
  title text NOT NULL,
  image_url text,
  size text NOT NULL,
  is_framed boolean DEFAULT false NOT NULL,
  framing_price integer DEFAULT 0 NOT NULL, -- in paise
  unit_price integer NOT NULL, -- in paise
  quantity integer DEFAULT 1 NOT NULL,
  line_total integer NOT NULL, -- in paise
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 8. PERFORMANCE & FOREIGN KEY INDEXES
-- ==========================================================

-- 8.1 Artworks & Variants
CREATE INDEX IF NOT EXISTS idx_artworks_category ON arts.artworks(category_id);
CREATE INDEX IF NOT EXISTS idx_artworks_surface ON arts.artworks(surface_id);
CREATE INDEX IF NOT EXISTS idx_artworks_slug ON arts.artworks(slug);
CREATE INDEX IF NOT EXISTS idx_artwork_variants_artwork ON arts.artwork_variants(artwork_id);

-- 8.2 Inquiries & Custom Orders
CREATE INDEX IF NOT EXISTS idx_inquiries_reference ON arts.inquiries(inquiry_reference);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON arts.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON arts.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_orders_reference ON arts.custom_orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON arts.custom_orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_created_at ON arts.custom_orders(created_at DESC);

-- 8.3 Content (Blog & Testimonials)
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON arts.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON arts.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved_featured ON arts.testimonials(is_approved, is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_category ON arts.testimonials(category_id);

-- 8.4 Orders & Order Items
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON arts.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON arts.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON arts.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON arts.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON arts.orders(created_at DESC);

-- Unique Partial Index on orders.gateway_order_id to prevent Razorpay order duplicate collisions
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_gateway_order_id 
  ON arts.orders(gateway_order_id) 
  WHERE gateway_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON arts.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_artwork_id ON arts.order_items(artwork_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON arts.order_items(variant_id);

-- ==========================================================
-- 9. STORED PROCEDURES & FUNCTIONS
-- ==========================================================

-- 9.1 Automated Profile Creation on User Signup
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

-- 9.2 Admin Role Verification Helper (for RLS)
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

-- 9.3 Timestamp Auto-Updater Trigger Function
CREATE OR REPLACE FUNCTION arts.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- 9.4 Atomic Inventory Stock Decrement
CREATE OR REPLACE FUNCTION arts.decrement_variant_stock(
  p_variant_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE arts.artwork_variants
  SET stock_quantity = GREATEST(0, stock_quantity - p_quantity)
  WHERE id = p_variant_id AND stock_quantity > 0;
END;
$$;

-- ==========================================================
-- 10. DATABASE TRIGGERS
-- ==========================================================

-- 10.1 Auth User Signup Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION arts.handle_new_user();

-- 10.2 Updated_At Automation Triggers
DROP TRIGGER IF EXISTS set_updated_at ON arts.artworks;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.artworks
  FOR EACH ROW EXECUTE FUNCTION arts.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON arts.custom_orders;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.custom_orders
  FOR EACH ROW EXECUTE FUNCTION arts.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON arts.orders;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.orders
  FOR EACH ROW EXECUTE FUNCTION arts.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON arts.inquiries;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.inquiries
  FOR EACH ROW EXECUTE FUNCTION arts.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON arts.testimonials;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.testimonials
  FOR EACH ROW EXECUTE FUNCTION arts.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON arts.blog_posts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.blog_posts
  FOR EACH ROW EXECUTE FUNCTION arts.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON arts.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.profiles
  FOR EACH ROW EXECUTE FUNCTION arts.handle_updated_at();

-- ==========================================================
-- 11. LEAST-PRIVILEGE GRANTS & PERMISSIONS (Defense-in-Depth)
-- ==========================================================

-- Revoke blanket privileges
REVOKE ALL ON ALL TABLES IN SCHEMA arts FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA arts FROM authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts 
  REVOKE ALL ON TABLES FROM anon, authenticated;

-- Ensure schema usage
GRANT USAGE ON SCHEMA arts TO anon, authenticated, service_role;

-- 11.1 Anon (Unauthenticated Guests)
GRANT SELECT ON arts.categories TO anon;
GRANT SELECT ON arts.surfaces TO anon;
GRANT SELECT ON arts.mediums TO anon;
GRANT SELECT ON arts.artworks TO anon;
GRANT SELECT ON arts.artwork_mediums TO anon;
GRANT SELECT ON arts.artwork_variants TO anon;
GRANT SELECT ON arts.blog_posts TO anon;
GRANT SELECT ON arts.testimonials TO anon;
GRANT INSERT ON arts.inquiries TO anon;
GRANT INSERT ON arts.custom_orders TO anon;

-- 11.2 Authenticated (Logged-In Users)
GRANT SELECT ON arts.categories TO authenticated;
GRANT SELECT ON arts.surfaces TO authenticated;
GRANT SELECT ON arts.mediums TO authenticated;
GRANT SELECT ON arts.artworks TO authenticated;
GRANT SELECT ON arts.artwork_mediums TO authenticated;
GRANT SELECT ON arts.artwork_variants TO authenticated;
GRANT SELECT ON arts.blog_posts TO authenticated;
GRANT SELECT ON arts.testimonials TO authenticated;
GRANT INSERT ON arts.inquiries TO authenticated;
GRANT INSERT ON arts.custom_orders TO authenticated;
GRANT SELECT, INSERT ON arts.orders TO authenticated;
GRANT SELECT, INSERT ON arts.order_items TO authenticated;
GRANT SELECT, UPDATE ON arts.profiles TO authenticated;

-- 11.3 Service Role (Full Backend / Admin Access)
GRANT ALL ON ALL TABLES IN SCHEMA arts TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA arts TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA arts TO service_role;

-- 11.4 Sequences & Routines
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA arts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION arts.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION arts.decrement_variant_stock(uuid, integer) TO authenticated, service_role;

-- ==========================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

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
ALTER TABLE arts.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.order_items ENABLE ROW LEVEL SECURITY;

-- 12.1 Public Read Catalog & Content
CREATE POLICY "Public read access for categories" ON arts.categories FOR SELECT USING (true);
CREATE POLICY "Public read access for active surfaces" ON arts.surfaces FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for mediums" ON arts.mediums FOR SELECT USING (true);
CREATE POLICY "Public read access for artworks" ON arts.artworks FOR SELECT USING (true);
CREATE POLICY "Public read access for artwork mediums" ON arts.artwork_mediums FOR SELECT USING (true);
CREATE POLICY "Public read access for artwork variants" ON arts.artwork_variants FOR SELECT USING (true);
CREATE POLICY "Public read access for blog posts" ON arts.blog_posts FOR SELECT USING (true);
CREATE POLICY "Public read access for approved testimonials" ON arts.testimonials FOR SELECT USING (is_approved = true);

-- 12.2 Public Insert Policies (Forms & Submissions)
CREATE POLICY "Public can insert inquiries" ON arts.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert custom orders" ON arts.custom_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit testimonials" ON arts.testimonials FOR INSERT WITH CHECK (is_approved = false);
CREATE POLICY "Public can insert orders" ON arts.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert order items" ON arts.order_items FOR INSERT WITH CHECK (true);

-- 12.3 User Self-Scoping Policies
CREATE POLICY "Users can view own profile" 
  ON arts.profiles FOR SELECT 
  USING ( auth.uid() = id );

CREATE POLICY "Users can view own orders" 
  ON arts.orders FOR SELECT 
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can view own order items" 
  ON arts.order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM arts.orders 
      WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
  );

-- 12.4 Admin Management Policies
CREATE POLICY "Admins can view all profiles" 
  ON arts.profiles FOR SELECT 
  USING ( arts.is_admin() );

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

CREATE POLICY "Admins can view all testimonials" 
  ON arts.testimonials FOR SELECT 
  USING ( arts.is_admin() );

CREATE POLICY "Admins can update testimonials" 
  ON arts.testimonials FOR UPDATE 
  USING ( arts.is_admin() ) 
  WITH CHECK ( arts.is_admin() );

CREATE POLICY "Admins can delete testimonials" 
  ON arts.testimonials FOR DELETE 
  USING ( arts.is_admin() );

CREATE POLICY "Admins can manage orders" 
  ON arts.orders FOR ALL 
  USING ( arts.is_admin() ) 
  WITH CHECK ( arts.is_admin() );

CREATE POLICY "Admins can manage order items" 
  ON arts.order_items FOR ALL 
  USING ( arts.is_admin() ) 
  WITH CHECK ( arts.is_admin() );

-- ==========================================================
-- 13. RELOAD POSTGREST SCHEMA CACHE
-- ==========================================================
NOTIFY pgrst, 'reload schema';

