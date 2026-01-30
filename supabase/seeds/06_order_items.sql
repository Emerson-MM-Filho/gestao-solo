-- Seed Order Items and Payments
-- Populates orders with items and creates payment records
-- Creates sale stock movements
-- Handles multiple payment methods

DO $$
DECLARE
  v_user_id UUID;
  v_order RECORD;
  v_item RECORD;
  v_items_count INTEGER;
  v_quantity NUMERIC;
  v_customization JSONB;
  v_order_total NUMERIC;
  v_payment_methods TEXT[] := ARRAY['pix', 'credit', 'debit', 'cash', 'voucher'];
  v_payment_method TEXT;
  v_payment_amount NUMERIC;
  v_remaining_amount NUMERIC;
  v_use_multiple_payments BOOLEAN;
  v_total_orders INTEGER := 0;
  v_total_items INTEGER := 0;
  v_total_payments INTEGER := 0;
  v_merchandise_items UUID[];
  v_random_item UUID;
  v_item_price NUMERIC;
  v_current_stock NUMERIC;
BEGIN
  -- Get test user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'test@example.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Test user not found. Run 01_test_user.sql first.';
  END IF;

  -- Get all merchandise items for random selection
  SELECT array_agg(id) INTO v_merchandise_items
  FROM api.items
  WHERE user_id = v_user_id AND type = 'merchandise' AND is_active = true;

  IF v_merchandise_items IS NULL OR array_length(v_merchandise_items, 1) = 0 THEN
    RAISE EXCEPTION 'No merchandise items found. Run 03_items.sql first.';
  END IF;

  -- Delete existing order items and payments for idempotency
  DELETE FROM api.payments p
  USING api.orders o
  WHERE p.order_id = o.id AND o.user_id = v_user_id;

  DELETE FROM api.order_items oi
  USING api.orders o
  WHERE oi.order_id = o.id AND o.user_id = v_user_id;

  -- Process each order
  FOR v_order IN
    SELECT id, status, created_at
    FROM api.orders
    WHERE user_id = v_user_id
    ORDER BY created_at
  LOOP
    v_order_total := 0;

    -- Determine number of items (1-8, weighted toward 2-4)
    v_items_count := CASE
      WHEN random() < 0.5 THEN 2 + floor(random() * 3)::int  -- 50%: 2-4 items
      WHEN random() < 0.8 THEN 1                              -- 30%: 1 item
      ELSE 5 + floor(random() * 4)::int                       -- 20%: 5-8 items
    END;

    -- Add items to order
    FOR i IN 1..v_items_count LOOP
      -- Select random merchandise item
      v_random_item := v_merchandise_items[1 + floor(random() * array_length(v_merchandise_items, 1))::int];

      -- Get item details
      SELECT price, stock_quantity INTO v_item_price, v_current_stock
      FROM api.items
      WHERE id = v_random_item;

      -- Determine quantity (weighted toward 1-2)
      v_quantity := CASE
        WHEN random() < 0.7 THEN 1                    -- 70%: 1 unit
        WHEN random() < 0.9 THEN 2                    -- 20%: 2 units
        ELSE 3 + floor(random() * 3)::int            -- 10%: 3-5 units
      END;

      -- Add customization text (20% chance)
      v_customization := NULL;
      IF random() < 0.2 THEN
        v_customization := (ARRAY[
          '{"notes": "No sugar"}',
          '{"notes": "Extra hot"}',
          '{"notes": "With ice"}',
          '{"notes": "To go"}',
          '{"notes": "Less milk"}',
          '{"notes": "Extra cheese"}',
          '{"notes": "No onion"}',
          '{"notes": "Well done"}'
        ])[1 + floor(random() * 8)::int]::jsonb;
      END IF;

      -- Insert order item
      INSERT INTO api.order_items (order_id, item_id, quantity, unit_price, customizations, created_at)
      VALUES (
        v_order.id,
        v_random_item,
        v_quantity,
        v_item_price,
        v_customization,
        v_order.created_at
      );

      v_order_total := v_order_total + (v_quantity * v_item_price);
      v_total_items := v_total_items + 1;

      -- Create stock movement for sale (for closed and cancelled orders)
      IF v_order.status IN ('closed', 'cancelled') THEN
        -- Get updated stock after this sale
        SELECT stock_quantity INTO v_current_stock
        FROM api.items
        WHERE id = v_random_item;

        -- Record the sale movement
        INSERT INTO api.stock_movements (item_id, type, quantity, balance_after, created_at, notes)
        VALUES (
          v_random_item,
          'sale',
          v_quantity,
          v_current_stock, -- Current balance (already adjusted)
          v_order.created_at + (floor(random() * 5)::int || ' minutes')::interval,
          'Order sale'
        );

        -- For cancelled orders with stock returned, create reversal
        IF v_order.status = 'cancelled' AND EXISTS (
          SELECT 1 FROM api.orders WHERE id = v_order.id AND stock_returned = true
        ) THEN
          INSERT INTO api.stock_movements (item_id, type, quantity, balance_after, created_at, notes)
          VALUES (
            v_random_item,
            'reversal',
            v_quantity,
            v_current_stock + v_quantity,
            v_order.created_at + (30 + floor(random() * 90)::int || ' minutes')::interval,
            'Order cancelled'
          );

          -- Update item stock
          UPDATE api.items
          SET stock_quantity = stock_quantity + v_quantity
          WHERE id = v_random_item;
        END IF;
      END IF;
    END LOOP;

    -- Update order total
    UPDATE api.orders
    SET total_amount = v_order_total
    WHERE id = v_order.id;

    -- Create payments for closed orders
    IF v_order.status = 'closed' THEN
      v_use_multiple_payments := random() < 0.15; -- 15% multiple payments
      v_remaining_amount := v_order_total;

      IF v_use_multiple_payments AND v_order_total >= 30 THEN
        -- Split payment between 2 methods
        v_payment_amount := round((v_remaining_amount * (0.3 + random() * 0.4))::numeric, 2);

        -- First payment - weighted random method
        v_payment_method := CASE
          WHEN random() < 0.45 THEN 'pix'
          WHEN random() < 0.70 THEN 'credit'
          WHEN random() < 0.90 THEN 'debit'
          ELSE 'cash'
        END;

        INSERT INTO api.payments (order_id, method, amount, created_at)
        VALUES (
          v_order.id,
          v_payment_method,
          v_payment_amount,
          v_order.created_at + (v_items_count * 2 || ' minutes')::interval
        );
        v_total_payments := v_total_payments + 1;

        -- Second payment - remaining amount
        v_remaining_amount := v_order_total - v_payment_amount;

        v_payment_method := CASE
          WHEN random() < 0.50 THEN 'cash'
          WHEN random() < 0.80 THEN 'debit'
          ELSE 'credit'
        END;

        INSERT INTO api.payments (order_id, method, amount, created_at)
        VALUES (
          v_order.id,
          v_payment_method,
          v_remaining_amount,
          v_order.created_at + (v_items_count * 2 + 1 || ' minutes')::interval
        );
        v_total_payments := v_total_payments + 1;
      ELSE
        -- Single payment - weighted by Brazilian market distribution
        v_payment_method := CASE
          WHEN random() < 0.45 THEN 'pix'      -- 45%
          WHEN random() < 0.70 THEN 'credit'   -- 25%
          WHEN random() < 0.90 THEN 'debit'    -- 20%
          WHEN random() < 0.98 THEN 'cash'     -- 8%
          ELSE 'voucher'                        -- 2%
        END;

        INSERT INTO api.payments (order_id, method, amount, created_at)
        VALUES (
          v_order.id,
          v_payment_method,
          v_order_total,
          v_order.created_at + (v_items_count * 2 || ' minutes')::interval
        );
        v_total_payments := v_total_payments + 1;
      END IF;
    END IF;

    v_total_orders := v_total_orders + 1;
  END LOOP;

  -- Update usage counts for items based on order items
  UPDATE api.items i
  SET usage_count = (
    SELECT COALESCE(SUM(oi.quantity), 0)
    FROM api.order_items oi
    JOIN api.orders o ON oi.order_id = o.id
    WHERE oi.item_id = i.id AND o.user_id = v_user_id AND o.status = 'closed'
  )
  WHERE i.user_id = v_user_id AND i.type = 'merchandise';

  RAISE NOTICE 'Processed % orders with % items and % payments',
    v_total_orders, v_total_items, v_total_payments;
END $$;
