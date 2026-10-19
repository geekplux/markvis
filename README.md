# markvis

[![check](https://github.com/geekplux/markvis/actions/workflows/check.yml/badge.svg)](https://github.com/geekplux/markvis/actions/workflows/check.yml)
[![npm](https://img.shields.io/npm/v/markvis.svg)](https://www.npmjs.com/package/markvis)

**Charts in Markdown. The numbers are the picture.**

Write a short chart block in Markdown. markvis draws it wherever the Markdown is shown: a page, a note, a chat reply, a docs site. Where it cannot draw, the numbers stay as a table.

```chart
type: bar
title: Visits by day
x: day
y: visits

day,visits
Mon,3
Tue,5
Wed,4
Thu,6
Fri,8
```
![Visits by day](https://markvis.js.org/home/visits-by-day.svg)

58 kB gzip · 0 dependencies · under 1 ms a chart · plain SVG

**One script tag**, in a page or a Markdown file. Every chart block on it draws.

```html
<script src="https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.min.js"></script>
```

**JavaScript.** One call. It never throws: a wrong block comes back as its rows and one error line.

```js
import { render } from "markvis";

element.innerHTML = render(blockText).html;
```

**React.** Follows its container, and draws while a reply streams.

```jsx
import { Markvis } from "markvis/react";

<Markvis source={blockText} />
```

**GitHub.** github.com runs no scripts, so bake a picture next to the block. A workflow step can do it on every push.

```bash
npx markvis bake README.md
```

**Tell your model.** Put the 250-token [instruction](./docs/prompt.md) in a system prompt and it writes this block instead of an image or JSON. The same text opens [llms.txt](./llms.txt).

**Your colors.** A chart drawn in your page reads your CSS variables (`--markvis-ink`, `--markvis-grid`, `--markvis-series-1` …), so it follows light, dark, and brand colors. Each color keeps a fixed fallback, and `bake` writes fixed colors by default.

[Play](https://markvis.js.org/play) · [Examples](https://markvis.js.org/examples) · [Integrate](https://markvis.js.org/integrate) · [Theming](https://markvis.js.org/theming) · [Chart types](https://markvis.js.org/types/)

## Why markvis

- **The chart is a table of text.** Readable in raw Markdown, changed by editing one number, and a model can read the numbers back.
- **The data never disappears.** Without markvis the block is readable text, and the comment form (a one-line comment above a Markdown table) shows as a plain table, on github.com too. A block that cannot draw keeps its rows and shows one error line with a stable code.
- **Models write it from a short instruction.** A 250-token [model instruction](./docs/prompt.md) for a system prompt; the same text opens [llms.txt](./llms.txt).
- **Safe by design.** A block holds data only: no HTML, no scripts. Every title, label, and cell is escaped in the SVG and the table.
- **Seventeen chart types** with readable defaults, and no d3.

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

On GitHub, a workflow step bakes the pictures on every push ([full workflow](https://markvis.js.org/integrate#bake)):

```yaml
- uses: geekplux/markvis@master
```

A blank measure cell is missing, not zero. Text such as `N/A` is an error (`E_BAD_NUMBER`) and the table stays. Omit `markvis` for version 2; any other version is rejected.

To parse without drawing, `parseBlock(text)` returns the chart or a stable error code with the rows. To read every chart in a document, `parseDocument(markdown)`.

In a Markdown site — markdown-it, remark, or rehype. Each returns the picture and the data table:

```js
import markdownItMarkvis from "markvis/markdown-it"; // md.use(markdownItMarkvis)
import remarkMarkvis from "markvis/remark";          // remark().use(remarkMarkvis)
import rehypeMarkvis from "markvis/rehype";          // MDX, Docusaurus: rehypePlugins: [rehypeMarkvis]
```

With an AI: put [docs/prompt.md](./docs/prompt.md) in the system prompt, or point a model at [llms.txt](./llms.txt) or [skills/markvis/SKILL.md](./skills/markvis/SKILL.md). It should write only the fields listed there, not a PNG, and never invent a type id.

## Docs

[Get started](https://markvis.js.org/get-started) · [Integrate](https://markvis.js.org/integrate) · [SPEC.md](./SPEC.md) · [Themes](./docs/themes.md) · [Architecture](./docs/architecture.md) · [Contributing](./CONTRIBUTING.md) · [Changelog](./CHANGELOG.md)

In 2017 this project was a renderer (GitHub Trending). This is the rewrite: the same name, for people and for AI. 0.0.13 (the old d3 renderer): [legacy/](./legacy/).
