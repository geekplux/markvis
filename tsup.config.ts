import { defineConfig, type Options } from "tsup";

const shared: Options = {
  format: ["esm"],
  platform: "node",
  target: "node20",
  dts: false,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  external: ["markdown-it", "remark", "react", "zod-to-json-schema"],
  noExternal: [/^@markvis\//, "zod"],
};

// tsup applies `banner` to every entry of a config, so markvis/react gets a
// config of its own: it is the only entry that is a React client module.
// The two configs build in parallel; only the first cleans dist/, and it
// leaves the react files alone.
export default defineConfig([
  {
    ...shared,
    entry: {
      index: "src/index.ts",
      parser: "src/parser.ts",
      "render-svg": "src/render-svg.ts",
      ir: "src/ir.ts",
      remark: "src/remark.ts",
      rehype: "src/rehype.ts",
      "markdown-it": "src/markdown-it.ts",
      themes: "src/themes.ts",
      cli: "src/cli.ts",
      "cli.bin": "src/cli.bin.ts",
    },
    clean: ["!react.js", "!react.js.map"],
  },
  {
    ...shared,
    entry: { react: "src/react.ts" },
    banner: { js: '"use client";' },
    treeshake: false,
    clean: false,
  },
]);
