-- ==========================================================
-- 20260906006000_add_display_order_to_categories_and_mediums.sql
-- Add display_order column to arts.categories and arts.mediums
-- Target Schema: `arts`
-- ==========================================================

-- 1. Add display_order to categories
ALTER TABLE arts.categories 
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0 NOT NULL;

-- Initialize display_order for core art traditions and collections
UPDATE arts.categories SET display_order = 10 WHERE slug = 'madhubani';
UPDATE arts.categories SET display_order = 20 WHERE slug = 'tanjore';
UPDATE arts.categories SET display_order = 30 WHERE slug = 'warli';
UPDATE arts.categories SET display_order = 40 WHERE slug = 'mythological-devotional';
UPDATE arts.categories SET display_order = 50 WHERE slug = 'mandala';
UPDATE arts.categories SET display_order = 60 WHERE slug = 'contemporary';
UPDATE arts.categories SET display_order = 70 WHERE slug = 'portraiture';
UPDATE arts.categories SET display_order = 80 WHERE slug = 'figurative';
UPDATE arts.categories SET display_order = 90 WHERE slug = 'customised-branding';
UPDATE arts.categories SET display_order = 100 WHERE slug = 'poster-designing';
UPDATE arts.categories SET display_order = 110 WHERE slug = 'cyanotype';
UPDATE arts.categories SET display_order = 120 WHERE slug = 'earrings';

-- 2. Add display_order to mediums
ALTER TABLE arts.mediums 
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0 NOT NULL;

-- Initialize display_order for seeded mediums
UPDATE arts.mediums SET display_order = 10 WHERE slug = 'acrylic';
UPDATE arts.mediums SET display_order = 20 WHERE slug = 'oil';

