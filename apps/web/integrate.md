---
title: Integrate
pageClass: folio-docs
sidebar: true
---

# Integrate

Five ways to show the chart. If none of them run, the table of numbers is still in the file.

## 1. Save a picture (bake)

Write a picture next to the Markdown and add an image so GitHub, static hosts, and plain viewers can show it. The code block stays.

```bash
npm install markvis
npx markvis bake path/to.md
```

Running bake again does nothing if nothing changed. CI can run bake on push. **2.0.0 replaces 0.0.13.**

## 2. Browser script

If the page already runs JavaScript, drop in the one-file build. After load it finds blocks tagged `chart` / `markvis` / `vis` and replaces them with the same picture as on the server.

```html
<script src="https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.min.js"></script>
```

Use a plain `<script>`, not `type="module"`, so the page can reach `window.markvis`. A local copy works the same: `node_modules/markvis/dist/markvis.min.js`.

Content that arrives later — a chat reply, a client-side route — needs one more call after it is in the page. Blocks already drawn are left alone.

```js
markvis.init(messageElement);
```

Demo: `apps/playground/dropin.html`. The script does not re-read Markdown — comment-plus-table charts only work if the host already put them in the page.

## 3. markdown-it

```js
import MarkdownIt from "markdown-it";
import markdownItMarkvis from "markvis/markdown-it";

const html = new MarkdownIt({ html: true })
  .use(markdownItMarkvis)
  .render(markdown);
// html contains <svg> and <table>
```

VitePress: `markdown.config(md) { md.use(markdownItMarkvis) }`. Host example: `examples/hosts/vitepress/`, `examples/hosts/markdown-it/`.

## 4. remark

```js
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkMarkvis from "markvis/remark";

const html = String(
  await remark()
    .use(remarkMarkvis)
    .use(remarkHtml, { sanitize: false })
    .process(markdown),
);
// html contains <svg> and <table>
```

Host example: `examples/hosts/astro/` (and the package README). Same drawing as the command line. No extra chart kinds.

## 5. JavaScript

Pass one chart block — the inside a Markdown renderer hands a code-block plugin, or the whole block with its fence lines — and get the chart in one call. It never throws.

```js
import { render } from "markvis";

const result = render(blockText, { width: 480 });
element.innerHTML = result.html;
```

`result.html` is the same HTML every other path emits: a `<figure>` with the SVG, a caption, and the data table, or, when the block is wrong, the data table and one error line. When `result.ok` is true, `result.svg` is the SVG alone and `result.chart` is the parsed chart. Otherwise `result.error.code` is a stable code and `result.table` holds the rows.

Options: `width` (default 720), and `theme`, `palette`, `surface` for blocks that leave them out — a block's own field always wins. `filename` names the source for a derived title. In the browser the drop-in exposes the same function as `markvis.render`.

To parse without drawing, use `parseBlock(blockText)`. To read every chart in a Markdown document, use `parseDocument`.

## Also

- VS Code preview: `extensions/vscode-markvis-preview` (install from folder; not yet on the Marketplace).
