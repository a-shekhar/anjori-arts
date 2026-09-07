-- ==========================================================
-- 20260907007000_decrement_variant_stock_function.sql
-- Anjori Arts — Atomic Stock Decrement Function
-- Target Schema: `arts`
-- ==========================================================

CREATE OR REPLACE FUNCTION arts.decrement_variant_stock(
  p_variant_id uuid,
  p_quantity integer
)
RETURNS void AS $$
BEGIN
  UPDATE arts.artwork_variants
  SET stock_quantity = GREATEST(0, stock_quantity - p_quantity)
  WHERE id = p_variant_id AND stock_quantity > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION arts.decrement_variant_stock(uuid, integer) TO authenticated, service_role;

