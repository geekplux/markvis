import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { rehypeMarkvis } from "@markvis/remark";

// The pipeline astro.config.mjs sets up, without the Astro runtime.
const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "src/pages/index.md"), "utf8");
const html = String(
  remark().use(remarkRehype).use(rehypeMarkvis).use(rehypeStringify).processSync(source),
);
const page = `<!doctype html><html><head><meta charset="utf-8"><title>astro host</title></head><body>${html}</body></html>\n`;
mkdirSync(join(here, "dist"), { recursive: true });
writeFileSync(join(here, "dist/index.html"), page);
export { html };
