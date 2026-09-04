import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkMarkvis from "@markvis/remark";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "src/pages/index.md"), "utf8");
const html = String(
  remark().use(remarkMarkvis).use(remarkHtml, { sanitize: false }).processSync(source),
);
const page = `<!doctype html><html><head><meta charset="utf-8"><title>astro host</title></head><body>${html}</body></html>\n`;
mkdirSync(join(here, "dist"), { recursive: true });
writeFileSync(join(here, "dist/index.html"), page);
export { html };
