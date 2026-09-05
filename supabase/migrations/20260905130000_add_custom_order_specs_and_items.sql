-- Migration: Add agreed commission specifications and itemized quotation to custom orders
ALTER TABLE arts.custom_orders
  ADD COLUMN IF NOT EXISTS final_category text,
  ADD COLUMN IF NOT EXISTS final_medium text,
  ADD COLUMN IF NOT EXISTS final_surface text,
  ADD COLUMN IF NOT EXISTS final_size text,
  ADD COLUMN IF NOT EXISTS final_budget text,
  ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS quote_total numeric DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS deposit_percentage numeric DEFAULT 50 NOT NULL,
  ADD COLUMN IF NOT EXISTS advance_deposit numeric DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS estimated_timeline text,
  ADD COLUMN IF NOT EXISTS admin_notes text;

