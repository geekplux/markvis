import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@markvis/ir": fileURLToPath(
        new URL("./packages/ir/src/index.ts", import.meta.url),
      ),
      "@markvis/parser": fileURLToPath(
        new URL("./packages/parser/src/index.ts", import.meta.url),
      ),
      "@markvis/render-svg": fileURLToPath(
        new URL("./packages/render-svg/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: [
      "packages/ir/src/**/*.test.ts",
      "packages/parser/src/**/*.test.ts",
      "packages/parser/test/**/*.test.ts",
      "packages/render-svg/src/**/*.test.ts",
      "packages/render-svg/test/**/*.test.ts",
    ],
    exclude: ["**/node_modules/**", "legacy/**"],
  },
});
