import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Contract tests: run the app's real queries against the running ddev WordPress.
// They catch WordPress and the frontend drifting apart (renamed fields, missing plugins, etc.).
// Requires `ddev start` + seeded content (./wordpress/setup.sh).
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.contract.test.ts"],
    env: loadEnv("", process.cwd(), ""),
    testTimeout: 15_000,
  },
});
