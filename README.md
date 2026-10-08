# markvis

<p align="center">
  <img src="https://markvis.js.org/logo.png" width="128" height="128" alt="MarkVis" />
</p>

[![check](https://github.com/geekplux/markvis/actions/workflows/check.yml/badge.svg)](https://github.com/geekplux/markvis/actions/workflows/check.yml)
[![npm](https://img.shields.io/npm/v/markvis.svg)](https://www.npmjs.com/package/markvis)

**Charts in Markdown. The numbers are the picture.**

Write a short chart block in Markdown; markvis draws it as SVG — from a script tag, JavaScript, React, or any Markdown renderer. Where it cannot draw, the numbers stay as a table.

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
![Mar led Midtown box office at 9.2k tickets](https://markvis.js.org/home/01-bar-basic.svg)

**The data never disappears.** Without markvis the block is readable text, and the comment form (a one-line comment above a Markdown table) shows as a plain table, on github.com too. A block that cannot draw keeps its rows and shows one error line with a stable code.

**In a Markdown file or page** — one script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.min.js"></script>
```

**From JavaScript:**

```js
import { render } from "markvis";

element.innerHTML = render(blockText).html; // a figure, or the rows and one error line
```

**In React:**

```jsx
import { Markvis } from "markvis/react";

<Markvis source={blockText} />
```

**On GitHub** — a workflow step bakes the pictures, so README charts show on github.com:

```yaml
- uses: geekplux/markvis@master
```

**Try:** [Play](https://markvis.js.org/play) · [Examples](https://markvis.js.org/examples) · [Integrations](https://markvis.js.org/integrations) · [Chart types](https://markvis.js.org/types/) · [For AI](./docs/prompt.md)

## Why markvis

- **The chart is a table of text.** Readable in raw Markdown, changed by editing one number, and a model can read the numbers back.
- **It runs wherever Markdown runs:** a script tag, JavaScript, React and react-markdown (with streaming), markdown-it, remark and rehype (MDX), the command line, a GitHub Action.
- **Models write it from a short instruction.** With the 250-token [model instruction](./docs/prompt.md), models gave a valid block for 29 or 30 of 30 test prompts; without it, 0 to 2.
- **Safe by design.** A block holds data only: no HTML, no scripts. Every title, label, and cell is escaped in the SVG and the table.
- **Seventeen chart types** with readable defaults, and no d3.

In 2017 this project was a renderer (GitHub Trending). This is the rewrite: the same name, for people and for AI.

## What you can write

| | |
| --- | --- |
| Code block tags | `chart` `markvis` `vis` |
| Chart kinds | `bar` `line` `area` `scatter` `pie` `hist` `heatmap` `funnel` `waterfall` `radar` `gauge` `sankey` `treemap` `dumbbell` `bullet` `boxplot` `calendar` |
| Fields | `markvis` `type` `title` `unit` `x` `y` `series` plus `theme` `palette` `surface`. Type-local: `layout` `innerRadius` `min` `max` `orient` `role` `target` |
| Numbers | Comma-separated rows, or one Markdown table. Not JSON as the default. No JavaScript in the block. |

`theme:` how it is drawn: `folio` (default) `highcharts` `shadcn` `docs` `ant` `recharts` `graphite`. `palette:` colors only: `ink` `porcelain` `warm` `cool` `vivid`. Unknown look → table + error, never a silent swap. Pie slices are not forced to 100. Rows stay in the order you wrote them.

## Install and bake

`2.x` replaces `0.0.13` (the old d3 renderer stays in [legacy/](./legacy/)).

```bash
npm install markvis
npx markvis bake README.md
```

`bake` writes a picture next to the file and adds a Markdown image so GitHub can show it. The code block stays. Running bake again does nothing if nothing changed. `npx markvis check notes.md` checks every chart block in the file and exits non-zero if any block is invalid.

A blank measure cell is missing, not zero. Text such as `N/A` is an error (`E_BAD_NUMBER`) and the table stays. Omit `markvis` for version 2; any other version is rejected.

```js
import { parseMarkdown, renderSvg } from "markvis";

const parsed = parseMarkdown(markdown);
if (parsed.ok) {
  const svg = renderSvg(parsed.chart);
} else {
  // parsed.table still has the rows; parsed.error.code is stable
}
```

In a Markdown site — markdown-it, remark, or rehype. Each returns the picture and the data table:

```js
import markdownItMarkvis from "markvis/markdown-it"; // md.use(markdownItMarkvis)
import remarkMarkvis from "markvis/remark";          // remark().use(remarkMarkvis)
import rehypeMarkvis from "markvis/rehype";          // MDX, Astro: rehypePlugins: [rehypeMarkvis]
```

With an AI: put [docs/prompt.md](./docs/prompt.md) in the system prompt, or point a model at [llms.txt](./llms.txt) or [skills/markvis/SKILL.md](./skills/markvis/SKILL.md). It should write only the fields listed there, not a PNG, and never invent a type id.

## Docs

[Get started](https://markvis.js.org/get-started) · [Integrations](https://markvis.js.org/integrations) · [Integrate](./docs/integrate.md) · [SPEC.md](./SPEC.md) · [Themes](./docs/themes.md) · [Architecture](./docs/architecture.md) · [Contributing](./CONTRIBUTING.md) · [Changelog](./CHANGELOG.md)

0.0.13 (the old d3 renderer): [legacy/](./legacy/).
