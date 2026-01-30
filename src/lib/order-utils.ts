// Order Domain Utilities

import i18n from "@/i18n";
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
    const dayLabel = days > 1 ? i18n.t("orders:time.days") : i18n.t("orders:time.day");
    return `${days} ${dayLabel}`;
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}${i18n.t("orders:time.hour")} ${remainingMinutes}${i18n.t("orders:time.minute")}`;
  }

  return `${minutes} ${i18n.t("orders:time.minute")}`;
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
  const key = `orders:paymentMethods.${method}` as const;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }
  return method;
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
    return i18n.t("orders:validation.customerNameRequired");
  }

  if (trimmed.length > 100) {
    return i18n.t("orders:validation.customerNameMaxLength");
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
    return i18n.t("orders:validation.paymentRequired");
  }

  // Validate each payment amount
  for (const payment of payments) {
    if (payment.amount <= 0) {
      return i18n.t("orders:validation.paymentAmountPositive");
    }
  }

  // Calculate total paid
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  // Validate total matches (allow 0.01 tolerance for floating point)
  if (Math.abs(totalPaid - orderTotal) > 0.01) {
    return i18n.t("orders:errors.paymentTotalMismatch", {
      totalPaid: totalPaid.toFixed(2),
      orderTotal: orderTotal.toFixed(2),
    });
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
