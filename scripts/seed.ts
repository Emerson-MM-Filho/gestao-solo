#!/usr/bin/env bun
/**
 * Seed CLI - Entry point for database seeding
 *
 * Usage:
 *   bun run seed                    # Use small profile (default)
 *   bun run seed --profile minimal  # Use minimal profile
 *   bun run seed --profile medium   # Use medium profile
 *   bun run seed --list             # List all profiles
 */

import { parseArgs } from "util";
import { SeedExecutor } from "../src/seed/executor";
import { getProfile, listProfiles } from "../src/seed/profiles";
import type { SeedProfileSize } from "../src/seed/types";

// Parse command line arguments
const args = parseArgs({
  args: process.argv.slice(2),
  options: {
    profile: {
      type: "string",
      short: "p",
      default: "small",
    },
    userId: {
      type: "string",
      short: "u",
    },
    list: {
      type: "boolean",
      short: "l",
      default: false,
    },
    help: {
      type: "boolean",
      short: "h",
      default: false,
    },
  },
  allowPositionals: true,
});

// Show help
if (args.values.help) {
  console.log(`
Database Seeding CLI for Gestao Solo

Usage: bun run seed [options]

Options:
  -p, --profile <size>   Seed profile to use (minimal|small|medium|large)
                         Default: small
  -u, --userId <uuid>    Specific user ID to populate data for
                         If not provided, uses first existing user or creates one
  -l, --list            List available profiles with details
  -h, --help            Show this help message

Examples:
  bun run seed                                    # Use small profile with first user
  bun run seed -p minimal                         # Use minimal profile (quick smoke test)
  bun run seed --profile medium                   # Use medium profile (more data)
  bun run seed -u 6c20e6e3-b07a-460f-9645-...     # Seed for specific user
  bun run seed --list                             # List all available profiles

Note:
  - When using --userId, the specified user must exist
  - All existing data for the user will be wiped before seeding
  - Orders will be dated over the past month with realistic timestamps
  - Requires SUPABASE_SERVICE_ROLE_KEY in .env.local for best results
`);
  process.exit(0);
}

// List profiles
if (args.values.list) {
  console.log("\nAvailable seed profiles:\n");

  for (const { size, profile } of listProfiles()) {
    console.log(`  ${size.toUpperCase()}`);
    console.log(`  ${"-".repeat(size.length + 2)}`);
    console.log(`  ${profile.description}`);
    console.log(`  Categories: ${profile.config.categories.count}`);
    console.log(`  Items:      ${profile.config.items.count}`);
    console.log(
      `  Orders:     ${
        profile.config.orders.openCount +
        profile.config.orders.closedCount +
        profile.config.orders.cancelledCount
      } (${profile.config.orders.openCount} open, ${profile.config.orders.closedCount} closed, ${profile.config.orders.cancelledCount} cancelled)`,
    );
    console.log("");
  }
  process.exit(0);
}

// Get selected profile
const profileSize = args.values.profile as SeedProfileSize;
const profile = getProfile(profileSize);

if (!profile) {
  console.error(`\n[ERROR] Unknown profile: "${profileSize}"`);
  console.error('Available profiles: minimal, small, medium, large');
  console.error('Run "bun run seed --list" to see details\n');
  process.exit(1);
}

// Display profile info
console.log(`\nUsing profile: ${profile.name.toUpperCase()}`);
console.log(profile.description);
console.log("\nConfiguration:");
console.log(`  Categories:     ${profile.config.categories.count}`);
console.log(`  Items:          ${profile.config.items.count}`);
console.log(
  `  - Merchandise:  ${Math.round((profile.config.items.count * profile.config.items.merchandisePercentage) / 100)}`,
);
console.log(
  `  - Supply:       ${Math.round((profile.config.items.count * (100 - profile.config.items.merchandisePercentage)) / 100)}`,
);
console.log(
  `  - Low Stock:    ${Math.round((profile.config.items.count * profile.config.items.lowStockPercentage) / 100)}`,
);
console.log(
  `  Orders:         ${
    profile.config.orders.openCount +
    profile.config.orders.closedCount +
    profile.config.orders.cancelledCount
  }`,
);
console.log(`  - Open:         ${profile.config.orders.openCount}`);
console.log(`  - Closed:       ${profile.config.orders.closedCount}`);
console.log(`  - Cancelled:    ${profile.config.orders.cancelledCount}`);
console.log(
  `  Date Range:     Past ${profile.config.orders.dateRangeDays} days`,
);
console.log("");

// Execute seeding
const executor = new SeedExecutor(profile.config, args.values.userId);
const result = await executor.execute();

// Exit with appropriate code
process.exit(result.success ? 0 : 1);
