// Report Types for RF08

export interface DateRange {
  from: Date;
  to: Date;
}

export type DatePreset = "today" | "this_week" | "this_month" | "last_30_days" | "custom";

// Sales Summary Report
export interface SalesSummaryData {
  total_revenue: number;
  order_count: number;
  items_sold: number;
  payment_breakdown: PaymentBreakdown[];
}

export interface PaymentBreakdown {
  method: string;
  amount: number;
  count: number;
}

// Top Selling Items Report (from database view)
export interface TopSellingItem {
  item_id: string;
  item_name: string;
  current_price: number;
  category_name: string | null;
  total_quantity_sold: number;
  total_revenue: number;
  order_count: number;
  last_sold_at: string;
}

// Stock Value Report
export interface StockValueItem {
  item_id: string;
  item_name: string;
  item_type: "merchandise" | "supply";
  category_name: string | null;
  stock_quantity: number;
  unit_price: number;
  total_value: number;
}

export interface StockValueSummary {
  total_value: number;
  merchandise_value: number;
  supply_value: number;
  item_count: number;
}

// Low Stock Alert (reuses existing view)
export interface LowStockItem {
  item_id: string;
  item_name: string;
  stock_quantity: number;
  critical_threshold: number;
  low_threshold: number;
  status: "critical" | "low" | "ok";
}

// Export types
export type ExportFormat = "csv" | "print";
