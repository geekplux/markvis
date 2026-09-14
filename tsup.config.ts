import { defineConfig } from "tsup";

const noExternal = [/^@markvis\//, "zod"];

export default defineConfig({
  entry: {
    index: "src/index.ts",
    parser: "src/parser.ts",
    "render-svg": "src/render-svg.ts",
    ir: "src/ir.ts",
    remark: "src/remark.ts",
    "markdown-it": "src/markdown-it.ts",
    themes: "src/themes.ts",
    cli: "src/cli.ts",
    "cli.bin": "src/cli.bin.ts",
  },
  format: ["esm"],
  platform: "node",
  target: "node20",
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ["markdown-it", "remark", "zod-to-json-schema"],
  noExternal,
});
