-- ==========================================================
-- 20260906005000_add_order_payment_and_refund_fields.sql
-- Anjori Arts — Extended Order Payment, Gateway & Refund Tracking
-- Target Schema: `arts`
-- ==========================================================

ALTER TABLE arts.orders 
  ADD COLUMN IF NOT EXISTS gateway_order_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS refund_reference text,
  ADD COLUMN IF NOT EXISTS refund_amount integer DEFAULT 0 NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_gateway_order_id ON arts.orders(gateway_order_id);

