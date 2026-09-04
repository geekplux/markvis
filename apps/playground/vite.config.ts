import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(root, "../..");
const cryptoShim = resolve(root, "src/crypto-shim.ts");

function nodeCryptoShim(): Plugin {
  return {
    name: "node-crypto-shim",
    enforce: "pre",
    resolveId(id) {
      if (id === "node:crypto" || id === "crypto") {
        return cryptoShim;
      }
    },
  };
}

export default defineConfig({
  root,
  base: "./",
  plugins: [nodeCryptoShim()],
  resolve: {
    alias: {
      "@markvis/ir": resolve(repoRoot, "packages/ir/src/index.ts"),
      "@markvis/parser": resolve(repoRoot, "packages/parser/src/index.ts"),
      "@markvis/render-svg": resolve(
        repoRoot,
        "packages/render-svg/src/index.ts",
      ),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  optimizeDeps: {
    exclude: ["@markvis/ir", "@markvis/parser", "@markvis/render-svg"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
  },
});
