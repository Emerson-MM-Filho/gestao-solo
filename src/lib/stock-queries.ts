// Stock Management Supabase Queries

import { supabase } from './supabase';
import type {
  Item,
  Category,
  StockMovement,
  ItemFormData,
  StockAdjustmentFormData,
  LowStockAlert,
} from './types/stock';

/**
 * Fetch all active items with category information
 */
export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Fetch all categories ordered by display_order
 */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  if (error) throw error;
  return data || [];
}

/**
 * Search categories by name (for combobox filtering)
 */
export async function searchCategories(query: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('display_order');

  if (error) throw error;
  return data || [];
}

/**
 * Fetch low stock alerts from view
 */
export async function fetchLowStockAlerts(): Promise<LowStockAlert[]> {
  const { data, error } = await supabase
    .from('v_low_stock_items')
    .select('*');

  if (error) throw error;
  return data || [];
}

/**
 * Create a new item
 */
export async function createItem(itemData: ItemFormData): Promise<Item> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('items')
    .insert({
      ...itemData,
      user_id: user.id,
      usage_count: 0,
      is_active: true,
    })
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing item
 */
export async function updateItem(
  itemId: string,
  itemData: Partial<ItemFormData>
): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .update({
      ...itemData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Soft delete an item (set is_active=false)
 */
export async function deleteItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('items')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId);

  if (error) throw error;
}

/**
 * Record a stock movement and update item stock_quantity
 */
export async function recordStockMovement(
  itemId: string,
  movementData: StockAdjustmentFormData
): Promise<StockMovement> {
  // First, get current stock quantity
  const { data: item, error: fetchError } = await supabase
    .from('items')
    .select('stock_quantity')
    .eq('id', itemId)
    .single();

  if (fetchError) throw fetchError;

  const currentStock = item.stock_quantity;
  const quantityChange =
    movementData.type === 'entry'
      ? movementData.quantity
      : -movementData.quantity;
  const newBalance = currentStock + quantityChange;

  if (newBalance < 0) {
    throw new Error('Stock quantity cannot be negative');
  }

  // Insert movement record
  const { data: movement, error: insertError } = await supabase
    .from('stock_movements')
    .insert({
      item_id: itemId,
      type: movementData.type,
      quantity: movementData.quantity,
      balance_after: newBalance,
      notes: movementData.notes,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  // Update item stock quantity
  const { error: updateError } = await supabase
    .from('items')
    .update({
      stock_quantity: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId);

  if (updateError) throw updateError;

  return movement;
}

/**
 * Fetch movement history for a specific item
 */
export async function fetchItemMovements(itemId: string): Promise<StockMovement[]> {
  const { data, error } = await supabase
    .from('stock_movements')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new category
 */
export async function createCategory(name: string): Promise<Category> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  // Get max display_order to append new category at the end
  const { data: maxOrderData } = await supabase
    .from('categories')
    .select('display_order')
    .eq('user_id', user.id)
    .order('display_order', { ascending: false })
    .limit(1);

  const nextOrder = maxOrderData?.[0]?.display_order
    ? maxOrderData[0].display_order + 1
    : 0;

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      name,
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
