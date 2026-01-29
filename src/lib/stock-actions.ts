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
