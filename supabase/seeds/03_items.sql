-- Seed Items
-- Creates 65 realistic items across categories
-- 70% merchandise (sellable), 30% supplies
-- Mix of stock levels: 20% low, 30% medium, 50% healthy

DO $$
DECLARE
  v_user_id UUID;
  v_cat_bebidas_quentes UUID;
  v_cat_bebidas_frias UUID;
  v_cat_cafes_especiais UUID;
  v_cat_salgados UUID;
  v_cat_doces UUID;
  v_cat_refeicoes UUID;
  v_cat_sobremesas UUID;
  v_cat_insumos UUID;
BEGIN
  -- Get test user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'test@example.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Test user not found. Run 01_test_user.sql first.';
  END IF;

  -- Get category IDs
  SELECT id INTO v_cat_bebidas_quentes FROM api.categories WHERE user_id = v_user_id AND name = 'Bebidas Quentes';
  SELECT id INTO v_cat_bebidas_frias FROM api.categories WHERE user_id = v_user_id AND name = 'Bebidas Frias';
  SELECT id INTO v_cat_cafes_especiais FROM api.categories WHERE user_id = v_user_id AND name = 'Cafés Especiais';
  SELECT id INTO v_cat_salgados FROM api.categories WHERE user_id = v_user_id AND name = 'Salgados';
  SELECT id INTO v_cat_doces FROM api.categories WHERE user_id = v_user_id AND name = 'Doces';
  SELECT id INTO v_cat_refeicoes FROM api.categories WHERE user_id = v_user_id AND name = 'Refeições';
  SELECT id INTO v_cat_sobremesas FROM api.categories WHERE user_id = v_user_id AND name = 'Sobremesas';
  SELECT id INTO v_cat_insumos FROM api.categories WHERE user_id = v_user_id AND name = 'Insumos';

  -- Delete existing items for idempotency
  DELETE FROM api.items WHERE user_id = v_user_id;

  -- Insert items
  -- Format: (id, user_id, category_id, name, type, price, stock_quantity, critical_threshold, low_threshold, is_favorite, usage_count)

  -- Bebidas Quentes (8 items)
  INSERT INTO api.items (id, user_id, category_id, name, type, price, stock_quantity, critical_threshold, low_threshold, is_favorite, usage_count, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_user_id, v_cat_bebidas_quentes, 'Café Expresso', 'merchandise', 4.50, 45, 5, 10, true, 89, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_quentes, 'Café com Leite', 'merchandise', 5.50, 38, 5, 10, true, 67, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_quentes, 'Cappuccino', 'merchandise', 7.00, 32, 4, 8, false, 54, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_quentes, 'Chocolate Quente', 'merchandise', 8.50, 18, 3, 6, false, 34, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_quentes, 'Chá Verde', 'merchandise', 6.00, 22, 3, 7, false, 28, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_quentes, 'Chá Preto', 'merchandise', 6.00, 19, 3, 7, false, 21, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_quentes, 'Chá de Camomila', 'merchandise', 6.50, 15, 2, 5, false, 16, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_quentes, 'Café Pingado', 'merchandise', 4.00, 28, 4, 8, false, 42, now(), now()),

  -- Bebidas Frias (10 items)
    (gen_random_uuid(), v_user_id, v_cat_bebidas_frias, 'Suco de Laranja', 'merchandise', 8.00, 25, 3, 8, true, 72, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_frias, 'Suco de Limão', 'merchandise', 7.50, 20, 3, 7, false, 48, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_frias, 'Suco de Morango', 'merchandise', 9.00, 12, 2, 6, false, 36, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_frias, 'Refrigerante Lata', 'merchandise', 5.00, 48, 10, 20, true, 91, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_frias, 'Água Mineral', 'merchandise', 3.00, 65, 15, 30, false, 78, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_frias, 'Água com Gás', 'merchandise', 3.50, 34, 8, 15, false, 42, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_frias, 'Chá Gelado', 'merchandise', 7.00, 18, 3, 8, false, 29, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_frias, 'Limonada Suíça', 'merchandise', 8.50, 14, 2, 6, false, 33, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_frias, 'Smoothie de Frutas', 'merchandise', 12.00, 8, 2, 5, false, 19, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_bebidas_frias, 'Milkshake', 'merchandise', 13.50, 6, 1, 4, false, 24, now(), now()),

  -- Cafés Especiais (6 items)
    (gen_random_uuid(), v_user_id, v_cat_cafes_especiais, 'Café Latte', 'merchandise', 9.00, 28, 4, 8, true, 61, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_cafes_especiais, 'Café Mocha', 'merchandise', 10.50, 22, 3, 7, false, 38, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_cafes_especiais, 'Café Macchiato', 'merchandise', 8.50, 19, 3, 6, false, 31, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_cafes_especiais, 'Café Affogato', 'merchandise', 12.00, 11, 2, 5, false, 17, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_cafes_especiais, 'Cold Brew', 'merchandise', 11.00, 15, 2, 6, false, 26, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_cafes_especiais, 'Café Irlandês', 'merchandise', 15.00, 4, 1, 3, false, 9, now(), now()),

  -- Salgados (12 items)
    (gen_random_uuid(), v_user_id, v_cat_salgados, 'Pão de Queijo', 'merchandise', 4.50, 42, 8, 15, true, 95, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_salgados, 'Coxinha', 'merchandise', 6.00, 38, 7, 14, true, 84, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_salgados, 'Empada', 'merchandise', 5.50, 31, 6, 12, false, 56, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_salgados, 'Pastel', 'merchandise', 7.00, 28, 5, 10, false, 47, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_salgados, 'Esfiha', 'merchandise', 5.00, 34, 6, 13, false, 51, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_salgados, 'Croissant', 'merchandise', 8.00, 22, 4, 8, false, 39, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_salgados, 'Sanduíche Natural', 'merchandise', 12.00, 18, 3, 7, false, 42, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_salgados, 'Torrada', 'merchandise', 6.50, 25, 4, 9, false, 33, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_salgados, 'Quiche', 'merchandise', 9.50, 14, 2, 6, false, 28, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_salgados, 'Wrap', 'merchandise', 13.00, 11, 2, 5, false, 22, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_salgados, 'Tapioca', 'merchandise', 10.00, 16, 3, 7, false, 31, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_salgados, 'Crepioca', 'merchandise', 11.00, 9, 2, 5, false, 18, now(), now()),

  -- Doces (8 items)
    (gen_random_uuid(), v_user_id, v_cat_doces, 'Bolo de Chocolate', 'merchandise', 8.00, 24, 4, 8, true, 68, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_doces, 'Bolo de Cenoura', 'merchandise', 7.50, 19, 3, 7, false, 52, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_doces, 'Brownie', 'merchandise', 9.00, 15, 2, 6, false, 44, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_doces, 'Cookie', 'merchandise', 4.50, 38, 7, 15, false, 61, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_doces, 'Muffin', 'merchandise', 6.50, 22, 4, 9, false, 37, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_doces, 'Croissant de Chocolate', 'merchandise', 9.50, 12, 2, 5, false, 29, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_doces, 'Pão de Mel', 'merchandise', 5.50, 28, 5, 11, false, 41, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_doces, 'Torta de Limão', 'merchandise', 11.00, 8, 1, 4, false, 23, now(), now()),

  -- Refeições (6 items)
    (gen_random_uuid(), v_user_id, v_cat_refeicoes, 'Prato Feito', 'merchandise', 25.00, 15, 2, 6, false, 34, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_refeicoes, 'Salada Caesar', 'merchandise', 22.00, 12, 2, 5, false, 27, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_refeicoes, 'Hambúrguer Artesanal', 'merchandise', 28.00, 8, 1, 4, false, 31, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_refeicoes, 'Pasta ao Molho', 'merchandise', 26.00, 10, 2, 5, false, 22, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_refeicoes, 'Omelete', 'merchandise', 18.00, 14, 2, 6, false, 29, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_refeicoes, 'Bowl de Açaí', 'merchandise', 20.00, 9, 1, 4, false, 36, now(), now()),

  -- Sobremesas (5 items)
    (gen_random_uuid(), v_user_id, v_cat_sobremesas, 'Pudim', 'merchandise', 12.00, 11, 2, 5, false, 42, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_sobremesas, 'Petit Gateau', 'merchandise', 16.00, 6, 1, 3, false, 28, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_sobremesas, 'Mousse de Maracujá', 'merchandise', 11.00, 9, 1, 4, false, 31, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_sobremesas, 'Cheesecake', 'merchandise', 14.00, 7, 1, 3, false, 26, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_sobremesas, 'Sorvete 2 Bolas', 'merchandise', 10.00, 18, 3, 7, false, 38, now(), now()),

  -- Insumos (10 items - supplies, not sold directly)
    (gen_random_uuid(), v_user_id, v_cat_insumos, 'Leite Integral 1L', 'supply', 5.50, 28, 5, 10, false, 0, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_insumos, 'Açúcar 1kg', 'supply', 4.00, 15, 2, 5, false, 0, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_insumos, 'Café em Pó 500g', 'supply', 18.00, 8, 1, 3, false, 0, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_insumos, 'Guardanapo Pacote', 'supply', 12.00, 22, 4, 8, false, 0, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_insumos, 'Copo Descartável 200ml', 'supply', 15.00, 45, 8, 15, false, 0, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_insumos, 'Tampa para Copo', 'supply', 10.00, 38, 7, 14, false, 0, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_insumos, 'Papel Toalha', 'supply', 8.00, 19, 3, 7, false, 0, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_insumos, 'Sabão Detergente', 'supply', 6.50, 12, 2, 5, false, 0, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_insumos, 'Canudo Plástico', 'supply', 7.00, 31, 5, 10, false, 0, now(), now()),
    (gen_random_uuid(), v_user_id, v_cat_insumos, 'Embalagem para Viagem', 'supply', 20.00, 24, 4, 9, false, 0, now(), now());

  RAISE NOTICE 'Created 65 items for user %', v_user_id;
END $$;
