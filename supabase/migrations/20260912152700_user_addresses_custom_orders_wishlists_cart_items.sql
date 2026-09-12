-- ==========================================================
-- 20260912152700_user_addresses_custom_orders_wishlists_cart_items.sql
-- Anjori Arts — Consolidated User Account Features
-- Target Schema: `arts`
-- Consolidates:
--   1. 20260910000000_create_user_addresses.sql
--   2. 20260910001000_add_user_id_to_custom_orders.sql
--   3. 20260910002000_create_wishlists.sql
--   4. 20260911000000_create_cart_items.sql
--
-- NOTE:
-- This script is 100% idempotent and can be safely re-executed
-- multiple times without error.
-- ==========================================================


-- ==========================================================
-- 1. SAVED DELIVERY ADDRESSES (arts.user_addresses)
-- ==========================================================

CREATE TABLE IF NOT EXISTS arts.user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name text NOT NULL,
  phone text NOT NULL,
  street text NOT NULL,
  landmark text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  address_type text DEFAULT 'home' NOT NULL,
  is_default boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT chk_user_addresses_type CHECK (
    address_type IN ('home', 'work', 'other')
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON arts.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON arts.user_addresses(user_id, is_default);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at ON arts.user_addresses;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.user_addresses
  FOR EACH ROW EXECUTE FUNCTION arts.handle_updated_at();

-- Trigger Function: If an address is set as default, unset other defaults for the same user
CREATE OR REPLACE FUNCTION arts.handle_default_address()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = arts, public
AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE arts.user_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_single_default_address ON arts.user_addresses;
CREATE TRIGGER trg_ensure_single_default_address
  BEFORE INSERT OR UPDATE ON arts.user_addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION arts.handle_default_address();

-- Permissions & Grants
GRANT USAGE ON SCHEMA arts TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON arts.user_addresses TO authenticated;
GRANT ALL ON arts.user_addresses TO service_role;

-- Row Level Security (RLS)
ALTER TABLE arts.user_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own addresses" ON arts.user_addresses;
CREATE POLICY "Users can view own addresses"
  ON arts.user_addresses FOR SELECT
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can insert own addresses" ON arts.user_addresses;
CREATE POLICY "Users can insert own addresses"
  ON arts.user_addresses FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can update own addresses" ON arts.user_addresses;
CREATE POLICY "Users can update own addresses"
  ON arts.user_addresses FOR UPDATE
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can delete own addresses" ON arts.user_addresses;
CREATE POLICY "Users can delete own addresses"
  ON arts.user_addresses FOR DELETE
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Admins can manage all addresses" ON arts.user_addresses;
CREATE POLICY "Admins can manage all addresses"
  ON arts.user_addresses FOR ALL
  USING ( arts.is_admin() )
  WITH CHECK ( arts.is_admin() );


-- ==========================================================
-- 2. LINK CUSTOM ORDERS TO AUTHENTICATED USERS
-- ==========================================================

-- 1. Add user_id column
ALTER TABLE arts.custom_orders 
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Performance index
CREATE INDEX IF NOT EXISTS idx_custom_orders_user_id ON arts.custom_orders(user_id);

-- 3. Row Level Security Policy for User Self-Scoping
DROP POLICY IF EXISTS "Users can view own custom orders" ON arts.custom_orders;
CREATE POLICY "Users can view own custom orders" 
  ON arts.custom_orders FOR SELECT 
  USING ( auth.uid() = user_id );


-- ==========================================================
-- 3. COLLECTOR WISHLISTS (arts.wishlists)
-- ==========================================================

CREATE TABLE IF NOT EXISTS arts.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id text NOT NULL REFERENCES arts.artworks(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_user_artwork_wishlist UNIQUE (user_id, artwork_id)
);

-- Indexes for lightning fast lookups & counts
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON arts.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_artwork_id ON arts.wishlists(artwork_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_created ON arts.wishlists(user_id, created_at DESC);

-- Trigger Function: Enforce max 20 items per user in database
CREATE OR REPLACE FUNCTION arts.enforce_wishlist_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = arts, public
AS $$
DECLARE
  current_count integer;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM arts.wishlists
  WHERE user_id = NEW.user_id;

  IF current_count >= 20 THEN
    RAISE EXCEPTION 'Wishlist limit reached. You can save up to 20 artworks in your wishlist.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_wishlist_limit ON arts.wishlists;
CREATE TRIGGER trg_check_wishlist_limit
  BEFORE INSERT ON arts.wishlists
  FOR EACH ROW
  EXECUTE FUNCTION arts.enforce_wishlist_limit();

-- Permissions & Grants
GRANT SELECT, INSERT, DELETE ON arts.wishlists TO authenticated;
GRANT ALL ON arts.wishlists TO service_role;

-- Row Level Security (RLS)
ALTER TABLE arts.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wishlist" ON arts.wishlists;
CREATE POLICY "Users can view own wishlist"
  ON arts.wishlists FOR SELECT
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can add to own wishlist" ON arts.wishlists;
CREATE POLICY "Users can add to own wishlist"
  ON arts.wishlists FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can remove from own wishlist" ON arts.wishlists;
CREATE POLICY "Users can remove from own wishlist"
  ON arts.wishlists FOR DELETE
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Admins can manage all wishlists" ON arts.wishlists;
CREATE POLICY "Admins can manage all wishlists"
  ON arts.wishlists FOR ALL
  USING ( arts.is_admin() )
  WITH CHECK ( arts.is_admin() );


-- ==========================================================
-- 4. COLLECTOR SHOPPING CART (arts.cart_items)
-- ==========================================================

CREATE TABLE IF NOT EXISTS arts.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id text NOT NULL REFERENCES arts.artworks(id) ON DELETE CASCADE,
  variant_id text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 5),
  is_framed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_user_variant_framed UNIQUE (user_id, variant_id, is_framed)
);

-- Indexes for fast lookups & operations
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON arts.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_artwork_id ON arts.cart_items(artwork_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_updated ON arts.cart_items(user_id, updated_at DESC);

-- Trigger for auto updated_at
DROP TRIGGER IF EXISTS set_updated_at ON arts.cart_items;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.cart_items
  FOR EACH ROW EXECUTE FUNCTION arts.handle_updated_at();

-- Permissions & Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON arts.cart_items TO authenticated;
GRANT ALL ON arts.cart_items TO service_role;

-- Row Level Security (RLS)
ALTER TABLE arts.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cart items" ON arts.cart_items;
CREATE POLICY "Users can view own cart items"
  ON arts.cart_items FOR SELECT
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can add to own cart" ON arts.cart_items;
CREATE POLICY "Users can add to own cart"
  ON arts.cart_items FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can update own cart items" ON arts.cart_items;
CREATE POLICY "Users can update own cart items"
  ON arts.cart_items FOR UPDATE
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can remove from own cart" ON arts.cart_items;
CREATE POLICY "Users can remove from own cart"
  ON arts.cart_items FOR DELETE
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Admins can manage all cart items" ON arts.cart_items;
CREATE POLICY "Admins can manage all cart items"
  ON arts.cart_items FOR ALL
  USING ( arts.is_admin() )
  WITH CHECK ( arts.is_admin() );


-- ==========================================================
-- 5. RELOAD SCHEMA CACHE
-- ==========================================================
NOTIFY pgrst, 'reload schema';
