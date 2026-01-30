/**
 * Supabase client for seed scripts (Bun environment)
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Bun.env.VITE_SUPABASE_URL;
const supabaseServiceKey = Bun.env.SUPABASE_SERVICE_ROLE_KEY;
const supabasePublishableKey = Bun.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

// Prefer service role key for admin operations (bypasses RLS)
// Fall back to publishable key if service role not available
const supabaseKey = supabaseServiceKey || supabasePublishableKey;

if (!supabaseKey) {
  throw new Error(
    "Missing Supabase key. Set either SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY",
  );
}

if (!supabaseServiceKey) {
  console.warn(
    "\nWarning: Using publishable key instead of service role key.",
  );
  console.warn(
    "For best results, get the service role key with: bun supabase status",
  );
  console.warn(
    "Then add SUPABASE_SERVICE_ROLE_KEY to your .env.local file\n",
  );
}

/**
 * Supabase client for Bun environment
 * Uses service role key if available (bypasses RLS)
 * Falls back to publishable key (requires authenticated user)
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  db: {
    schema: "api",
  },
});
