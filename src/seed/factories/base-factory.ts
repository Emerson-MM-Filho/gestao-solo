/**
 * Abstract base factory for type-safe data generation
 */

import type { SeedContext } from "../types";

export abstract class BaseFactory<T> {
  protected context: Partial<SeedContext> = {};

  /**
   * Set context for this factory
   */
  setContext(context: Partial<SeedContext>): this {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * Generate a single entity (in-memory only)
   */
  abstract make(overrides?: Partial<T>): T;

  /**
   * Generate multiple entities (in-memory only)
   */
  makeMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.make(overrides));
  }

  /**
   * Generate and insert a single entity into database
   */
  abstract create(overrides?: Partial<T>): Promise<T>;

  /**
   * Generate and insert multiple entities (sequential)
   */
  async createMany(count: number, overrides?: Partial<T>): Promise<T[]> {
    const results: T[] = [];
    for (let i = 0; i < count; i++) {
      const entity = await this.create(overrides);
      results.push(entity);
    }
    return results;
  }

  /**
   * Batch create for performance (override in subclasses)
   * Default implementation uses sequential creation
   */
  async createBatch(data: T[]): Promise<T[]> {
    const results: T[] = [];
    for (const item of data) {
      const created = await this.createFromData(item);
      results.push(created);
    }
    return results;
  }

  /**
   * Insert pre-generated data into database
   * Must be implemented by subclass
   * Made public to allow executor to use it directly
   */
  abstract createFromData(data: T): Promise<T>;

  /**
   * Reset factory state (if needed)
   */
  reset(): void {
    // Override in subclasses if they maintain state
  }

  /**
   * Get userId from context, throwing error if not set
   * Reduces duplication of validation logic across factories
   */
  protected requireUserId(): string {
    if (!this.context.userId) {
      throw new Error(
        `userId required in context for ${this.constructor.name}`,
      );
    }
    return this.context.userId;
  }
}
