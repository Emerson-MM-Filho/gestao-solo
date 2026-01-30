-- Orders Management Schema Migration
-- Creates tables for orders, order_items, payments and supporting functions
-- Implements RF01-RF03, RF05, RF13 from SRS.md
-- Version 1.2 - January 2026

-- =======================
-- TABLES
-- =======================

-- Function to generate random display ID
CREATE OR REPLACE FUNCTION api.generate_display_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude confusing chars (I, O, 0, 1)
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Orders Table (Comandas)
CREATE TABLE IF NOT EXISTS api.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  display_id VARCHAR(20) UNIQUE NOT NULL DEFAULT api.generate_display_id(),
  customer_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',

  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  stock_returned BOOLEAN,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT orders_status_valid CHECK (status IN ('open', 'closed', 'cancelled')),
  CONSTRAINT orders_customer_name_not_empty CHECK (char_length(trim(customer_name)) > 0),
  CONSTRAINT orders_total_non_negative CHECK (total_amount >= 0)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS api.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES api.orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES api.items(id) ON DELETE RESTRICT,

  quantity NUMERIC(10, 2) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,

  -- Per-unit customizations: [{notes: "no salad"}, {notes: "extra cheese"}]
  -- Array length should match quantity for per-unit customizations
  -- Can be null or empty array if no customizations
  customizations JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT order_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT order_items_unit_price_positive CHECK (unit_price > 0)
);

-- Payments Table
-- Supports multiple payment methods per order (RF13)
CREATE TABLE IF NOT EXISTS api.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES api.orders(id) ON DELETE CASCADE,

  method VARCHAR(20) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT payments_method_valid CHECK (method IN ('pix', 'credit', 'debit', 'cash', 'voucher', 'online')),
  CONSTRAINT payments_amount_positive CHECK (amount > 0)
);

-- =======================
-- INDEXES
-- =======================

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON api.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON api.orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON api.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_search ON api.orders USING gin(to_tsvector('simple', customer_name));
CREATE INDEX IF NOT EXISTS idx_orders_display_id ON api.orders(display_id);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON api.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_id ON api.order_items(item_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON api.payments(order_id);

-- =======================
-- ROW LEVEL SECURITY
-- =======================

ALTER TABLE api.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.payments ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON api.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON api.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON api.orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders"
  ON api.orders FOR DELETE
  USING (auth.uid() = user_id);

-- Order items policies (ownership via orders)
CREATE POLICY "Users can view items for their orders"
  ON api.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM api.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items for their orders"
  ON api.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM api.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items for their orders"
  ON api.order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM api.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM api.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items for their orders"
  ON api.order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM api.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Payments policies (ownership via orders)
CREATE POLICY "Users can view payments for their orders"
  ON api.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM api.orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments for their orders"
  ON api.payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM api.orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- No UPDATE/DELETE policies on payments - immutable record

-- =======================
-- TRIGGERS
-- =======================

-- Apply updated_at trigger to orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON api.orders
  FOR EACH ROW
  EXECUTE FUNCTION api.update_updated_at_column();

-- =======================
-- FUNCTIONS
-- =======================

-- Function to add item to order with immediate stock deduction [RF02, RF05]
-- CRITICAL: Stock is deducted when item is ADDED, not when order is closed
-- Supports per-unit customizations via JSONB array
CREATE OR REPLACE FUNCTION api.add_item_to_order(
  p_order_id UUID,
  p_item_id UUID,
  p_quantity NUMERIC(10, 2),
  p_customizations JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_new_stock NUMERIC(10, 2);
  v_order_item_id UUID;
BEGIN
  -- Validate order exists and is open
  SELECT * INTO v_order FROM api.orders WHERE id = p_order_id;

  IF v_order IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  IF v_order.status != 'open' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order is not open');
  END IF;

  -- Get item details
  SELECT * INTO v_item FROM api.items WHERE id = p_item_id AND is_active = true;

  IF v_item IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found or inactive');
  END IF;

  -- CRITICAL: For merchandise, check and deduct stock IMMEDIATELY
  IF v_item.type = 'merchandise' THEN
    IF v_item.stock_quantity < p_quantity THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Insufficient stock',
        'available', v_item.stock_quantity
      );
    END IF;

    v_new_stock := v_item.stock_quantity - p_quantity;

    -- Deduct stock immediately
    UPDATE api.items
    SET stock_quantity = v_new_stock, updated_at = now()
    WHERE id = p_item_id;

    -- Record stock movement
    INSERT INTO api.stock_movements (item_id, type, quantity, balance_after, notes)
    VALUES (
      p_item_id,
      'sale',
      p_quantity,
      v_new_stock,
      'Added to order ' || p_order_id
    );
  END IF;

  -- Always insert new order item since customizations may differ per unit
  -- Each order_item represents a group of units with the same customizations
  INSERT INTO api.order_items (order_id, item_id, quantity, unit_price, customizations)
  VALUES (p_order_id, p_item_id, p_quantity, v_item.price, p_customizations)
  RETURNING id INTO v_order_item_id;

  -- Update order total
  UPDATE api.orders
  SET total_amount = (
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    FROM api.order_items
    WHERE order_id = p_order_id
  ),
  updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_item_id', v_order_item_id,
    'new_stock', v_new_stock
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove item from order with stock return option [RF02]
CREATE OR REPLACE FUNCTION api.remove_item_from_order(
  p_order_item_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_order_item RECORD;
  v_order RECORD;
  v_item RECORD;
BEGIN
  -- Get order item details
  SELECT * INTO v_order_item FROM api.order_items WHERE id = p_order_item_id;

  IF v_order_item IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order item not found');
  END IF;

  -- Validate order is open
  SELECT * INTO v_order FROM api.orders WHERE id = v_order_item.order_id;

  IF v_order.status != 'open' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot remove items from closed order');
  END IF;

  -- Get item details
  SELECT * INTO v_item FROM api.items WHERE id = v_order_item.item_id;

  -- Note: Stock is NOT returned automatically when removing from order
  -- Stock was deducted when added and is considered "committed"
  -- Use cancel_order with stock_returned=true to return stock

  -- Delete order item
  DELETE FROM api.order_items WHERE id = p_order_item_id;

  -- Update order total
  UPDATE api.orders
  SET total_amount = (
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    FROM api.order_items
    WHERE order_id = v_order.id
  ),
  updated_at = now()
  WHERE id = v_order.id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to close order with payment validation [RF03, RF13]
-- NOTE: Stock already deducted when items were added (RF05)
CREATE OR REPLACE FUNCTION api.close_order(
  p_order_id UUID,
  p_payments JSONB  -- Array of {method, amount}
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_payment RECORD;
  v_total_paid NUMERIC(10, 2) := 0;
BEGIN
  -- Get order
  SELECT * INTO v_order FROM api.orders WHERE id = p_order_id;

  IF v_order IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  IF v_order.status != 'open' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order is not open');
  END IF;

  -- Validate order has items
  IF v_order.total_amount = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order has no items');
  END IF;

  -- Calculate total paid from payments array
  SELECT SUM((p->>'amount')::NUMERIC) INTO v_total_paid
  FROM jsonb_array_elements(p_payments) p;

  -- Validate payment total matches order total
  IF v_total_paid != v_order.total_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment total does not match order total',
      'expected', v_order.total_amount,
      'received', v_total_paid
    );
  END IF;

  -- Insert payment records
  FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
  LOOP
    INSERT INTO api.payments (order_id, method, amount)
    VALUES (
      p_order_id,
      (v_payment.value->>'method')::VARCHAR,
      (v_payment.value->>'amount')::NUMERIC
    );
  END LOOP;

  -- Update order status (stock already deducted when items were added)
  UPDATE api.orders
  SET status = 'closed',
      closed_at = now(),
      updated_at = now()
  WHERE id = p_order_id;

  -- Update usage count for all items in order
  UPDATE api.items
  SET usage_count = usage_count + 1
  WHERE id IN (
    SELECT DISTINCT item_id FROM api.order_items WHERE order_id = p_order_id
  );

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel order with optional stock return [RF12]
CREATE OR REPLACE FUNCTION api.cancel_order(
  p_order_id UUID,
  p_return_stock BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_order_item RECORD;
  v_item RECORD;
BEGIN
  -- Get order
  SELECT * INTO v_order FROM api.orders WHERE id = p_order_id;

  IF v_order IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  IF v_order.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order already cancelled');
  END IF;

  -- If returning stock, restore quantities for merchandise items
  IF p_return_stock THEN
    FOR v_order_item IN
      SELECT oi.*, i.type
      FROM api.order_items oi
      JOIN api.items i ON oi.item_id = i.id
      WHERE oi.order_id = p_order_id AND i.type = 'merchandise'
    LOOP
      -- Restore stock
      UPDATE api.items
      SET stock_quantity = stock_quantity + v_order_item.quantity,
          updated_at = now()
      WHERE id = v_order_item.item_id
      RETURNING * INTO v_item;

      -- Record reversal movement
      INSERT INTO api.stock_movements (item_id, type, quantity, balance_after, notes)
      VALUES (
        v_order_item.item_id,
        'reversal',
        v_order_item.quantity,
        v_item.stock_quantity,
        'Order ' || p_order_id || ' cancelled with stock return: ' || COALESCE(p_reason, 'No reason provided')
      );
    END LOOP;
  END IF;

  -- Update order status
  UPDATE api.orders
  SET status = 'cancelled',
      cancelled_at = now(),
      cancellation_reason = p_reason,
      stock_returned = p_return_stock,
      updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
