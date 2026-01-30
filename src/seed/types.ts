// Seed-specific type definitions

import type { ItemType } from "@/lib/types/stock";
import type { OrderStatus, PaymentMethod } from "@/lib/types/order";

/**
 * Seed profile sizes
 */
export type SeedProfileSize = "minimal" | "small" | "medium" | "large";

/**
 * Seed profile with configuration
 */
export interface SeedProfile {
  name: string;
  description: string;
  config: SeedConfig;
}

/**
 * Complete seed configuration
 */
export interface SeedConfig {
  // Category configuration
  categories: {
    count: number;
  };

  // Item configuration
  items: {
    count: number;
    merchandisePercentage: number; // 0-100
    lowStockPercentage: number; // 0-100 (items at low/critical stock)
  };

  // Order configuration
  orders: {
    openCount: number;
    closedCount: number;
    cancelledCount: number;
    itemsPerOrderRange: { min: number; max: number };
    quantityPerItemRange: { min: number; max: number };
    customizationPercentage: number; // 0-100 (orders with customizations)
    dateRangeDays: number; // Orders span this many days into the past
  };

  // Payment configuration (for closed orders)
  payments: {
    multiPaymentPercentage: number; // 0-100 (orders with split payments)
    methodWeights: Record<PaymentMethod, number>; // Weighted distribution
  };
}

/**
 * Context passed to factories during seeding
 */
export interface SeedContext {
  userId: string;
  categories: Array<{ id: string; name: string }>;
  items: Array<{
    id: string;
    name: string;
    type: ItemType;
    price: number;
    stock_quantity: number;
  }>;
  orders: Array<{ id: string; status: OrderStatus; total_amount: number }>;
}

/**
 * Factory generation options
 */
export interface FactoryOptions<T = unknown> {
  count?: number;
  overrides?: Partial<T>;
}

/**
 * Result of a seeding operation
 */
export interface SeedResult {
  success: boolean;
  duration: number;
  counts: {
    categories: number;
    items: number;
    orders: number;
    orderItems: number;
    payments: number;
    stockMovements: number;
  };
  errors?: string[];
}
