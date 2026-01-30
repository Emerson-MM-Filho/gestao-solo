-- Reports Views Migration
-- Creates view for RF08 top selling items report
-- Version 1.3 - January 2026

-- Top Selling Items View (RF08)
-- Aggregates sales data from closed orders to show items by quantity and revenue
-- SECURITY INVOKER ensures RLS policies are enforced
CREATE OR REPLACE VIEW api.v_top_selling_items
WITH (security_invoker = true) AS
SELECT
  i.id AS item_id,
  i.name AS item_name,
  i.price AS current_price,
  c.name AS category_name,
  SUM(oi.quantity) AS total_quantity_sold,
  SUM(oi.quantity * oi.unit_price) AS total_revenue,
  COUNT(DISTINCT o.id) AS order_count,
  MAX(o.closed_at) AS last_sold_at
FROM api.items i
LEFT JOIN api.order_items oi ON oi.item_id = i.id
LEFT JOIN api.orders o ON o.id = oi.order_id AND o.status = 'closed'
LEFT JOIN api.categories c ON c.id = i.category_id
WHERE i.is_active = true
GROUP BY i.id, i.name, i.price, c.name
HAVING COUNT(DISTINCT CASE WHEN o.status = 'closed' THEN o.id END) > 0
ORDER BY total_revenue DESC, total_quantity_sold DESC;

-- Grant SELECT permission to authenticated users (RLS will filter by user_id)
GRANT SELECT ON api.v_top_selling_items TO authenticated;
