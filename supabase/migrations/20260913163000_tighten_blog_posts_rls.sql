-- Migration: Tighten arts.blog_posts RLS policies
-- Drops the overly permissive USING (true) public SELECT policy and enforces
-- that anonymous/public clients can only view published blog posts.
-- Adds explicit admin read and write policies.

-- 1. Drop existing permissive public read policy
DROP POLICY IF EXISTS "Public read access for blog posts" ON arts.blog_posts;

-- 2. Public can only read published blog posts
CREATE POLICY "Public read access for published blog posts" 
  ON arts.blog_posts FOR SELECT 
  USING (
    is_published = true 
    AND published_at IS NOT NULL 
    AND published_at <= timezone('utc'::text, now())
  );

-- 3. Admins can view all blog posts (published, scheduled, or drafts)
CREATE POLICY "Admins can view all blog posts" 
  ON arts.blog_posts FOR SELECT 
  USING ( arts.is_admin() );

-- 4. Admins can insert, update, delete blog posts
CREATE POLICY "Admins can manage blog posts" 
  ON arts.blog_posts FOR ALL 
  USING ( arts.is_admin() ) 
  WITH CHECK ( arts.is_admin() );

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

