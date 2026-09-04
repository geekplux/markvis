---
title: Integrate
---

How markvis shows up where Mermaid shows up — by bake and adapters, not by waiting for GitHub.com.

## GitHub README

GitHub will not grow a native chart fence. Use markvis bake on README.md and docs/landing.md. Keeps the fence; inserts a markdown image after it. Second bake is a no-op. CI workflow bake.yml runs on v2 push and PR.

## Any JS preview

Drop in packages/browser/dist/markvis.min.js (or .mjs). Zero network. Finds pre/code with language chart, markvis, or vis and replaces with the same SVG as Node.

After clone: install deps, build the browser package (see package name @markvis/browser in the monorepo), then open apps/playground/dropin.html. dist is gitignored — without that build the script 404s. For the live editor, start the playground Vite app.

Demo: apps/playground/dropin.html.

HTML comment plus GFM table charts only survive if the host already emitted them into the DOM; the browser script does not re-parse Markdown.

## VitePress / Astro / markdown-it / remark

| Host | Path |
| --- | --- |
| VitePress | examples/hosts/vitepress/ — wire @markvis/markdown-it in markdown.config |
| Astro | examples/hosts/astro/ |
| markdown-it | examples/hosts/markdown-it/ + package @markvis/markdown-it |
| remark | package @markvis/remark (short README + 15-line example) |

Each host example renders at least one valid fence to HTML with svg and table elements.

## VS Code

extensions/vscode-markvis-preview — Markdown preview renders chart / markvis / vis to SVG. Install from folder or vsce package. Do not publish to Marketplace unless GeekPlux says so. See that folder README.

## Explicit non-goals

- Waiting for github.com to add native markvis fences
- Docusaurus adapter (skipped for now — use bake or the browser drop-in; MDX surface is not cheap)
- A second theme field, new chart types, or d3 in packages/ or apps/
