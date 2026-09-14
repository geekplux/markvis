import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import markdownItMarkvis from "@markvis/markdown-it";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "index.md"), "utf8");
const html = new MarkdownIt({ html: true }).use(markdownItMarkvis).render(source);
const page = `<!doctype html><html><head><meta charset="utf-8"><title>vitepress host</title></head><body>${html}</body></html>\n`;
mkdirSync(join(here, "dist"), { recursive: true });
writeFileSync(join(here, "dist/index.html"), page);
export { html };
