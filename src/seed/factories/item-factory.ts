/**
 * Item factory for generating item seed data
 */

import { BaseFactory } from "./base-factory";
import { supabase } from "../supabase-client";
import type { Item, ItemType } from "@/lib/types/stock";
import { getProductsByCategory, getAllProductsWithCategory } from "../generators";
import { randomInt, randomFloat, randomBool, pickRandom } from "../utils/random";

interface ItemData {
  name: string;
  type: ItemType;
  category_id: string | null;
  price: number;
  stock_quantity: number;
  critical_threshold: number;
  low_threshold: number;
  is_favorite: boolean;
}

interface ItemFactoryOptions {
  merchandisePercentage: number; // 0-100
  lowStockPercentage: number; // 0-100
}

export class ItemFactory extends BaseFactory<ItemData> {
  private usedNames = new Set<string>();
  private options: ItemFactoryOptions;
  private itemCount = 0;

  constructor(options: ItemFactoryOptions) {
    super();
    this.options = options;
  }

  make(overrides?: Partial<ItemData>): ItemData {
    // Determine type based on percentage
    const isMerchandise =
      overrides?.type === "merchandise" ||
      (overrides?.type !== "supply" &&
        randomBool(this.options.merchandisePercentage / 100));

    const type: ItemType = isMerchandise ? "merchandise" : "supply";

    // Get category from context or use first available
    let categoryId = overrides?.category_id ?? null;
    if (!categoryId && this.context.categories && this.context.categories.length > 0) {
      // Pick a random category
      const category = pickRandom(this.context.categories);
      categoryId = category.id;

      // If we have products for this category, use them
      const categoryProducts = getProductsByCategory(category.name);
      if (categoryProducts.length > 0) {
        // Find an unused product
        const unusedProducts = categoryProducts.filter((p) => !this.usedNames.has(p));
        if (unusedProducts.length > 0) {
          const name = pickRandom(unusedProducts);
          this.usedNames.add(name);

          return this.createItemData(name, type, categoryId, overrides);
        }
      }
    }

    // Fallback: generate generic name
    let name = overrides?.name;
    if (!name) {
      // Try to get any unused product
      const allProducts = getAllProductsWithCategory();
      const unusedProducts = allProducts.filter((p) => !this.usedNames.has(p.name));

      if (unusedProducts.length > 0) {
        const product = pickRandom(unusedProducts);
        name = product.name;

        // Update category if we found one
        if (!categoryId) {
          const matchingCategory = this.context.categories?.find(
            (c) => c.name === product.category,
          );
          if (matchingCategory) {
            categoryId = matchingCategory.id;
          }
        }
      } else {
        name = `Item ${this.itemCount + 1}`;
      }
    }

    this.usedNames.add(name);
    this.itemCount++;

    return this.createItemData(name, type, categoryId, overrides);
  }

  private createItemData(
    name: string,
    type: ItemType,
    categoryId: string | null,
    overrides?: Partial<ItemData>,
  ): ItemData {
    // Determine if this should be low stock
    const isLowStock = randomBool(this.options.lowStockPercentage / 100);

    // Price ranges based on type
    const priceRange =
      type === "merchandise" ? { min: 3, max: 50 } : { min: 0.5, max: 10 };
    const price = overrides?.price ?? randomFloat(priceRange.min, priceRange.max);

    // Stock quantity ranges
    let stockQuantity: number;
    if (overrides?.stock_quantity !== undefined) {
      stockQuantity = overrides.stock_quantity;
    } else if (isLowStock) {
      // Low stock: 0-5 units
      stockQuantity = randomInt(0, 5);
    } else {
      // Normal stock based on type
      const stockRange =
        type === "merchandise" ? { min: 10, max: 80 } : { min: 50, max: 200 };
      stockQuantity = randomInt(stockRange.min, stockRange.max);
    }

    // Thresholds
    const critical_threshold = overrides?.critical_threshold ?? (type === "merchandise" ? 2 : 10);
    const low_threshold = overrides?.low_threshold ?? (type === "merchandise" ? 5 : 20);

    // Favorites (20% chance)
    const is_favorite = overrides?.is_favorite ?? randomBool(0.2);

    return {
      name,
      type,
      category_id: categoryId,
      price,
      stock_quantity: stockQuantity,
      critical_threshold,
      low_threshold,
      is_favorite,
    };
  }

  async create(overrides?: Partial<ItemData>): Promise<Item> {
    const data = this.make(overrides);
    return this.createFromData(data);
  }

  async createFromData(data: ItemData): Promise<Item> {
    const userId = this.requireUserId();

    const { data: item, error } = await supabase
      .from("items")
      .insert({
        user_id: userId,
        ...data,
        usage_count: 0, // Always start at 0
      })
      .select()
      .single();

    if (error) throw error;

    // Record initial stock movement
    if (item.stock_quantity > 0) {
      const { error: stockError } = await supabase.from("stock_movements").insert({
        item_id: item.id,
        type: "entry",
        quantity: item.stock_quantity,
        balance_after: item.stock_quantity,
        notes: "Initial stock - seed data",
      });

      if (stockError) {
        throw new Error(
          `Failed to record stock movement for item ${item.id}: ${stockError.message}`,
        );
      }
    }

    return item;
  }

  async createBatch(data: ItemData[]): Promise<Item[]> {
    const userId = this.requireUserId();

    // Insert items
    const { data: items, error } = await supabase
      .from("items")
      .insert(
        data.map((item) => ({
          user_id: userId,
          ...item,
          usage_count: 0,
        })),
      )
      .select();

    if (error) throw error;

    // Create stock movements for items with initial stock
    const stockMovements = items
      .filter((item) => item.stock_quantity > 0)
      .map((item) => ({
        item_id: item.id,
        type: "entry" as const,
        quantity: item.stock_quantity,
        balance_after: item.stock_quantity,
        notes: "Initial stock - seed data",
      }));

    if (stockMovements.length > 0) {
      const { error: batchStockError } = await supabase
        .from("stock_movements")
        .insert(stockMovements);

      if (batchStockError) {
        throw new Error(
          `Failed to record batch stock movements: ${batchStockError.message}`,
        );
      }
    }

    return items;
  }

  reset(): void {
    this.usedNames.clear();
    this.itemCount = 0;
  }
}
