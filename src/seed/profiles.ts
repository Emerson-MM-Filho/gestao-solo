/**
 * Seed profile configurations
 */

import type { SeedProfile, SeedProfileSize } from "./types";

/**
 * Pre-configured seed profiles for different use cases
 */
export const SEED_PROFILES: Record<SeedProfileSize, SeedProfile> = {
  minimal: {
    name: "Minimal",
    description: "Minimal data for smoke testing",
    config: {
      categories: {
        count: 4,
      },
      items: {
        count: 15,
        merchandisePercentage: 70,
        lowStockPercentage: 20,
      },
      orders: {
        openCount: 2,
        closedCount: 8,
        cancelledCount: 1,
        itemsPerOrderRange: { min: 1, max: 3 },
        quantityPerItemRange: { min: 1, max: 2 },
        customizationPercentage: 10,
        dateRangeDays: 7,
      },
      payments: {
        multiPaymentPercentage: 10,
        methodWeights: {
          pix: 40,
          credit: 25,
          debit: 20,
          cash: 10,
          voucher: 5,
        },
      },
    },
  },

  small: {
    name: "Small",
    description: "Small business simulation - matches user requirements",
    config: {
      categories: {
        count: 6,
      },
      items: {
        count: 30,
        merchandisePercentage: 75,
        lowStockPercentage: 25, // 25% at low/critical stock
      },
      orders: {
        openCount: 4,
        closedCount: 15,
        cancelledCount: 3,
        itemsPerOrderRange: { min: 2, max: 5 },
        quantityPerItemRange: { min: 1, max: 3 },
        customizationPercentage: 30,
        dateRangeDays: 30, // Past month
      },
      payments: {
        multiPaymentPercentage: 20,
        methodWeights: {
          pix: 45,
          credit: 25,
          debit: 15,
          cash: 10,
          voucher: 5,
        },
      },
    },
  },

  medium: {
    name: "Medium",
    description: "Medium business simulation",
    config: {
      categories: {
        count: 8,
      },
      items: {
        count: 50,
        merchandisePercentage: 80,
        lowStockPercentage: 20,
      },
      orders: {
        openCount: 8,
        closedCount: 40,
        cancelledCount: 5,
        itemsPerOrderRange: { min: 2, max: 8 },
        quantityPerItemRange: { min: 1, max: 5 },
        customizationPercentage: 25,
        dateRangeDays: 60,
      },
      payments: {
        multiPaymentPercentage: 25,
        methodWeights: {
          pix: 50,
          credit: 25,
          debit: 12,
          cash: 8,
          voucher: 5,
        },
      },
    },
  },

  large: {
    name: "Large",
    description: "Large business simulation for stress testing",
    config: {
      categories: {
        count: 10,
      },
      items: {
        count: 100,
        merchandisePercentage: 85,
        lowStockPercentage: 15,
      },
      orders: {
        openCount: 15,
        closedCount: 100,
        cancelledCount: 10,
        itemsPerOrderRange: { min: 1, max: 12 },
        quantityPerItemRange: { min: 1, max: 8 },
        customizationPercentage: 20,
        dateRangeDays: 90,
      },
      payments: {
        multiPaymentPercentage: 30,
        methodWeights: {
          pix: 55,
          credit: 25,
          debit: 10,
          cash: 5,
          voucher: 5,
        },
      },
    },
  },
};

/**
 * Get profile by size
 */
export function getProfile(size: SeedProfileSize): SeedProfile {
  return SEED_PROFILES[size];
}

/**
 * List all available profiles
 */
export function listProfiles(): Array<{
  size: SeedProfileSize;
  profile: SeedProfile;
}> {
  return Object.entries(SEED_PROFILES).map(([size, profile]) => ({
    size: size as SeedProfileSize,
    profile,
  }));
}
