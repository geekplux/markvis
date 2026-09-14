---
title: Integrate
pageClass: folio-docs
sidebar: true
---

# Integrate

Four ways to show the chart. If none of them run, the table of numbers is still in the file.

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
<script type="module" src="./markvis.min.js"></script>
```

After `pnpm build`, use `dist/markvis.min.js` (not in git until you build). Packed install: `node_modules/markvis/dist/markvis.min.js`. Demo: `apps/playground/dropin.html`. The script does not re-read Markdown — comment-plus-table charts only work if the host already put them in the page.

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

## Also

- VS Code preview: `extensions/vscode-markvis-preview` (install from folder; Marketplace only if GeekPlux says so).
- Public site: markvis.js.org from branch `master` via GitHub Actions. Leave markvis-editor.js.org alone.
