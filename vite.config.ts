import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load the current env file (production in build case) located in the environment directory
  const env = loadEnv(mode, "environment");

  return {
    plugins: [
      tailwindcss(),
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
    ],
    base: env.VITE_BASE_PATH || "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React core
            'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
            // TanStack Router
            'router': ['@tanstack/react-router'],
            // Supabase
            'supabase': ['@supabase/supabase-js'],
            // i18n
            'i18n': ['react-i18next', 'i18next'],
            // UI libraries
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-select',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-label',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
              '@radix-ui/react-tabs',
            ],
            // Icons
            'icons': ['@tabler/icons-react'],
            // Phone input (large library)
            'phone-input': ['react-phone-number-input'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  };
});
