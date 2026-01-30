/**
 * Category factory for generating category seed data
 */

import { BaseFactory } from "./base-factory";
import { supabase } from "../supabase-client";
import type { Category } from "@/lib/types/stock";
import { getCategoryNames } from "../generators";

interface CategoryData {
  name: string;
  display_order: number;
}

export class CategoryFactory extends BaseFactory<CategoryData> {
  private usedNames = new Set<string>();
  private currentOrder = 0;
  private categoryNames: string[];

  constructor() {
    super();
    this.categoryNames = getCategoryNames();
  }

  make(overrides?: Partial<CategoryData>): CategoryData {
    let name: string;

    if (overrides?.name) {
      name = overrides.name;
    } else {
      // Use predefined categories in order
      const availableCategories = this.categoryNames.filter(
        (n) => !this.usedNames.has(n),
      );

      if (availableCategories.length > 0) {
        name = availableCategories[0]; // Take first available
      } else {
        name = `Categoria ${this.usedNames.size + 1}`;
      }
    }

    this.usedNames.add(name);

    return {
      name,
      display_order: overrides?.display_order ?? this.currentOrder++,
    };
  }

  async create(overrides?: Partial<CategoryData>): Promise<Category> {
    const data = this.make(overrides);
    return this.createFromData(data);
  }

  async createFromData(data: CategoryData): Promise<Category> {
    const userId = this.requireUserId();

    const { data: category, error } = await supabase
      .from("categories")
      .insert({
        user_id: userId,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return category;
  }

  async createBatch(data: CategoryData[]): Promise<Category[]> {
    const userId = this.requireUserId();

    const { data: categories, error } = await supabase
      .from("categories")
      .insert(
        data.map((cat) => ({
          user_id: userId,
          ...cat,
        })),
      )
      .select();

    if (error) throw error;
    return categories;
  }

  reset(): void {
    this.usedNames.clear();
    this.currentOrder = 0;
  }
}
