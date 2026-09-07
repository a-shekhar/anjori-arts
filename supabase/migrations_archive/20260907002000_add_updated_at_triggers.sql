-- ==========================================================
-- 20260907002000_add_updated_at_triggers.sql
-- Anjori Arts — Auto-update `updated_at` columns via PostgreSQL Triggers
-- Target Schema: `arts`
-- ==========================================================

-- 1. REUSABLE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION arts.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. ATTACH TRIGGER TO ALL TABLES WITH `updated_at`

-- 2.1 Artworks
DROP TRIGGER IF EXISTS set_updated_at ON arts.artworks;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.artworks
  FOR EACH ROW
  EXECUTE FUNCTION arts.handle_updated_at();

-- 2.2 Custom Orders
DROP TRIGGER IF EXISTS set_updated_at ON arts.custom_orders;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.custom_orders
  FOR EACH ROW
  EXECUTE FUNCTION arts.handle_updated_at();

-- 2.3 Orders
DROP TRIGGER IF EXISTS set_updated_at ON arts.orders;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.orders
  FOR EACH ROW
  EXECUTE FUNCTION arts.handle_updated_at();

-- 2.4 Inquiries
DROP TRIGGER IF EXISTS set_updated_at ON arts.inquiries;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION arts.handle_updated_at();

-- 2.5 Testimonials
DROP TRIGGER IF EXISTS set_updated_at ON arts.testimonials;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION arts.handle_updated_at();

-- 2.6 Blog Posts
DROP TRIGGER IF EXISTS set_updated_at ON arts.blog_posts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION arts.handle_updated_at();

-- 2.7 Profiles
DROP TRIGGER IF EXISTS set_updated_at ON arts.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON arts.profiles
  FOR EACH ROW
  EXECUTE FUNCTION arts.handle_updated_at();

