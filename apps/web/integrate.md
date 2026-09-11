---
title: Integrate
pageClass: folio-docs
sidebar: true
---

# Integrate

Put a figure in any Markdown preview or rendered view. Four paste paths. No plugin still shows the table.

## 1. Bake

Keep the fence. Write SVG beside the file. Insert a Markdown image after the fence so GitHub, static hosts, and plain viewers show the figure.

```bash
pnpm markvis bake path/to.md
```

Second bake is a no-op when nothing changed. CI can run bake on push.

## 2. Browser script

Where the page already runs JavaScript, drop in the one-file build. Zero network after load. Finds fences tagged `chart` / `markvis` / `vis` and replaces them with the same SVG as Node.

```html
<script type="module" src="./markvis.min.js"></script>
```

Build `@markvis/browser` first; `packages/browser/dist/` is gitignored. Demo: `apps/playground/dropin.html`. The script does not re-parse Markdown — comment-plus-table charts only work if the host already emitted them into the DOM.

## 3. markdown-it

```js
import MarkdownIt from "markdown-it";
import markdownItMarkvis from "@markvis/markdown-it";

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
import remarkMarkvis from "@markvis/remark";

const html = String(
  await remark()
    .use(remarkMarkvis)
    .use(remarkHtml, { sanitize: false })
    .process(markdown),
);
// html contains <svg> and <table>
```

Host example: `examples/hosts/astro/` (and the package README). Same parser and render-svg as the CLI. No extra types.

## Also

- VS Code preview: `extensions/vscode-markvis-preview` (install from folder; Marketplace only if GeekPlux says so).
- Public site: markvis.js.org from branch `v2` via GitHub Actions — not master docsify. Leave markvis-editor.js.org alone.
