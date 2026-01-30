// Order Management Type Definitions

import type { Item } from "./stock";

export const OrderStatusOptions = {
  OPEN: "open",
  CLOSED: "closed",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus =
  (typeof OrderStatusOptions)[keyof typeof OrderStatusOptions];

export const PaymentMethodOptions = {
  PIX: "pix",
  CREDIT: "credit",
  DEBIT: "debit",
  CASH: "cash",
  VOUCHER: "voucher",
} as const;

export type PaymentMethod =
  (typeof PaymentMethodOptions)[keyof typeof PaymentMethodOptions];

export interface Order {
  id: string;
  user_id: string;
  display_id: string;
  customer_name: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  closed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  stock_returned: boolean | null;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  customizations: string | null;
  created_at: string;
  item?: Item; // Joined from items table
}

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  created_at: string;
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  payments: Payment[];
}

export interface CreateOrderData {
  customer_name: string;
}

export interface AddItemToOrderData {
  item_id: string;
  quantity: number;
  customizations: string | null;
}

export interface PaymentData {
  method: PaymentMethod;
  amount: number;
}

export interface CloseOrderData {
  payments: PaymentData[];
}

export interface CancelOrderData {
  return_stock: boolean;
  reason: string | null;
}

export type OrderSortOption = "date" | "customer" | "total";
