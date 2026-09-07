-- Migration: Add admin_notes, updated_at, and indexes to arts.inquiries
ALTER TABLE arts.inquiries 
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Indexes for efficient admin querying and sorting
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON arts.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON arts.inquiries(created_at DESC);

