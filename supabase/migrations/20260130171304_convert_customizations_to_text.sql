-- Convert customizations from JSONB array to TEXT
-- This simplifies the data model: customizations apply to all units of an order_item
-- Users can add the same product multiple times with different customizations

BEGIN;

-- Step 1: Add temporary text column
ALTER TABLE api.order_items
ADD COLUMN customizations_new TEXT;

-- Step 2: Migrate existing data
-- Convert JSONB object {notes: "text"} to TEXT "text"
UPDATE api.order_items
SET customizations_new = customizations->>'notes'
WHERE customizations IS NOT NULL
  AND jsonb_typeof(customizations) = 'object';

-- Step 3: Drop old column
ALTER TABLE api.order_items
DROP COLUMN customizations;

-- Step 4: Rename new column
ALTER TABLE api.order_items
RENAME COLUMN customizations_new TO customizations;

-- Step 5: Update column comment
COMMENT ON COLUMN api.order_items.customizations IS
  'Customizations for this order item (all units). Multiple customizations separated by newlines. Can be null.';

COMMIT;
