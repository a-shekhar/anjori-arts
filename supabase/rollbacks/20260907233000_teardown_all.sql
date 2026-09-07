-- ==========================================================
-- 20260907233000_teardown_all.sql
-- Anjori Arts — Database Teardown & Rollback Script
-- Target Schema: `arts`
--
-- CAUTION:
-- This script completely drops the `arts` schema and all associated
-- tables, indexes, functions, triggers, and policies.
-- Use ONLY for:
--   1. Local development resets
--   2. Staging test environment cleanup
--   3. Disaster recovery / emergency manual rollbacks via Supabase SQL Editor
--
-- NOTE:
-- Keep this script in `supabase/rollbacks/` and NEVER move it into
-- `supabase/migrations/` (to prevent Supabase CLI from auto-running it).
-- ==========================================================

-- 1. DROP AUTH TRIGGERS ON AUTH.USERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. DROP ALL PRIVILEGES IN SCHEMA ARTS
REVOKE ALL ON SCHEMA arts FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts REVOKE ALL ON TABLES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts REVOKE ALL ON SEQUENCES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts REVOKE ALL ON ROUTINES FROM anon, authenticated, service_role;

-- 3. DROP ENTIRE `arts` SCHEMA CASCADE
-- CASCADE automatically tears down:
--   - All 13 tables (categories, surfaces, mediums, artworks, artwork_mediums,
--     artwork_variants, inquiries, custom_orders, blog_posts, profiles,
--     testimonials, orders, order_items)
--   - All foreign keys & performance indexes
--   - All triggers (set_updated_at)
--   - All functions (handle_new_user, is_admin, handle_updated_at, decrement_variant_stock)
--   - All custom types (user_role, artwork_availability, order_status)
--   - All Row Level Security policies
DROP SCHEMA IF EXISTS arts CASCADE;

-- 4. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

