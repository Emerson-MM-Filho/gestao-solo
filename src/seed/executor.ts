/**
 * Seed executor - orchestrates the entire seeding process
 */

import { supabase } from "./supabase-client";
import type { SeedConfig, SeedResult, SeedContext } from "./types";
import {
  CategoryFactory,
  ItemFactory,
  OrderFactory,
} from "./factories";

/**
 * Main seed executor
 */
export class SeedExecutor {
  private config: SeedConfig;
  private specifiedUserId?: string;
  private context: SeedContext = {
    userId: "",
    categories: [],
    items: [],
    orders: [],
  };

  constructor(config: SeedConfig, userId?: string) {
    this.config = config;
    this.specifiedUserId = userId;
  }

  /**
   * Execute the complete seeding process
   */
  async execute(): Promise<SeedResult> {
    const startTime = Date.now();
    const counts = {
      categories: 0,
      items: 0,
      orders: 0,
      orderItems: 0,
      payments: 0,
      stockMovements: 0,
    };
    const errors: string[] = [];

    try {
      console.log("========================================");
      console.log("SEED PROCESS STARTING");
      console.log("========================================\n");

      // Step 1: Get authenticated user
      console.log("[1/5] Getting authenticated user...");
      await this.getUserId();
      console.log(`      User ID: ${this.context.userId}\n`);

      // Step 2: Wipe existing data
      console.log("[2/5] Wiping existing data...");
      await this.wipeData();
      console.log("      Data wiped successfully\n");

      // Step 3: Create categories
      console.log(`[3/5] Creating ${this.config.categories.count} categories...`);
      const categories = await this.seedCategories();
      counts.categories = categories.length;
      this.context.categories = categories.map((c) => ({
        id: c.id,
        name: c.name,
      }));
      console.log(`      Created ${counts.categories} categories\n`);

      // Step 4: Create items
      console.log(`[4/5] Creating ${this.config.items.count} items...`);
      const items = await this.seedItems();
      counts.items = items.length;
      counts.stockMovements = items.filter((i) => i.stock_quantity > 0).length;
      this.context.items = items.map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        price: i.price,
        stock_quantity: i.stock_quantity,
      }));

      const lowStockCount = items.filter(
        (i) => i.stock_quantity <= i.low_threshold,
      ).length;
      console.log(
        `      Created ${counts.items} items (${lowStockCount} at low/critical stock)\n`,
      );

      // Step 5: Create orders
      const totalOrders =
        this.config.orders.openCount +
        this.config.orders.closedCount +
        this.config.orders.cancelledCount;
      console.log(`[5/5] Creating ${totalOrders} orders...`);

      const orderResult = await this.seedOrders();
      counts.orders = orderResult.orders;
      counts.orderItems = orderResult.orderItems;
      counts.payments = orderResult.payments;
      counts.stockMovements += orderResult.stockMovements;

      console.log(`      Open:      ${orderResult.actualStatusCounts.open}`);
      console.log(`      Closed:    ${orderResult.actualStatusCounts.closed}`);
      console.log(`      Cancelled: ${orderResult.actualStatusCounts.cancelled}\n`);

      const duration = Date.now() - startTime;

      console.log("========================================");
      console.log("SEED PROCESS COMPLETE");
      console.log("========================================\n");
      console.log("Summary:");
      console.log(`  Categories:      ${counts.categories}`);
      console.log(`  Items:           ${counts.items}`);
      console.log(`  Orders:          ${counts.orders}`);
      console.log(`  Order Items:     ${counts.orderItems}`);
      console.log(`  Payments:        ${counts.payments}`);
      console.log(`  Stock Movements: ${counts.stockMovements}`);
      console.log(`\n  Duration: ${(duration / 1000).toFixed(2)}s\n`);

      return {
        success: true,
        duration,
        counts,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push(errorMessage);

      console.error(`\n[ERROR] Seeding failed: ${errorMessage}\n`);

      return {
        success: false,
        duration,
        counts,
        errors,
      };
    }
  }

  /**
   * Get user ID for seeding
   * Priority:
   * 1. Use --userId flag if provided
   * 2. Use authenticated user (works with publishable key)
   * 3. Use first existing user (works with service role key)
   * 4. Create test user (works with service role key)
   */
  private async getUserId(): Promise<void> {
    // If user ID was specified via CLI, use it
    if (this.specifiedUserId) {
      // Verify the user exists
      try {
        const { data, error } = await supabase.auth.admin.getUserById(
          this.specifiedUserId,
        );

        if (error || !data.user) {
          throw new Error(
            `User ${this.specifiedUserId} not found. Error: ${error?.message}`,
          );
        }

        this.context.userId = this.specifiedUserId;
        console.log(
          `      Using specified user: ${data.user.email || this.specifiedUserId}`,
        );
        return;
      } catch (error) {
        throw new Error(
          `Failed to verify user ${this.specifiedUserId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Try to get authenticated user first (works with publishable key)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      this.context.userId = user.id;
      console.log(`      Using authenticated user: ${user.email || user.id}`);
      return;
    }

    // If no authenticated user, try admin API (works with service role key)
    try {
      const { data: usersData, error: listError } =
        await supabase.auth.admin.listUsers();

      if (listError) {
        throw new Error(
          `Failed to list users: ${listError.message}. Please sign in to the application or ensure SUPABASE_SERVICE_ROLE_KEY is set.`,
        );
      }

      if (usersData.users && usersData.users.length > 0) {
        // Use first existing user
        this.context.userId = usersData.users[0].id;
        console.log(
          `      Using first existing user: ${usersData.users[0].email || usersData.users[0].id}`,
        );
        return;
      }

      // No users exist - create a test user
      const testEmail = "test@gestao-solo.local";
      const testPassword = "Test123!@#";

      console.log(`      Creating test user: ${testEmail}`);

      const { data: newUserData, error: createError } =
        await supabase.auth.admin.createUser({
          email: testEmail,
          password: testPassword,
          email_confirm: true,
        });

      if (createError || !newUserData.user) {
        throw new Error(`Failed to create test user: ${createError?.message}`);
      }

      this.context.userId = newUserData.user.id;
      console.log(
        `      Test user created. Email: ${testEmail}, Password: ${testPassword}`,
      );
    } catch (error) {
      throw new Error(
        `Failed to get or create user: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Wipe all existing data for the current user
   */
  private async wipeData(): Promise<void> {
    if (!this.context.userId) {
      throw new Error("User ID not set");
    }

    // Delete in order (CASCADE will handle relationships)
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .eq("user_id", this.context.userId);
    if (ordersError) {
      throw new Error(`Failed to delete orders: ${ordersError.message}`);
    }

    const { error: itemsError } = await supabase
      .from("items")
      .delete()
      .eq("user_id", this.context.userId);
    if (itemsError) {
      throw new Error(`Failed to delete items: ${itemsError.message}`);
    }

    const { error: categoriesError } = await supabase
      .from("categories")
      .delete()
      .eq("user_id", this.context.userId);
    if (categoriesError) {
      throw new Error(`Failed to delete categories: ${categoriesError.message}`);
    }
  }

  /**
   * Seed categories
   */
  private async seedCategories() {
    const factory = new CategoryFactory().setContext(this.context);
    const data = factory.makeMany(this.config.categories.count);
    return factory.createBatch(data);
  }

  /**
   * Seed items
   */
  private async seedItems() {
    const factory = new ItemFactory({
      merchandisePercentage: this.config.items.merchandisePercentage,
      lowStockPercentage: this.config.items.lowStockPercentage,
    }).setContext(this.context);

    const data = factory.makeMany(this.config.items.count);
    return factory.createBatch(data);
  }

  /**
   * Seed orders
   */
  private async seedOrders(): Promise<{
    orders: number;
    orderItems: number;
    payments: number;
    stockMovements: number;
    actualStatusCounts: { open: number; closed: number; cancelled: number };
  }> {
    const factory = new OrderFactory({
      itemsPerOrderRange: this.config.orders.itemsPerOrderRange,
      quantityPerItemRange: this.config.orders.quantityPerItemRange,
      customizationPercentage: this.config.orders.customizationPercentage,
      dateRangeDays: this.config.orders.dateRangeDays,
      paymentMethodWeights: this.config.payments.methodWeights,
      multiPaymentPercentage: this.config.payments.multiPaymentPercentage,
    }).setContext(this.context);

    let orderCount = 0;
    let itemCount = 0;
    let paymentCount = 0;
    let stockMovementCount = 0;
    const actualStatusCounts = { open: 0, closed: 0, cancelled: 0 };

    // Create open orders
    const openResult = await this.createOrdersByStatus(
      factory,
      "open",
      this.config.orders.openCount,
    );
    orderCount += openResult.orders;
    itemCount += openResult.items;
    paymentCount += openResult.payments;
    stockMovementCount += openResult.stockMovements;
    actualStatusCounts.open += openResult.statusCounts.open;
    actualStatusCounts.closed += openResult.statusCounts.closed;
    actualStatusCounts.cancelled += openResult.statusCounts.cancelled;

    // Create closed orders
    const closedResult = await this.createOrdersByStatus(
      factory,
      "closed",
      this.config.orders.closedCount,
    );
    orderCount += closedResult.orders;
    itemCount += closedResult.items;
    paymentCount += closedResult.payments;
    stockMovementCount += closedResult.stockMovements;
    actualStatusCounts.open += closedResult.statusCounts.open;
    actualStatusCounts.closed += closedResult.statusCounts.closed;
    actualStatusCounts.cancelled += closedResult.statusCounts.cancelled;

    // Create cancelled orders
    const cancelledResult = await this.createOrdersByStatus(
      factory,
      "cancelled",
      this.config.orders.cancelledCount,
    );
    orderCount += cancelledResult.orders;
    itemCount += cancelledResult.items;
    paymentCount += cancelledResult.payments;
    stockMovementCount += cancelledResult.stockMovements;
    actualStatusCounts.open += cancelledResult.statusCounts.open;
    actualStatusCounts.closed += cancelledResult.statusCounts.closed;
    actualStatusCounts.cancelled += cancelledResult.statusCounts.cancelled;

    return {
      orders: orderCount,
      orderItems: itemCount,
      payments: paymentCount,
      stockMovements: stockMovementCount,
      actualStatusCounts,
    };
  }

  /**
   * Helper to create multiple orders of a specific status
   * Reduces code duplication in order creation
   */
  private async createOrdersByStatus(
    factory: OrderFactory,
    status: "open" | "closed" | "cancelled",
    count: number,
  ): Promise<{
    orders: number;
    items: number;
    payments: number;
    stockMovements: number;
    statusCounts: { open: number; closed: number; cancelled: number };
  }> {
    let orderCount = 0;
    let itemCount = 0;
    let paymentCount = 0;
    let stockMovementCount = 0;
    const statusCounts = { open: 0, closed: 0, cancelled: 0 };

    for (let i = 0; i < count; i++) {
      try {
        const orderData = factory.makeOrderData({ status });
        const finalOrder = await factory.createFromOrderData(orderData);

        orderCount++;
        itemCount += orderData.items.length;
        stockMovementCount += orderData.items.length;

        // Track actual status
        statusCounts[finalOrder.status as "open" | "closed" | "cancelled"]++;

        // Count payments and stock movements based on ACTUAL final status
        if (finalOrder.status === "closed") {
          paymentCount += orderData.payments?.length || 0;
        }

        // Add reversal stock movements for cancelled orders with stock return
        if (finalOrder.status === "cancelled" && orderData.return_stock) {
          stockMovementCount += orderData.items.length;
        }
      } catch (error) {
        console.warn(`  Warning: Failed to create ${status} order ${i + 1}`);
      }
    }

    return {
      orders: orderCount,
      items: itemCount,
      payments: paymentCount,
      stockMovements: stockMovementCount,
      statusCounts,
    };
  }
}
