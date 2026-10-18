// Compiles Chart.svelte for the server, renders valid 01 and invalid 01
// through it, checks both, and writes dist/index.html.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";

const here = (path) => new URL(path, import.meta.url);
const block = (path) => readFileSync(here(path), "utf8").match(/^```chart\n([\s\S]*?)\n```/m)[1];

mkdirSync(here("dist/"), { recursive: true });
const { js } = compile(readFileSync(here("Chart.svelte"), "utf8"), {
  filename: "Chart.svelte",
  generate: "server",
});
writeFileSync(here("dist/Chart.js"), js.code);
const { default: Chart } = await import(here("dist/Chart.js").href);
const draw = (source) => render(Chart, { props: { source } }).body;

const pages = {
  valid: draw(block("../../valid/01-bar-basic.md")),
  invalid: draw(block("../../invalid/01-unknown-type.md")),
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
