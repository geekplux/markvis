import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(root, "../..");

export default defineConfig({
  root,
  base: "./",
  resolve: {
    alias: {
      "@markvis/ir": resolve(repoRoot, "packages/ir/src/index.ts"),
      "@markvis/types": resolve(repoRoot, "packages/types/registry.ts"),
      "@markvis/types/fence-keys": resolve(repoRoot, "packages/types/fence-keys.ts"),
      "@markvis/themes": resolve(repoRoot, "packages/themes/registry.ts"),
      "@markvis/parser": resolve(repoRoot, "packages/parser/src/index.ts"),
      "@markvis/render-svg": resolve(
        repoRoot,
        "packages/render-svg/src/index.ts",
      ),
      "@markvis/html": resolve(repoRoot, "packages/html/src/index.ts"),
      "@markvis/react": resolve(repoRoot, "packages/react/src/index.ts"),
      "@markvis/browser/preview": resolve(repoRoot, "packages/browser/src/preview.ts"),
      "@markvis/browser/enhance": resolve(repoRoot, "packages/browser/src/enhance.ts"),
      "@markvis/browser": resolve(repoRoot, "packages/browser/src/index.ts"),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  optimizeDeps: {
    exclude: [
      "@markvis/ir",
      "@markvis/parser",
      "@markvis/render-svg",
      "@markvis/html",
      "@markvis/browser",
    ],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
  },
});
