-- ==========================================================
-- 20260907004000_restrict_least_privilege_grants.sql
-- Anjori Arts — Enforce Least-Privilege Table Grants (Defense-in-Depth)
-- Target Schema: `arts`
-- ==========================================================

-- 1. REVOKE BLANKET ALL PRIVILEGES FROM ANON AND AUTHENTICATED
REVOKE ALL ON ALL TABLES IN SCHEMA arts FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA arts FROM authenticated;

-- 2. REVOKE OVER-PERMISSIVE DEFAULT PRIVILEGES FOR FUTURE TABLES
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA arts 
  REVOKE ALL ON TABLES FROM anon, authenticated;

-- 3. ENSURE SCHEMA USAGE IS PRESERVED
GRANT USAGE ON SCHEMA arts TO anon, authenticated, service_role;

-- 4. GRANT LEAST PRIVILEGE TO `anon` (UNAUTHENTICATED GUESTS)
-- 4.1 Public Catalog & Content: SELECT only
GRANT SELECT ON arts.categories TO anon;
GRANT SELECT ON arts.surfaces TO anon;
GRANT SELECT ON arts.mediums TO anon;
GRANT SELECT ON arts.artworks TO anon;
GRANT SELECT ON arts.artwork_mediums TO anon;
GRANT SELECT ON arts.artwork_variants TO anon;
GRANT SELECT ON arts.blog_posts TO anon;
GRANT SELECT ON arts.testimonials TO anon;

-- 4.2 Guest Forms: INSERT only
GRANT INSERT ON arts.inquiries TO anon;
GRANT INSERT ON arts.custom_orders TO anon;

-- 5. GRANT LEAST PRIVILEGE TO `authenticated` (LOGGED-IN USERS)
-- 5.1 Public Catalog & Content: SELECT only
GRANT SELECT ON arts.categories TO authenticated;
GRANT SELECT ON arts.surfaces TO authenticated;
GRANT SELECT ON arts.mediums TO authenticated;
GRANT SELECT ON arts.artworks TO authenticated;
GRANT SELECT ON arts.artwork_mediums TO authenticated;
GRANT SELECT ON arts.artwork_variants TO authenticated;
GRANT SELECT ON arts.blog_posts TO authenticated;
GRANT SELECT ON arts.testimonials TO authenticated;

-- 5.2 User Forms & Orders: INSERT & SELECT (row-scoped via RLS)
GRANT INSERT ON arts.inquiries TO authenticated;
GRANT INSERT ON arts.custom_orders TO authenticated;
GRANT SELECT, INSERT ON arts.orders TO authenticated;
GRANT SELECT, INSERT ON arts.order_items TO authenticated;

-- 5.3 User Profiles: SELECT & UPDATE own profile (row-scoped via RLS)
GRANT SELECT, UPDATE ON arts.profiles TO authenticated;

-- 6. FULL PRIVILEGES RETAINED FOR `service_role` (ADMIN SERVER ACTIONS)
GRANT ALL ON ALL TABLES IN SCHEMA arts TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA arts TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA arts TO service_role;

-- 7. SEQUENCES & ROUTINES FOR ANON & AUTHENTICATED
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA arts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION arts.is_admin() TO authenticated, service_role;

-- 8. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

