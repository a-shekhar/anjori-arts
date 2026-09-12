-- ==========================================================
-- 20260912152700_rollback_user_addresses_custom_orders_wishlists_cart_items.sql
-- Anjori Arts — User Features Rollback (Addresses, Wishlists, Cart, Custom Order Linkage)
-- Target Schema: `arts`
--
-- PURPOSE:
-- Safely unwinds only user account features WITHOUT touching catalog
-- artworks, categories, orders, or core platform tables.
--
-- Rollback for:
--   supabase/migrations/20260912152700_user_addresses_custom_orders_wishlists_cart_items.sql
-- ==========================================================

-- 1. ROLLBACK SHOPPING CART ITEMS
DROP TABLE IF EXISTS arts.cart_items CASCADE;

-- 2. ROLLBACK WISHLISTS & LIMIT TRIGGER FUNCTION
DROP TABLE IF EXISTS arts.wishlists CASCADE;
DROP FUNCTION IF EXISTS arts.enforce_wishlist_limit();

-- 3. ROLLBACK CUSTOM ORDERS USER LINKAGE
DROP POLICY IF EXISTS "Users can view own custom orders" ON arts.custom_orders;
DROP INDEX IF EXISTS arts.idx_custom_orders_user_id;
ALTER TABLE arts.custom_orders DROP COLUMN IF EXISTS user_id;

-- 4. ROLLBACK USER ADDRESSES & DEFAULT ADDRESS TRIGGER FUNCTION
DROP TABLE IF EXISTS arts.user_addresses CASCADE;
DROP FUNCTION IF EXISTS arts.handle_default_address();

-- 5. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

