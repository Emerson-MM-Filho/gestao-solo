-- Update add_item_to_order function to accept TEXT instead of JSONB
-- Function signature change: p_customizations JSONB -> p_customizations TEXT

CREATE OR REPLACE FUNCTION api.add_item_to_order(
  p_order_id UUID,
  p_item_id UUID,
  p_quantity NUMERIC(10, 2),
  p_customizations TEXT DEFAULT NULL
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

  -- Always insert new order_item
  -- Each order_item is a group of units with the same customizations
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
