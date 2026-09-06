-- ==========================================================
-- 20260906002000_testimonials.sql
-- Anjori Arts — Testimonials & Collector Stories
-- Target Schema: `arts`
-- ==========================================================

CREATE TABLE IF NOT EXISTS arts.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_location text,
  artwork_title text,
  category_id text REFERENCES arts.categories(id) ON DELETE SET NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  quote text NOT NULL,
  image_url text,
  image_alt text,
  is_approved boolean DEFAULT false NOT NULL,
  is_featured boolean DEFAULT false NOT NULL,
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE arts.testimonials ENABLE ROW LEVEL SECURITY;

-- 1. Public Read: Anyone can view approved testimonials
CREATE POLICY "Public read access for approved testimonials"
  ON arts.testimonials FOR SELECT
  USING (is_approved = true);

-- 2. Public Insert: Customers can submit stories (must start unapproved)
CREATE POLICY "Public can submit testimonials"
  ON arts.testimonials FOR INSERT
  WITH CHECK (is_approved = false);

-- 3. Admin Full Management
CREATE POLICY "Admins can view all testimonials"
  ON arts.testimonials FOR SELECT
  USING (arts.is_admin());

CREATE POLICY "Admins can update testimonials"
  ON arts.testimonials FOR UPDATE
  USING (arts.is_admin())
  WITH CHECK (arts.is_admin());

CREATE POLICY "Admins can delete testimonials"
  ON arts.testimonials FOR DELETE
  USING (arts.is_admin());

-- Permissions
GRANT SELECT, INSERT ON arts.testimonials TO anon, authenticated;
GRANT ALL ON arts.testimonials TO service_role;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';

