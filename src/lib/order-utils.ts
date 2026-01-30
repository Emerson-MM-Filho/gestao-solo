// Order Domain Utilities

import type { OrderItem, OrderStatus, PaymentData } from "./types/order";

/**
 * Calculate total amount from order items
 */
export function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => {
    return sum + item.quantity * item.unit_price;
  }, 0);
}

/**
 * Check if order can be edited
 */
export function canEditOrder(status: OrderStatus): boolean {
  return status === "open";
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return status !== "cancelled";
}

/**
 * Format elapsed time since order creation
 * Example: "5 min", "2h 30min", "3 days"
 */
export function formatOrderAge(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}`;
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }

  return `${minutes} min`;
}

/**
 * Get order status badge variant for UI
 */
export function getOrderStatusVariant(
  status: OrderStatus,
): "default" | "secondary" | "destructive" {
  switch (status) {
    case "open":
      return "default";
    case "closed":
      return "secondary";
    case "cancelled":
      return "destructive";
  }
}

/**
 * Get payment method display name
 */
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    pix: "PIX",
    credit: "Credit Card",
    debit: "Debit Card",
    cash: "Cash",
  };

  return labels[method] || method;
}

/**
 * Group payments by method with totals
 */
export function groupPaymentsByMethod(
  payments: PaymentData[],
): Array<{
  method: string;
  amount: number;
  count: number;
}> {
  const grouped = payments.reduce(
    (acc, payment) => {
      if (!acc[payment.method]) {
        acc[payment.method] = { method: payment.method, amount: 0, count: 0 };
      }
      acc[payment.method].amount += payment.amount;
      acc[payment.method].count += 1;
      return acc;
    },
    {} as Record<string, { method: string; amount: number; count: number }>,
  );

  return Object.values(grouped);
}

/**
 * Validate customer name
 */
export function validateCustomerName(name: string): string | null {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return "Customer name is required";
  }

  if (trimmed.length > 100) {
    return "Customer name must be 100 characters or less";
  }

  return null;
}

/**
 * Validate payments match order total
 */
export function validatePayments(
  payments: PaymentData[],
  orderTotal: number,
): string | null {
  if (payments.length === 0) {
    return "At least one payment method is required";
  }

  // Validate each payment amount
  for (const payment of payments) {
    if (payment.amount <= 0) {
      return `Payment amount must be greater than zero`;
    }
  }

  // Calculate total paid
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  // Validate total matches (allow 0.01 tolerance for floating point)
  if (Math.abs(totalPaid - orderTotal) > 0.01) {
    return `Payment total (${totalPaid.toFixed(2)}) does not match order total (${orderTotal.toFixed(2)})`;
  }

  return null;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}
