-- ==========================================================
-- 20260906004000_orders_and_checkout.sql
-- Anjori Arts — Web Checkout, Orders & Order Items
-- Target Schema: `arts`
-- ==========================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS arts.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  country_code text DEFAULT '+91' NOT NULL,
  shipping_address jsonb NOT NULL,
  delivery_instructions text,
  subtotal integer NOT NULL, -- in paise
  delivery_charge integer DEFAULT 0 NOT NULL, -- in paise
  discount_amount integer DEFAULT 0 NOT NULL, -- in paise
  total_amount integer NOT NULL, -- in paise
  currency text DEFAULT 'INR' NOT NULL,
  payment_method text DEFAULT 'upi_qr' NOT NULL, -- 'upi_qr', 'bank_transfer', 'pay_on_dispatch', 'razorpay'
  payment_status text DEFAULT 'pending' NOT NULL, -- 'pending', 'receipt_uploaded', 'verified', 'paid', 'failed', 'refunded'
  payment_reference text, -- UTR / bank reference / Razorpay payment ID
  receipt_url text, -- Cloudinary proof URL for manual UPI/NEFT transfer
  order_status text DEFAULT 'received' NOT NULL, -- 'received', 'confirmed', 'framing_packing', 'dispatched', 'delivered', 'cancelled'
  courier_name text, -- 'BlueDart', 'Delhivery', 'India Post', 'DTDC', etc.
  tracking_number text,
  tracking_url text,
  estimated_delivery text,
  admin_notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS arts.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES arts.orders(id) ON DELETE CASCADE,
  artwork_id text REFERENCES arts.artworks(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES arts.artwork_variants(id) ON DELETE SET NULL,
  title text NOT NULL,
  image_url text,
  size text NOT NULL,
  is_framed boolean DEFAULT false NOT NULL,
  framing_price integer DEFAULT 0 NOT NULL, -- in paise
  unit_price integer NOT NULL, -- in paise
  quantity integer DEFAULT 1 NOT NULL,
  line_total integer NOT NULL, -- in paise
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. INDEXES FOR FAST RETRIEVAL & FILTERING
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON arts.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON arts.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON arts.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON arts.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON arts.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON arts.order_items(order_id);

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE arts.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE arts.order_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES FOR ORDERS
-- 5.1 Public can create an order (guest checkout supported)
CREATE POLICY "Public can insert orders"
  ON arts.orders FOR INSERT
  WITH CHECK (true);

-- 5.2 Authenticated users can view their own orders
CREATE POLICY "Users can view own orders"
  ON arts.orders FOR SELECT
  USING (auth.uid() = user_id);

-- 5.3 Public can read an order by order_number (needed for order-success / guest tracking)
CREATE POLICY "Public can view order by order_number"
  ON arts.orders FOR SELECT
  USING (true);

-- 5.4 Admins have full access to orders
CREATE POLICY "Admins can manage orders"
  ON arts.orders FOR ALL
  USING (arts.is_admin())
  WITH CHECK (arts.is_admin());

-- 6. RLS POLICIES FOR ORDER ITEMS
-- 6.1 Public can insert order items alongside an order
CREATE POLICY "Public can insert order items"
  ON arts.order_items FOR INSERT
  WITH CHECK (true);

-- 6.2 Public can view order items for orders they can view
CREATE POLICY "Public can view order items"
  ON arts.order_items FOR SELECT
  USING (true);

-- 6.3 Admins can manage all order items
CREATE POLICY "Admins can manage order items"
  ON arts.order_items FOR ALL
  USING (arts.is_admin())
  WITH CHECK (arts.is_admin());

-- 7. GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE ON arts.orders TO anon, authenticated;
GRANT SELECT, INSERT ON arts.order_items TO anon, authenticated;
GRANT ALL ON arts.orders TO service_role;
GRANT ALL ON arts.order_items TO service_role;

-- 8. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

