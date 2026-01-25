// Stock Management Type Definitions

export const ItemTypeOptions = {
  MERCHANDISE: "merchandise",
  SUPPLY: "supply",
} as const;

export type ItemType = (typeof ItemTypeOptions)[keyof typeof ItemTypeOptions];

export const StockMovementOptions = {
  ENTRY: "entry",
  MANUAL_EXIT: "manual_exit",
  SALE: "sale",
  REVERSAL: "reversal",
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
  stock_quantity: number;
  critical_threshold: number;
  low_threshold: number;
  is_favorite: boolean;
}

export interface StockAdjustmentFormData {
  type: (typeof StockMovementOptions)["ENTRY" | "MANUAL_EXIT"];
  quantity: number;
  notes: string | null;
}

export type SortOption = "alphabetical" | "favorites" | "most-used";
export type ViewMode = "grid" | "list";
