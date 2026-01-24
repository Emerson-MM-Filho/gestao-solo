// Stock Management Utility Functions

import i18n from "@/i18n";
import type {
  Item,
  ItemFormData,
  ItemWithStatus,
  StockMovementType,
  StockStatusType,
} from "./types/stock";

/**
 * Calculate stock status based on quantity and thresholds
 */
export function calculateStockStatus(
  quantity: number,
  criticalThreshold: number,
  lowThreshold: number,
): StockStatusType {
  if (quantity <= criticalThreshold) {
    return "critical";
  }
  if (quantity <= lowThreshold) {
    return "low";
  }
  return "ok";
}

/**
 * Calculate effective price (promotional or regular based on dates)
 */
export function calculateEffectivePrice(item: Item): number {
  if (
    !item.promotional_price ||
    !item.promotional_start ||
    !item.promotional_end
  ) {
    return item.price;
  }

  const now = new Date();
  const start = new Date(item.promotional_start);
  const end = new Date(item.promotional_end);

  if (now >= start && now <= end) {
    return item.promotional_price;
  }

  return item.price;
}

/**
 * Add computed properties to item
 */
export function enrichItem(item: Item): ItemWithStatus {
  return {
    ...item,
    status: calculateStockStatus(
      item.stock_quantity,
      item.critical_threshold,
      item.low_threshold,
    ),
    effectivePrice: calculateEffectivePrice(item),
  };
}

/**
 * Validate item form data
 */
export function validateItemForm(
  data: Partial<ItemFormData>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = i18n.t("stock:itemForm.validation.nameRequired");
  } else if (data.name.length > 100) {
    errors.name = i18n.t("stock:itemForm.validation.nameMaxLength");
  }

  if (data.price === undefined || data.price === null) {
    errors.price = i18n.t("stock:itemForm.validation.priceRequired");
  } else if (data.price <= 0) {
    errors.price = i18n.t("stock:itemForm.validation.pricePositive");
  }

  if (
    data.critical_threshold !== undefined &&
    data.low_threshold !== undefined &&
    data.critical_threshold > data.low_threshold
  ) {
    errors.critical_threshold = i18n.t(
      "stock:itemForm.validation.thresholdOrder",
    );
  }

  if (data.promotional_price !== undefined && data.promotional_price !== null) {
    if (!data.promotional_start || !data.promotional_end) {
      errors.promotional_start = i18n.t(
        "stock:itemForm.validation.promoDatesRequired",
      );
    } else {
      const start = new Date(data.promotional_start);
      const end = new Date(data.promotional_end);
      if (start >= end) {
        errors.promotional_end = i18n.t(
          "stock:itemForm.validation.promoEndAfterStart",
        );
      }
    }
  }

  if (data.stock_quantity !== undefined && data.stock_quantity < 0) {
    errors.stock_quantity = i18n.t(
      "stock:itemForm.validation.stockNonNegative",
    );
  }

  return errors;
}

/**
 * Format stock movement type for display
 */
export function formatStockMovementType(type: StockMovementType): string {
  const typeMap: Record<StockMovementType, string> = {
    entrada: i18n.t("stock:history.types.entry"),
    saida_manual: i18n.t("stock:history.types.manual_exit"),
    venda: i18n.t("stock:history.types.sale"),
    estorno: i18n.t("stock:history.types.reversal"),
  };

  return typeMap[type] || type;
}

/**
 * Get status color class
 */
export function getStatusColor(status: StockStatusType): string {
  const colorMap: Record<StockStatusType, string> = {
    critical: "text-red-600 bg-red-50 border-red-200",
    low: "text-yellow-600 bg-yellow-50 border-yellow-200",
    ok: "text-green-600 bg-green-50 border-green-200",
  };

  return colorMap[status];
}

/**
 * Get status badge color (for shadcn Badge component)
 */
export function getStatusBadgeVariant(
  status: StockStatusType,
): "destructive" | "default" | "secondary" {
  const variantMap: Record<
    StockStatusType,
    "destructive" | "default" | "secondary"
  > = {
    critical: "destructive",
    low: "secondary",
    ok: "default",
  };

  return variantMap[status];
}
