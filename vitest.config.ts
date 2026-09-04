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
      "@markvis/cli": fileURLToPath(
        new URL("./packages/cli/src/index.ts", import.meta.url),
      ),
      "@markvis/remark": fileURLToPath(
        new URL("./packages/remark/src/index.ts", import.meta.url),
      ),
      "@markvis/markdown-it": fileURLToPath(
        new URL("./packages/markdown-it/src/index.ts", import.meta.url),
      ),
      "@markvis/browser": fileURLToPath(
        new URL("./packages/browser/src/index.ts", import.meta.url),
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
      "packages/cli/src/**/*.test.ts",
      "packages/cli/test/**/*.test.ts",
      "packages/remark/src/**/*.test.ts",
      "packages/remark/test/**/*.test.ts",
      "packages/markdown-it/src/**/*.test.ts",
      "packages/markdown-it/test/**/*.test.ts",
      "packages/browser/src/**/*.test.ts",
      "packages/browser/test/**/*.test.ts",
      "apps/playground/src/**/*.test.ts",
      "apps/playground/test/**/*.test.ts",
      "scripts/**/*.test.ts",
    ],
    exclude: ["**/node_modules/**", "legacy/**"],
  },
});
