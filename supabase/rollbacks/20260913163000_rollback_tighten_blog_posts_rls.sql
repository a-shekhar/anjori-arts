-- Rollback: Revert arts.blog_posts RLS policies to initial state

DROP POLICY IF EXISTS "Admins can manage blog posts" ON arts.blog_posts;
DROP POLICY IF EXISTS "Admins can view all blog posts" ON arts.blog_posts;
DROP POLICY IF EXISTS "Public read access for published blog posts" ON arts.blog_posts;

CREATE POLICY "Public read access for blog posts" ON arts.blog_posts FOR SELECT USING (true);

NOTIFY pgrst, 'reload schema';

