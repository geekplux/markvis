// Renders valid 01, invalid 01, and a reply cut off inside its chart block
// through the host, checks each, and writes dist/index.html.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Streamdown } from "streamdown";
import { markvisRenderer } from "./renderer.mjs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const draw = (markdown, isAnimating = false) =>
  renderToStaticMarkup(
    createElement(Streamdown, { plugins: { renderers: [markvisRenderer] }, isAnimating }, markdown),
  );

const valid = read("../../valid/01-bar-basic.md");
const pages = {
  valid: draw(valid),
  invalid: draw(read("../../invalid/01-unknown-type.md")),
  streaming: draw(valid.slice(0, valid.indexOf("Feb,")), true),
};

const checks = [
  ["valid", '<svg', true],
  ["valid", 'data-chart-type="bar"', true],
  ["invalid", "markvis-error", true],
  ["invalid", "<table", true],
  ["streaming", "Drawing chart…", true],
  ["streaming", "markvis-error", false],
];
for (const [page, text, wanted] of checks) {
  if (pages[page].includes(text) !== wanted) {
    throw new Error(`${page}: expected ${wanted ? "" : "no "}${text}`);
  }
}

mkdirSync(new URL("dist/", import.meta.url), { recursive: true });
writeFileSync(
  new URL("dist/index.html", import.meta.url),
  `<!doctype html>\n<meta charset="utf-8">\n${Object.values(pages).join("\n")}\n`,
);
console.log("dist/index.html: valid, invalid, and streaming checks pass");
