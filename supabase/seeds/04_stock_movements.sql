-- Seed Stock Movements
-- Creates 250+ historical stock movements over 90 days
-- Types: entry (purchases), manual_exit (waste/loss), sale, reversal

DO $$
DECLARE
  v_user_id UUID;
  v_item RECORD;
  v_movement_date TIMESTAMPTZ;
  v_quantity NUMERIC;
  v_current_balance NUMERIC;
  v_days_ago INTEGER;
  v_entry_count INTEGER := 0;
  v_exit_count INTEGER := 0;
BEGIN
  -- Get test user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'test@example.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Test user not found. Run 01_test_user.sql first.';
  END IF;

  -- Delete existing stock movements for idempotency
  DELETE FROM api.stock_movements sm
  USING api.items i
  WHERE sm.item_id = i.id AND i.user_id = v_user_id;

  -- Generate stock movements for each item
  FOR v_item IN
    SELECT id, name, type, stock_quantity
    FROM api.items
    WHERE user_id = v_user_id AND type = 'merchandise'
    ORDER BY random()
  LOOP
    v_current_balance := 0;

    -- Generate 3-6 entry movements over 90 days (purchases)
    FOR i IN 1..(3 + floor(random() * 4)::int) LOOP
      v_days_ago := floor(random() * 90)::int;
      v_movement_date := now() - (v_days_ago || ' days')::interval - (floor(random() * 24)::int || ' hours')::interval;
      v_quantity := (10 + floor(random() * 40))::numeric; -- 10-50 units per purchase
      v_current_balance := v_current_balance + v_quantity;

      INSERT INTO api.stock_movements (item_id, type, quantity, balance_after, created_at, notes)
      VALUES (
        v_item.id,
        'entry',
        v_quantity,
        v_current_balance,
        v_movement_date,
        'Stock purchase'
      );

      v_entry_count := v_entry_count + 1;
    END LOOP;

    -- Generate 1-3 manual exit movements (waste, loss)
    FOR i IN 1..(1 + floor(random() * 3)::int) LOOP
      v_days_ago := floor(random() * 60)::int;
      v_movement_date := now() - (v_days_ago || ' days')::interval - (floor(random() * 24)::int || ' hours')::interval;
      v_quantity := (1 + floor(random() * 5))::numeric; -- 1-5 units lost

      -- Only create exit if we have stock
      IF v_current_balance >= v_quantity THEN
        v_current_balance := v_current_balance - v_quantity;

        INSERT INTO api.stock_movements (item_id, type, quantity, balance_after, created_at, notes)
        VALUES (
          v_item.id,
          'manual_exit',
          v_quantity,
          v_current_balance,
          v_movement_date,
          CASE
            WHEN random() < 0.5 THEN 'Spoilage'
            ELSE 'Damage'
          END
        );

        v_exit_count := v_exit_count + 1;
      END IF;
    END LOOP;

    -- Adjust final balance to match item's current stock_quantity
    -- This ensures consistency between items table and stock movements
    IF v_current_balance != v_item.stock_quantity THEN
      v_movement_date := now() - (floor(random() * 5)::int || ' days')::interval;

      IF v_current_balance < v_item.stock_quantity THEN
        -- Need to add stock
        v_quantity := v_item.stock_quantity - v_current_balance;
        INSERT INTO api.stock_movements (item_id, type, quantity, balance_after, created_at, notes)
        VALUES (
          v_item.id,
          'entry',
          v_quantity,
          v_item.stock_quantity,
          v_movement_date,
          'Stock adjustment'
        );
        v_entry_count := v_entry_count + 1;
      ELSE
        -- Need to remove stock
        v_quantity := v_current_balance - v_item.stock_quantity;
        INSERT INTO api.stock_movements (item_id, type, quantity, balance_after, created_at, notes)
        VALUES (
          v_item.id,
          'manual_exit',
          v_quantity,
          v_item.stock_quantity,
          v_movement_date,
          'Stock adjustment'
        );
        v_exit_count := v_exit_count + 1;
      END IF;
    END IF;
  END LOOP;

  -- Generate movements for supplies too (fewer movements)
  FOR v_item IN
    SELECT id, name, type, stock_quantity
    FROM api.items
    WHERE user_id = v_user_id AND type = 'supply'
    ORDER BY random()
  LOOP
    v_current_balance := 0;

    -- Generate 2-4 entry movements for supplies
    FOR i IN 1..(2 + floor(random() * 3)::int) LOOP
      v_days_ago := floor(random() * 90)::int;
      v_movement_date := now() - (v_days_ago || ' days')::interval;
      v_quantity := (5 + floor(random() * 20))::numeric; -- 5-25 units
      v_current_balance := v_current_balance + v_quantity;

      INSERT INTO api.stock_movements (item_id, type, quantity, balance_after, created_at, notes)
      VALUES (
        v_item.id,
        'entry',
        v_quantity,
        v_current_balance,
        v_movement_date,
        'Supply purchase'
      );

      v_entry_count := v_entry_count + 1;
    END LOOP;

    -- Generate 2-5 manual exits for supply usage
    FOR i IN 1..(2 + floor(random() * 4)::int) LOOP
      v_days_ago := floor(random() * 60)::int;
      v_movement_date := now() - (v_days_ago || ' days')::interval;
      v_quantity := (1 + floor(random() * 8))::numeric; -- 1-8 units used

      IF v_current_balance >= v_quantity THEN
        v_current_balance := v_current_balance - v_quantity;

        INSERT INTO api.stock_movements (item_id, type, quantity, balance_after, created_at, notes)
        VALUES (
          v_item.id,
          'manual_exit',
          v_quantity,
          v_current_balance,
          v_movement_date,
          'Supply usage'
        );

        v_exit_count := v_exit_count + 1;
      END IF;
    END LOOP;

    -- Adjust to match current stock
    IF v_current_balance != v_item.stock_quantity THEN
      v_movement_date := now() - (floor(random() * 3)::int || ' days')::interval;

      IF v_current_balance < v_item.stock_quantity THEN
        v_quantity := v_item.stock_quantity - v_current_balance;
        INSERT INTO api.stock_movements (item_id, type, quantity, balance_after, created_at, notes)
        VALUES (
          v_item.id,
          'entry',
          v_quantity,
          v_item.stock_quantity,
          v_movement_date,
          'Stock adjustment'
        );
        v_entry_count := v_entry_count + 1;
      ELSE
        v_quantity := v_current_balance - v_item.stock_quantity;
        INSERT INTO api.stock_movements (item_id, type, quantity, balance_after, created_at, notes)
        VALUES (
          v_item.id,
          'manual_exit',
          v_quantity,
          v_item.stock_quantity,
          v_movement_date,
          'Stock adjustment'
        );
        v_exit_count := v_exit_count + 1;
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE 'Created % entry movements and % exit movements', v_entry_count, v_exit_count;
END $$;
