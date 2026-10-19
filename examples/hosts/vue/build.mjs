// Compiles Chart.vue for the server, renders valid 01 and invalid 01
// through it, checks both, and writes dist/index.html.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createSSRApp, h } from "vue";
import { compileScript, parse } from "vue/compiler-sfc";
import { renderToString } from "vue/server-renderer";

const here = (path) => new URL(path, import.meta.url);
const block = (path) => readFileSync(here(path), "utf8").match(/^```chart\n([\s\S]*?)\n```/m)[1];

mkdirSync(here("dist/"), { recursive: true });
const { descriptor } = parse(readFileSync(here("Chart.vue"), "utf8"), { filename: "Chart.vue" });
const script = compileScript(descriptor, {
  id: "markvis-chart",
  inlineTemplate: true,
  templateOptions: { ssr: true },
});
writeFileSync(here("dist/Chart.js"), script.content);
const { default: Chart } = await import(here("dist/Chart.js").href);
const draw = (source) => renderToString(createSSRApp({ render: () => h(Chart, { source }) }));

const pages = {
  valid: await draw(block("../../valid/01-bar-basic.md")),
  invalid: await draw(block("../../invalid/01-unknown-type.md")),
};
const checks = [
  ["valid", "<svg"],
  ["valid", 'data-chart-type="bar"'],
  ["invalid", "markvis-error"],
  ["invalid", "<table"],
];
for (const [page, text] of checks) {
  if (!pages[page].includes(text)) {
    throw new Error(`${page}: expected ${text}`);
  }
}

writeFileSync(
  here("dist/index.html"),
  `<!doctype html>\n<meta charset="utf-8">\n${pages.valid}\n${pages.invalid}\n`,
);
console.log("dist/index.html: valid and invalid checks pass");
