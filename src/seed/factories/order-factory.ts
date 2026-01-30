/**
 * Order factory for generating order seed data
 */

import { BaseFactory } from "./base-factory";
import { supabase } from "../supabase-client";
import type { Order, OrderStatus, PaymentMethod } from "@/lib/types/order";
import { generateFullName } from "../generators/names";
import { randomDateInPast, toISOString } from "../generators/dates";
import { randomInt, pickRandomMany, randomBool, weightedRandom } from "../utils/random";

interface OrderData {
  customer_name: string;
  status: OrderStatus;
  created_at?: string;
  items: Array<{
    item_id: string;
    quantity: number;
    customizations?: Array<{ notes: string }> | null;
  }>;
  // For closed orders
  payments?: Array<{
    method: PaymentMethod;
    amount: number;
  }>;
  // For cancelled orders
  return_stock?: boolean;
  cancel_reason?: string | null;
}

interface OrderFactoryOptions {
  itemsPerOrderRange: { min: number; max: number };
  quantityPerItemRange: { min: number; max: number };
  customizationPercentage: number;
  dateRangeDays: number;
  paymentMethodWeights: Record<PaymentMethod, number>;
  multiPaymentPercentage: number;
}

const CUSTOMIZATION_OPTIONS = [
  "Sem gelo",
  "Caprichado",
  "Bem quente",
  "Extra queijo",
  "Sem cebola",
  "Pouco sal",
  "Ponto da carne bem passado",
  "Sem salada",
];

export class OrderFactory extends BaseFactory<Order> {
  private options: OrderFactoryOptions;

  constructor(options: OrderFactoryOptions) {
    super();
    this.options = options;
  }

  /**
   * Generate order data (not the database entity)
   * This is a helper method specific to OrderFactory
   */
  makeOrderData(overrides?: Partial<OrderData>): OrderData {
    const customer_name = overrides?.customer_name ?? generateFullName();
    const status = overrides?.status ?? "open";

    // Generate created_at based on status
    let created_at: string;
    if (overrides?.created_at) {
      created_at = overrides.created_at;
    } else if (status === "open") {
      // Open orders are recent (last 2 days)
      created_at = toISOString(randomDateInPast(2));
    } else {
      // Closed/cancelled orders can be older
      created_at = toISOString(randomDateInPast(this.options.dateRangeDays));
    }

    // Select random merchandise items
    const merchandiseItems = (this.context.items || []).filter(
      (item) => item.type === "merchandise" && item.stock_quantity > 0,
    );

    if (merchandiseItems.length === 0) {
      throw new Error("No merchandise items available for orders");
    }

    // Generate order items
    const itemCount = randomInt(
      this.options.itemsPerOrderRange.min,
      this.options.itemsPerOrderRange.max,
    );
    const selectedItems = pickRandomMany(merchandiseItems, itemCount);

    const items = selectedItems.map((item) => {
      const quantity = randomInt(
        this.options.quantityPerItemRange.min,
        this.options.quantityPerItemRange.max,
      );

      // Add customizations randomly
      let customizations: Array<{ notes: string }> | null = null;
      if (randomBool(this.options.customizationPercentage / 100)) {
        const customizationText = CUSTOMIZATION_OPTIONS[
          randomInt(0, CUSTOMIZATION_OPTIONS.length - 1)
        ];
        customizations = [{ notes: customizationText }];
      }

      return {
        item_id: item.id,
        quantity,
        customizations,
      };
    });

    const orderData: OrderData = {
      customer_name,
      status,
      created_at,
      items: overrides?.items ?? items,
    };

    // Add payment data for closed orders
    if (status === "closed") {
      // Calculate total (approximate - will be recalculated by DB)
      const total = items.reduce((sum, orderItem) => {
        const item = merchandiseItems.find((i) => i.id === orderItem.item_id);
        return sum + (item?.price || 0) * orderItem.quantity;
      }, 0);

      // Generate payments
      const hasMultiplePayments = randomBool(
        this.options.multiPaymentPercentage / 100,
      );

      if (hasMultiplePayments && total > 20) {
        // Split payment (30-70% split)
        const splitRatio = 0.3 + Math.random() * 0.4;
        const amount1 = Number((total * splitRatio).toFixed(2));
        const amount2 = Number((total - amount1).toFixed(2));

        orderData.payments = [
          {
            method: weightedRandom(this.options.paymentMethodWeights),
            amount: amount1,
          },
          {
            method: weightedRandom(this.options.paymentMethodWeights),
            amount: amount2,
          },
        ];
      } else {
        // Single payment
        orderData.payments = [
          {
            method: weightedRandom(this.options.paymentMethodWeights),
            amount: total,
          },
        ];
      }
    }

    // Add cancellation data for cancelled orders
    if (status === "cancelled") {
      orderData.return_stock = randomBool(0.5); // 50% return stock
      const reasons = [
        "Cliente desistiu",
        "Erro no pedido",
        "Item indisponível",
        null,
      ];
      orderData.cancel_reason = reasons[randomInt(0, reasons.length - 1)];
    }

    return orderData;
  }

  /**
   * Required by base class - not typically used directly
   */
  make(): Order {
    throw new Error(
      "Use makeOrderData() and createFromOrderData() for OrderFactory",
    );
  }

  /**
   * Create order from order data specification
   */
  async create(overrides?: Partial<OrderData>): Promise<Order> {
    const data = this.makeOrderData(overrides);
    return this.createFromOrderData(data);
  }

  /**
   * Required by base class - delegates to createFromOrderData
   */
  async createFromData(data: Order): Promise<Order> {
    // This shouldn't be called directly for OrderFactory
    return data;
  }

  /**
   * Create order from order data specification
   * This is the actual implementation for OrderFactory
   */
  async createFromOrderData(data: OrderData): Promise<Order> {
    const userId = this.requireUserId();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: data.customer_name,
        status: "open", // Always start as open
        created_at: data.created_at,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Add items using database function
    for (const orderItem of data.items) {
      const { data: result, error } = await supabase.rpc("add_item_to_order", {
        p_order_id: order.id,
        p_item_id: orderItem.item_id,
        p_quantity: orderItem.quantity,
        p_customizations: orderItem.customizations ?? null,
      });

      if (error || !result?.success) {
        console.warn(
          `Failed to add item to order ${order.display_id}:`,
          error?.message || result?.error,
        );
      }
    }

    // Handle order status
    if (data.status === "closed" && data.payments) {
      // Close order with payments
      const { data: closeResult, error: closeError } = await supabase.rpc(
        "close_order",
        {
          p_order_id: order.id,
          p_payments: data.payments,
        },
      );

      if (closeError || !closeResult?.success) {
        console.warn(
          `Failed to close order ${order.display_id}:`,
          closeError?.message || closeResult?.error,
        );
      }
    } else if (data.status === "cancelled") {
      // Cancel order
      const { data: cancelResult, error: cancelError } = await supabase.rpc(
        "cancel_order",
        {
          p_order_id: order.id,
          p_return_stock: data.return_stock ?? false,
          p_reason: data.cancel_reason ?? null,
        },
      );

      if (cancelError || !cancelResult?.success) {
        console.warn(
          `Failed to cancel order ${order.display_id}:`,
          cancelError?.message || cancelResult?.error,
        );
      }
    }

    // Fetch final order state to get actual status
    const { data: finalOrder, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order.id)
      .single();

    if (fetchError) throw fetchError;
    return finalOrder;
  }

  reset(): void {
    // No state to reset
  }
}
