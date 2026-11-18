/**
 * Configuración de Vitest para pruebas adversariales sobre emuladores locales de Firebase.
 */
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    fileParallelism: false,
    include: ["src/security/emulator_tests/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
