// Report Queries for RF08

import { supabase } from "./supabase";
import type {
  DateRange,
  StockValueItem,
  LowStockItem,
} from "./types/report";
import type { OrderWithDetails } from "./types/order";

/**
 * Fetch closed orders within date range for sales summary aggregation
 * Used for client-side aggregation of sales data
 */
export async function fetchClosedOrdersForReport(
  dateRange: DateRange,
): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(
        *,
        item:items(*)
      ),
      payments(*)
    `,
    )
    .eq("status", "closed")
    .gte("closed_at", dateRange.from.toISOString())
    .lte("closed_at", dateRange.to.toISOString())
    .order("closed_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Type for Supabase response with joined category
interface ItemWithCategory {
  id: string;
  name: string;
  type: "merchandise" | "supply";
  stock_quantity: number;
  price: number;
  category: { name: string } | null;
}

/**
 * Fetch all active items with stock for stock value calculation
 * Includes both merchandise and supplies
 */
export async function fetchItemsForStockValue(): Promise<StockValueItem[]> {
  const { data, error } = await supabase
    .from("items")
    .select(
      `
      id,
      name,
      type,
      stock_quantity,
      price,
      category:categories(name)
    `,
    )
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return (
    (data as unknown as ItemWithCategory[])?.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      item_type: item.type,
      category_name: item.category?.name || null,
      stock_quantity: item.stock_quantity,
      unit_price: item.price,
      total_value: item.stock_quantity * item.price,
    })) || []
  );
}

/**
 * Fetch low stock items from existing view
 * Reuses v_low_stock_items view created for RF07
 */
export async function fetchLowStockItems(): Promise<LowStockItem[]> {
  const { data, error } = await supabase
    .from("v_low_stock_items")
    .select("*")
    .order("stock_quantity", { ascending: true });

  if (error) throw error;
  return data || [];
}
