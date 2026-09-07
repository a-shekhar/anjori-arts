-- ==========================================================
-- 20260907003000_add_status_check_constraints.sql
-- Anjori Arts — Enforce Database CHECK Constraints on Status Columns
-- Target Schema: `arts`
-- ==========================================================

-- 1. ORDERS TABLE CONSTRAINTS

-- 1.1 Order Status
ALTER TABLE arts.orders DROP CONSTRAINT IF EXISTS chk_orders_order_status;
ALTER TABLE arts.orders ADD CONSTRAINT chk_orders_order_status
  CHECK (order_status IN (
    'received',
    'confirmed',
    'framing_packing',
    'dispatched',
    'delivered',
    'cancelled'
  ));

-- 1.2 Payment Status
ALTER TABLE arts.orders DROP CONSTRAINT IF EXISTS chk_orders_payment_status;
ALTER TABLE arts.orders ADD CONSTRAINT chk_orders_payment_status
  CHECK (payment_status IN (
    'pending',
    'receipt_uploaded',
    'verified',
    'paid',
    'failed',
    'refunded'
  ));

-- 1.3 Payment Method
ALTER TABLE arts.orders DROP CONSTRAINT IF EXISTS chk_orders_payment_method;
ALTER TABLE arts.orders ADD CONSTRAINT chk_orders_payment_method
  CHECK (payment_method IN (
    'upi_qr',
    'bank_transfer',
    'pay_on_dispatch',
    'razorpay'
  ));

-- 2. INQUIRIES TABLE CONSTRAINT

-- 2.1 Inquiry Status
ALTER TABLE arts.inquiries DROP CONSTRAINT IF EXISTS chk_inquiries_status;
ALTER TABLE arts.inquiries ADD CONSTRAINT chk_inquiries_status
  CHECK (status IN (
    'new',
    'reviewed',
    'in_progress',
    'resolved',
    'archived'
  ));

-- 3. CUSTOM ORDERS TABLE CONSTRAINT

-- 3.1 Custom Order Status
ALTER TABLE arts.custom_orders DROP CONSTRAINT IF EXISTS chk_custom_orders_status;
ALTER TABLE arts.custom_orders ADD CONSTRAINT chk_custom_orders_status
  CHECK (status IN (
    'new',
    'submitted',
    'reviewed',
    'quoted',
    'accepted',
    'in_progress',
    'completed',
    'cancelled'
  ));

