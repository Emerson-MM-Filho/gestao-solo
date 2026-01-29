import { supabase } from "./supabase";
import { recordStockMovement } from "./stock-queries";
import { StockMovementOptions } from "./types/stock";

/**
 * Toggle item favorite status
 */
export async function toggleItemFavorite(
  itemId: string,
  currentValue: boolean
): Promise<boolean> {
  const newValue = !currentValue;
  const { error } = await supabase
    .from("items")
    .update({ is_favorite: newValue })
    .eq("id", itemId);

  if (error) throw error;
  return newValue;
}

/**
 * Quick adjust stock quantity
 */
export async function quickAdjustStock(
  itemId: string,
  adjustment: number
): Promise<void> {
  if (!Number.isFinite(adjustment) || adjustment === 0) {
    throw new Error("Adjustment must be a non-zero finite number");
  }

  // Add reasonable bounds to prevent accidental large adjustments
  const MAX_ADJUSTMENT = 1000;
  if (Math.abs(adjustment) > MAX_ADJUSTMENT) {
    throw new Error(`Adjustment cannot exceed ±${MAX_ADJUSTMENT}`);
  }

  // Fetch current stock to validate adjustment won't cause negative stock
  const { data: currentItem, error: fetchError } = await supabase
    .from("items")
    .select("stock_quantity")
    .eq("id", itemId)
    .single();

  if (fetchError) throw fetchError;

  // Validate adjustment won't cause negative stock
  if (adjustment < 0 && currentItem.stock_quantity + adjustment < 0) {
    throw new Error("Insufficient stock for this adjustment");
  }

  const adjustmentData = {
    type:
      adjustment > 0
        ? StockMovementOptions.ENTRY
        : StockMovementOptions.MANUAL_EXIT,
    quantity: Math.abs(adjustment),
    notes: `Quick adjustment: ${adjustment > 0 ? "+" : ""}${adjustment}`,
  };

  await recordStockMovement(itemId, adjustmentData);
}
