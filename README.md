<p align="center">
  <img src="apps/web/public/logo.png" width="128" height="128" alt="MarkVis" />
</p>

# markvis

[![check](https://github.com/geekplux/markvis/actions/workflows/check.yml/badge.svg)](https://github.com/geekplux/markvis/actions/workflows/check.yml)

**Charts in Markdown. The fence is the data.**

A Markdown fence — CSV or a GFM table — parses to IR and a deterministic SVG. Same text, same figure. Without a plugin, the table still shows. On error, the rows stay: a table plus one error line.

In 2017 this project was a renderer (GitHub Trending). This is the rewrite: a tiny chart **language** for humans and agents.

**Try:** [Play](https://markvis.js.org/play) · [Examples](https://markvis.js.org/examples) · [Spec for agents](https://markvis.js.org/llms.txt)

![Mar led Midtown box office](./examples/out/01-bar-basic.svg)

![Walk-up still leads member](./examples/out/02-line-multi.svg)

![MARTA takes the largest mode share](./examples/out/05-pie-raw.svg)

## Fence

Tags `chart` · `markvis` · `vis` are one language. Types: `bar` `line` `area` `scatter` `pie` `hist`. Optional `theme:` and `palette:` — [SPEC.md](./SPEC.md).

```chart
markvis: 2
type: bar
title: Mar led Midtown box office at 9.2k tickets
unit: tickets
x: month
y: tickets

month,tickets
Sep,5200
Oct,6100
Nov,7800
Dec,8500
Jan,4800
Feb,7200
Mar,9200
Apr,6900
```

Also legal: a GFM table after the blank line, or `<!-- chart: bar x=month y=tickets title="Mar led Midtown box office at 9.2k tickets" -->` immediately followed by a GFM table.

## Try it today

1. **Play** — paste a fence at [markvis.js.org/play](https://markvis.js.org/play). No install.

2. **This repo** (after `pnpm install && pnpm build`):

   ```bash
   pnpm markvis check examples/valid
   npx markvis bake README.md
   ```

   `check` exits 0 only when every fence is valid. `bake` writes an SVG next to the file, inserts a Markdown image, and keeps the fence. A second bake is a no-op.

3. **Packed library** — `2.0.0-rc.1` is this tree. It is **not** on the npm registry. `npm install markvis` still installs **0.0.13**.

   ```bash
   pnpm pack:lib
   npm install ./markvis-2.0.0-rc.1.tgz
   ```

   ```js
   import { parseMarkdown, renderSvg } from "markvis";

   const parsed = parseMarkdown(fence);
   if (parsed.ok) {
     const svg = renderSvg(parsed.chart);
   } else {
     // parsed.table still has the rows; parsed.error.code is stable
   }
   ```

4. **Plugin** — remark **or** markdown-it. Both emit SVG + the data table:

   ```js
   import MarkdownIt from "markdown-it";
   import markdownItMarkvis from "markvis/markdown-it";

   const html = new MarkdownIt({ html: true })
     .use(markdownItMarkvis)
     .render(markdown);
   // html contains <svg> and <table>
   ```

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
   ```

5. **Agent** — point a model at [skills/markvis/SKILL.md](./skills/markvis/SKILL.md) or [llms.txt](./llms.txt). It must emit only the fields listed there. Not a PNG. Not a seventh type.

## Language

| | |
| --- | --- |
| Tags | `chart` `markvis` `vis` |
| Types | `bar` `line` `area` `scatter` `pie` `hist` |
| Fields | `markvis` `type` `title` `unit` `x` `y` `series` plus `theme` `palette` |
| Data | CSV or one GFM table. Not JSON as the default. No JavaScript in a fence. |

`theme:` grammar packs: `folio` (default) `highcharts` `shadcn` `docs` `ant` `recharts`. `palette:` colors only: `ink` `porcelain` `warm` `cool` `vivid`. Unknown theme or palette → table + error, never a silent swap. Pie is not normalized to 100. Input row order is kept.

## Docs

[Get started](https://markvis.js.org/get-started) · [Integrate](./docs/integrate.md) · [SPEC.md](./SPEC.md) · [Themes](./docs/themes.md) · [Architecture](./docs/architecture.md) · [Contributing](./CONTRIBUTING.md) · [Release / merge](./docs/release.md)

0.0.13 (frozen d3 renderer): [legacy/](./legacy/).
