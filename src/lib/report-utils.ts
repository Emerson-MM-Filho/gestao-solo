// Report Utilities for RF08

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";
import type {
  DateRange,
  DatePreset,
  SalesSummaryData,
  PaymentBreakdown,
  TopSellingItem,
  StockValueSummary,
  StockValueItem,
} from "./types/report";
import type { OrderWithDetails, OrderItem, Payment } from "./types/order";

/**
 * Get date range for preset options
 */
export function getDateRangeForPreset(preset: DatePreset): DateRange {
  const now = new Date();

  switch (preset) {
    case "today":
      return {
        from: startOfDay(now),
        to: endOfDay(now),
      };
    case "this_week":
      return {
        from: startOfWeek(now, { weekStartsOn: 0 }), // Sunday
        to: endOfWeek(now, { weekStartsOn: 0 }),
      };
    case "this_month":
      return {
        from: startOfMonth(now),
        to: endOfMonth(now),
      };
    case "last_30_days":
      return {
        from: startOfDay(subDays(now, 30)),
        to: endOfDay(now),
      };
    default:
      // Custom - return last 30 days as default
      return {
        from: startOfDay(subDays(now, 30)),
        to: endOfDay(now),
      };
  }
}

/**
 * Aggregate closed orders into sales summary
 * Client-side aggregation for RF08 sales summary report
 */
export function aggregateSalesSummary(orders: OrderWithDetails[]): SalesSummaryData {
  const total_revenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const order_count = orders.length;

  // Count total items sold
  const items_sold = orders.reduce((sum, order) => {
    const orderItemCount =
      order.items?.reduce((itemSum: number, item: OrderItem) => itemSum + item.quantity, 0) || 0;
    return sum + orderItemCount;
  }, 0);

  // Aggregate payment breakdown
  const paymentMap = new Map<string, { amount: number; count: number }>();

  orders.forEach((order) => {
    order.payments?.forEach((payment: Payment) => {
      const existing = paymentMap.get(payment.method) || { amount: 0, count: 0 };
      paymentMap.set(payment.method, {
        amount: existing.amount + payment.amount,
        count: existing.count + 1,
      });
    });
  });

  const payment_breakdown: PaymentBreakdown[] = Array.from(
    paymentMap.entries(),
  ).map(([method, data]) => ({
    method,
    amount: data.amount,
    count: data.count,
  }));

  return {
    total_revenue,
    order_count,
    items_sold,
    payment_breakdown,
  };
}

/**
 * Aggregate top selling items from closed orders within date range
 * Client-side aggregation ensures accurate totals for the selected period
 */
export function aggregateTopSellingItems(
  orders: OrderWithDetails[],
): TopSellingItem[] {
  const itemMap = new Map<
    string,
    {
      item_id: string;
      item_name: string;
      current_price: number;
      category_name: string | null;
      total_quantity_sold: number;
      total_revenue: number;
      order_count: number;
      last_sold_at: string;
    }
  >();

  orders.forEach((order) => {
    order.items?.forEach((orderItem: OrderItem) => {
      const existing = itemMap.get(orderItem.item_id);
      const revenue = orderItem.quantity * orderItem.unit_price;

      if (existing) {
        existing.total_quantity_sold += orderItem.quantity;
        existing.total_revenue += revenue;
        existing.order_count += 1;
        // Update last_sold_at if this order is more recent
        if (order.closed_at && order.closed_at > existing.last_sold_at) {
          existing.last_sold_at = order.closed_at;
        }
      } else {
        itemMap.set(orderItem.item_id, {
          item_id: orderItem.item_id,
          item_name: orderItem.item?.name || "Unknown",
          current_price: orderItem.item?.price || orderItem.unit_price,
          category_name: orderItem.item?.category?.name || null,
          total_quantity_sold: orderItem.quantity,
          total_revenue: revenue,
          order_count: 1,
          last_sold_at: order.closed_at || order.created_at,
        });
      }
    });
  });

  // Convert to array and sort by revenue
  return Array.from(itemMap.values()).sort(
    (a, b) => b.total_revenue - a.total_revenue,
  );
}

/**
 * Calculate stock value summary
 * Client-side aggregation for RF08 stock value report
 */
export function calculateStockValueSummary(
  items: StockValueItem[],
): StockValueSummary {
  const total_value = items.reduce((sum, item) => sum + item.total_value, 0);

  const merchandise_value = items
    .filter((item) => item.item_type === "merchandise")
    .reduce((sum, item) => sum + item.total_value, 0);

  const supply_value = items
    .filter((item) => item.item_type === "supply")
    .reduce((sum, item) => sum + item.total_value, 0);

  return {
    total_value,
    merchandise_value,
    supply_value,
    item_count: items.length,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
