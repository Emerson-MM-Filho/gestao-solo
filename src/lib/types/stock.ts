// Stock Management Type Definitions

export const ItemTypeOptions = {
  MERCADORIA: "mercadoria",
  INSUMO: "insumo",
} as const;

export type ItemType = (typeof ItemTypeOptions)[keyof typeof ItemTypeOptions];

export const StockMovementOptions = {
  ENTRADA: "entrada",
  SAIDA_MANUAL: "saida_manual",
  VENDA: "venda",
  ESTORNO: "estorno",
} as const;

export type StockMovementType =
  (typeof StockMovementOptions)[keyof typeof StockMovementOptions];

export const StockStatusOptions = {
  CRITICAL: "critical",
  LOW: "low",
  OK: "ok",
} as const;

export type StockStatusType =
  (typeof StockStatusOptions)[keyof typeof StockStatusOptions];

export interface Category {
  id: string;
  user_id: string;
  name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  type: ItemType;
  price: number;
  promotional_price: number | null;
  promotional_start: string | null;
  promotional_end: string | null;
  stock_quantity: number;
  critical_threshold: number;
  low_threshold: number;
  is_favorite: boolean;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface ItemWithStatus extends Item {
  status: StockStatusType;
  effectivePrice: number;
}

export interface StockMovement {
  id: string;
  item_id: string;
  type: StockMovementType;
  quantity: number;
  balance_after: number;
  notes: string | null;
  created_at: string;
}

export interface LowStockAlert {
  item_id: string;
  item_name: string;
  stock_quantity: number;
  critical_threshold: number;
  low_threshold: number;
  status: StockStatusType;
}

export interface ItemFormData {
  name: string;
  type: ItemType;
  category_id: string | null;
  price: number;
  promotional_price: number | null;
  promotional_start: string | null;
  promotional_end: string | null;
  stock_quantity: number;
  critical_threshold: number;
  low_threshold: number;
  is_favorite: boolean;
}

export interface StockAdjustmentFormData {
  type: (typeof StockMovementOptions)["ENTRADA" | "SAIDA_MANUAL"];
  quantity: number;
  notes: string | null;
}

export type SortOption = "alphabetical" | "favorites" | "most-used";
export type ViewMode = "grid" | "list";
