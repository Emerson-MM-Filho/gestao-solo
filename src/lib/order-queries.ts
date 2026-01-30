// Order Management Supabase Queries

import { supabase } from "./supabase";
import type {
  Order,
  OrderWithDetails,
  CreateOrderData,
  AddItemToOrderData,
  CloseOrderData,
  CancelOrderData,
  OrderStatus,
} from "./types/order";

/**
 * Fetch all orders with optional status filter
 */
export async function fetchOrders(status?: OrderStatus): Promise<Order[]> {
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Fetch single order with full details (items, payments)
 */
export async function fetchOrderById(
  orderId: string,
): Promise<OrderWithDetails> {
  // Fetch order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError) throw orderError;

  // Fetch order items with item details
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select(
      `
      *,
      item:items(*)
    `,
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (itemsError) throw itemsError;

  // Fetch payments if order is closed
  let payments = [];
  if (order.status === "closed") {
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", orderId);

    if (paymentsError) throw paymentsError;
    payments = paymentsData || [];
  }

  return {
    ...order,
    items: items || [],
    payments,
  };
}

/**
 * Create a new order
 */
export async function createOrder(data: CreateOrderData): Promise<Order> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      customer_name: data.customer_name,
      status: "open",
      total_amount: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return order;
}

/**
 * Update order customer name (only if open)
 */
export async function updateOrderCustomerName(
  orderId: string,
  customerName: string,
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({
      customer_name: customerName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "open") // Safety: only update open orders
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add item to order using database function
 * CRITICAL: This deducts stock immediately for merchandise items
 */
export async function addItemToOrder(
  orderId: string,
  data: AddItemToOrderData,
): Promise<{
  success: boolean;
  order_item_id?: string;
  error?: string;
  available?: number;
}> {
  const { data: result, error } = await supabase.rpc("add_item_to_order", {
    p_order_id: orderId,
    p_item_id: data.item_id,
    p_quantity: data.quantity,
    p_customizations: data.customizations,
  });

  if (error) throw error;
  return result;
}

/**
 * Remove item from order using database function
 * Note: Stock is NOT automatically returned
 */
export async function removeItemFromOrder(orderItemId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const { data: result, error } = await supabase.rpc(
    "remove_item_from_order",
    {
      p_order_item_id: orderItemId,
    },
  );

  if (error) throw error;
  return result;
}

/**
 * Close order with payment validation
 */
export async function closeOrder(
  orderId: string,
  data: CloseOrderData,
): Promise<{ success: boolean; error?: string; expected?: number; received?: number }> {
  const { data: result, error } = await supabase.rpc("close_order", {
    p_order_id: orderId,
    p_payments: data.payments,
  });

  if (error) throw error;
  return result;
}

/**
 * Cancel order with optional stock return
 */
export async function cancelOrder(
  orderId: string,
  data: CancelOrderData,
): Promise<{ success: boolean; error?: string }> {
  const { data: result, error } = await supabase.rpc("cancel_order", {
    p_order_id: orderId,
    p_return_stock: data.return_stock,
    p_reason: data.reason,
  });

  if (error) throw error;
  return result;
}

/**
 * Delete order (only if open and has no items)
 */
export async function deleteOrder(orderId: string): Promise<void> {
  // First check if order has items
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id")
    .eq("order_id", orderId)
    .limit(1);

  if (itemsError) throw itemsError;

  if (items && items.length > 0) {
    throw new Error(
      "Cannot delete order with items. Remove all items first.",
    );
  }

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId)
    .eq("status", "open");

  if (error) throw error;
}

/**
 * Search orders by customer name
 */
export async function searchOrders(query: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .ilike("customer_name", `%${query}%`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}
