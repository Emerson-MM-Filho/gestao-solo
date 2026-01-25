-- Stock Management Schema Migration
-- Creates tables for categories, items, stock movements, and supporting infrastructure
-- Implements RF04-RF12 from SRS.md

-- =======================
-- SCHEMA SETUP
-- =======================

-- Create api schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Grant usage on api schema
GRANT USAGE ON SCHEMA api TO anon, authenticated, service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- =======================
-- TABLES
-- =======================

-- Categories Table
CREATE TABLE IF NOT EXISTS api.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT categories_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT categories_display_order_non_negative CHECK (display_order >= 0),
  CONSTRAINT categories_unique_name_per_user UNIQUE (user_id, name)
);

-- Items Table
CREATE TABLE IF NOT EXISTS api.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES api.categories(id) ON DELETE SET NULL,

  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL,

  price NUMERIC(10, 2) NOT NULL,

  stock_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  critical_threshold INTEGER NOT NULL DEFAULT 2,
  low_threshold INTEGER NOT NULL DEFAULT 5,

  is_favorite BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT items_type_valid CHECK (type IN ('merchandise', 'supply')),
  CONSTRAINT items_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT items_price_positive CHECK (price > 0),
  CONSTRAINT items_stock_non_negative CHECK (stock_quantity >= 0),
  CONSTRAINT items_thresholds_non_negative CHECK (critical_threshold >= 0 AND low_threshold >= 0),
  CONSTRAINT items_threshold_order CHECK (critical_threshold <= low_threshold),
  CONSTRAINT items_usage_count_non_negative CHECK (usage_count >= 0)
);

-- Stock Movements Table (Immutable audit trail)
CREATE TABLE IF NOT EXISTS api.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES api.items(id) ON DELETE CASCADE,

  type VARCHAR(20) NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  balance_after NUMERIC(10, 2) NOT NULL,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT stock_movements_type_valid CHECK (type IN ('entry', 'manual_exit', 'sale', 'reversal')),
  CONSTRAINT stock_movements_quantity_positive CHECK (quantity > 0),
  CONSTRAINT stock_movements_balance_non_negative CHECK (balance_after >= 0)
);

-- =======================
-- INDEXES
-- =======================

-- Categories indexes
CREATE INDEX idx_categories_user_id ON api.categories(user_id);
CREATE INDEX idx_categories_display_order ON api.categories(user_id, display_order);

-- Items indexes
CREATE INDEX idx_items_user_id ON api.items(user_id);
CREATE INDEX idx_items_category_id ON api.items(category_id);
CREATE INDEX idx_items_user_active ON api.items(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_items_user_favorite ON api.items(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_items_user_usage ON api.items(user_id, usage_count DESC);
CREATE INDEX idx_items_name_search ON api.items USING gin(to_tsvector('simple', name));
CREATE INDEX idx_items_stock_status ON api.items(user_id, stock_quantity, critical_threshold, low_threshold) WHERE is_active = true;

-- Stock movements indexes
CREATE INDEX idx_stock_movements_item_id ON api.stock_movements(item_id);
CREATE INDEX idx_stock_movements_created_at ON api.stock_movements(item_id, created_at DESC);
CREATE INDEX idx_stock_movements_type ON api.stock_movements(type);

-- =======================
-- VIEWS
-- =======================

-- Low Stock Alerts View (RF07, RF09)
CREATE OR REPLACE VIEW api.v_low_stock_items AS
SELECT
  i.id AS item_id,
  i.name AS item_name,
  i.stock_quantity,
  i.critical_threshold,
  i.low_threshold,
  CASE
    WHEN i.stock_quantity <= i.critical_threshold THEN 'critical'
    WHEN i.stock_quantity <= i.low_threshold THEN 'low'
    ELSE 'ok'
  END AS status
FROM api.items i
WHERE i.is_active = true
  AND i.stock_quantity <= i.low_threshold
ORDER BY
  CASE
    WHEN i.stock_quantity <= i.critical_threshold THEN 1
    WHEN i.stock_quantity <= i.low_threshold THEN 2
    ELSE 3
  END,
  i.stock_quantity ASC;

-- =======================
-- ROW LEVEL SECURITY
-- =======================

-- Enable RLS on all tables
ALTER TABLE api.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.stock_movements ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view their own categories"
  ON api.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON api.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON api.categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON api.categories FOR DELETE
  USING (auth.uid() = user_id);

-- Items policies
CREATE POLICY "Users can view their own items"
  ON api.items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON api.items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON api.items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON api.items FOR DELETE
  USING (auth.uid() = user_id);

-- Stock movements policies (ownership via items)
CREATE POLICY "Users can view movements for their items"
  ON api.stock_movements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM api.items
      WHERE items.id = stock_movements.item_id
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert movements for their items"
  ON api.stock_movements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM api.items
      WHERE items.id = stock_movements.item_id
      AND items.user_id = auth.uid()
    )
  );

-- Note: No UPDATE/DELETE policies on stock_movements - immutable audit trail

-- =======================
-- TRIGGERS
-- =======================

-- Automatic updated_at timestamp function
CREATE OR REPLACE FUNCTION api.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to categories
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON api.categories
  FOR EACH ROW
  EXECUTE FUNCTION api.update_updated_at_column();

-- Apply trigger to items
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON api.items
  FOR EACH ROW
  EXECUTE FUNCTION api.update_updated_at_column();
