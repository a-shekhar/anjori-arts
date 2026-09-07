-- ==========================================================
-- 20260907001000_fix_orders_rls_leak.sql
-- Anjori Arts — Fix Critical RLS Customer Data Leak on Orders & Order Items
-- Target Schema: `arts`
-- ==========================================================

-- 1. DROP LEAKING PUBLIC SELECT POLICIES
-- The previous policies used USING (true) which allowed any anonymous client
-- to dump all customer personal data, addresses, and order items.
DROP POLICY IF EXISTS "Public can view order by order_number" ON arts.orders;
DROP POLICY IF EXISTS "Public can view order items" ON arts.order_items;

-- 2. SECURE AUTHENTICATED ACCESS FOR ORDER ITEMS
-- Allow logged-in customers to view items only for orders they own.
-- ("Users can view own orders" already handles the parent orders table).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'arts' 
      AND tablename = 'order_items' 
      AND policyname = 'Users can view own order items'
  ) THEN
    CREATE POLICY "Users can view own order items"
      ON arts.order_items FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM arts.orders
          WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 3. REVOKE EXCESSIVE PRIVILEGES FROM ANON ROLE
-- Anon should never have direct SELECT or UPDATE privileges on orders or order_items.
-- Guest lookups and checkout insertion are safely mediated by server actions using service_role.
REVOKE SELECT, UPDATE ON arts.orders FROM anon;
REVOKE SELECT ON arts.order_items FROM anon;

-- 4. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

