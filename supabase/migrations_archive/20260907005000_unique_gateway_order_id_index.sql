-- ==========================================================
-- 20260907005000_unique_gateway_order_id_index.sql
-- Anjori Arts — Enforce Unique Partial Index on orders.gateway_order_id
-- Target Schema: `arts`
-- ==========================================================

-- 1. DROP EXISTING NON-UNIQUE INDEX
DROP INDEX IF EXISTS arts.idx_orders_gateway_order_id;

-- 2. CREATE UNIQUE PARTIAL INDEX
-- Ensures 1:1 mapping between Razorpay gateway orders and database orders,
-- preventing duplicate order records and race-condition collisions,
-- while allowing multiple NULL values for manual UPI/bank transfer orders.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_gateway_order_id 
  ON arts.orders(gateway_order_id) 
  WHERE gateway_order_id IS NOT NULL;

