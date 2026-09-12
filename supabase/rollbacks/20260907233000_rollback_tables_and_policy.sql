-- ==========================================================
-- 20260907233000_rollback_tables_and_policy.sql
-- Anjori Arts — Database Teardown & Schema Rollback
-- Target Schema: `arts`
--
-- CAUTION:
-- This script completely tears down the `arts` schema and all associated
-- tables, custom types, indexes, functions, triggers, and policies.
--
-- Rollback for:
--   supabase/migrations/20260907233000_create_tables_and_policy.sql
-- ==========================================================

-- 1. DROP AUTH TRIGGERS ON AUTH.USERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. DROP ALL PRIVILEGES IN SCHEMA ARTS
REVOKE ALL ON SCHEMA arts FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts REVOKE ALL ON TABLES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts REVOKE ALL ON SEQUENCES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts REVOKE ALL ON ROUTINES FROM anon, authenticated, service_role;

-- 3. DROP ENTIRE `arts` SCHEMA CASCADE
-- CASCADE automatically drops:
--   - All tables (categories, surfaces, mediums, artworks, artwork_mediums,
--     artwork_variants, inquiries, custom_orders, blog_posts, profiles,
--     testimonials, orders, order_items, user_addresses, wishlists, cart_items)
--   - All foreign keys & performance indexes
--   - All triggers (set_updated_at, handle_default_address, trg_check_wishlist_limit)
--   - All functions (handle_new_user, is_admin, handle_updated_at, decrement_variant_stock, enforce_wishlist_limit)
--   - All custom types (user_role, artwork_availability, order_status)
--   - All Row Level Security policies
DROP SCHEMA IF EXISTS arts CASCADE;

-- 4. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

