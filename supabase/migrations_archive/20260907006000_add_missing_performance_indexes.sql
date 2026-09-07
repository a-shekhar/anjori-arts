-- ==========================================================
-- 20260907006000_add_missing_performance_indexes.sql
-- Anjori Arts — Add Missing Indexes for Performance & FK Optimization
-- Target Schema: `arts`
-- ==========================================================

-- 1. TESTIMONIALS TABLE INDEXES
-- Optimizes public approved & featured queries on the landing page/reviews,
-- as well as foreign key cascading checks when categories are modified.
CREATE INDEX IF NOT EXISTS idx_testimonials_approved_featured 
  ON arts.testimonials(is_approved, is_featured);

CREATE INDEX IF NOT EXISTS idx_testimonials_category 
  ON arts.testimonials(category_id);

-- 2. CUSTOM ORDERS TABLE INDEXES
-- Optimizes admin custom order table sorting by created_at DESC and filtering by status.
CREATE INDEX IF NOT EXISTS idx_custom_orders_status 
  ON arts.custom_orders(status);

CREATE INDEX IF NOT EXISTS idx_custom_orders_created_at 
  ON arts.custom_orders(created_at DESC);

-- 3. ORDER ITEMS TABLE INDEXES
-- Optimizes foreign key lookups and prevents full sequential table scans
-- during ON DELETE SET NULL checks when artworks or variants are updated/deleted.
CREATE INDEX IF NOT EXISTS idx_order_items_artwork_id 
  ON arts.order_items(artwork_id);

CREATE INDEX IF NOT EXISTS idx_order_items_variant_id 
  ON arts.order_items(variant_id);

