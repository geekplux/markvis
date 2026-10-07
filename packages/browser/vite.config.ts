import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(root, "../..");

export default defineConfig({
  root,
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
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    minify: true,
    lib: {
      entry: resolve(root, "src/index.ts"),
      name: "markvis",
      formats: ["es", "iife"],
      fileName: (format) => (format === "iife" ? "markvis.min.js" : "markvis.mjs"),
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
