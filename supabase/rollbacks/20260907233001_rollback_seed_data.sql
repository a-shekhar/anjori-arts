-- ==========================================================
-- 20260907233001_rollback_seed_data.sql
-- Anjori Arts — Catalog Seed Data Rollback / Wipe
-- Target Schema: `arts`
--
-- PURPOSE:
-- Safely clears all catalog seed data (artworks, variants, categories,
-- surfaces, mediums, blog posts, testimonials) WITHOUT dropping tables,
-- triggers, indexes, or schema structure.
--
-- Rollback for:
--   supabase/migrations/20260907233001_seed_data.sql
-- ==========================================================

-- Clean dependent child tables first to respect foreign key constraints
DELETE FROM arts.testimonials;
DELETE FROM arts.blog_posts;
DELETE FROM arts.artwork_mediums;
DELETE FROM arts.artwork_variants;
DELETE FROM arts.artworks;
DELETE FROM arts.categories;
DELETE FROM arts.surfaces;
DELETE FROM arts.mediums;

-- RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

