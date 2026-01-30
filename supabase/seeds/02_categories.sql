-- Seed Categories
-- Creates 8 realistic food and beverage categories

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get test user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'test@example.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Test user not found. Run 01_test_user.sql first.';
  END IF;

  -- Delete existing categories for idempotency
  DELETE FROM api.categories WHERE user_id = v_user_id;

  -- Insert categories
  INSERT INTO api.categories (id, user_id, name, display_order, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_user_id, 'Bebidas Quentes', 1, now(), now()),
    (gen_random_uuid(), v_user_id, 'Bebidas Frias', 2, now(), now()),
    (gen_random_uuid(), v_user_id, 'Cafés Especiais', 3, now(), now()),
    (gen_random_uuid(), v_user_id, 'Salgados', 4, now(), now()),
    (gen_random_uuid(), v_user_id, 'Doces', 5, now(), now()),
    (gen_random_uuid(), v_user_id, 'Refeições', 6, now(), now()),
    (gen_random_uuid(), v_user_id, 'Sobremesas', 7, now(), now()),
    (gen_random_uuid(), v_user_id, 'Insumos', 8, now(), now());

  RAISE NOTICE 'Created 8 categories for user %', v_user_id;
END $$;
