---
title: Integrate
pageClass: folio-docs
sidebar: true
---

# Integrate

Seven ways to show the chart. If none of them run, the table of numbers is still in the file.

## 1. Save a picture (bake)

Write a picture next to the Markdown and add an image so GitHub, static hosts, and plain viewers can show it. The code block stays.

```bash
npm install markvis
npx markvis bake path/to.md
```

Running bake again does nothing if nothing changed. **2.0.0 replaces 0.0.13.**

### GitHub Action

github.com runs no scripts, so a README shows a picture or a table. This workflow bakes the pictures on every push and commits them; the chart blocks stay.

```yaml
name: bake charts
on: { push: { branches: [main] } }
permissions: { contents: write }
jobs:
  bake:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: geekplux/markvis@master
        with: { paths: README.md docs }
```

Inputs: `paths` (files or folders, space-separated; default `README.md`), `commit` (`"false"` bakes without committing), and `message` (default `chore: bake markvis charts`). A second run with nothing new commits nothing. On pull requests, check out the pull request's branch (set the checkout `ref` to `github.head_ref`); a pull request from a fork is baked but not committed.

Without the Action, write the comment form. github.com shows it as a plain table, and every markvis host draws it:

```markdown
<!-- chart: bar x=day y=visits title="Visits" -->
| day | visits |
| --- | --- |
| Mon | 3 |
| Tue | 5 |
```

## 2. One script tag, in a page or a Markdown file

Put one `<script>` in a Markdown file, or in the HTML page around it. Once the page is ready, every chart block on it becomes a chart.

````markdown
<script src="https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.min.js"></script>

```chart
type: bar
title: Visits
x: day
y: visits

day,visits
Mon,3
Tue,5
```
````

The tag can sit at the top or the bottom, with or without `defer`. It finds the block whatever HTML the renderer made of it — `language-chart`, `lang-chart`, `data-lang="chart"`, or Pandoc's `class="chart"`, on the `code`, the `pre`, or a highlighter wrapper — and replaces the wrapper with the figure, copy buttons and all. The comment form works too: `<!-- chart: bar x=day y=visits -->` right above a Markdown table becomes a chart, and stays a plain table wherever scripts do not run.

**Works** wherever Markdown becomes HTML and the page may run a script: Jekyll and GitHub Pages sites, Hugo, MkDocs, Hexo, Eleventy, docsify, Pandoc HTML, plain HTML pages, and most hand-built Markdown viewers.

- Hugo: raw HTML is off by default. Set `markup.goldmark.renderer.unsafe = true` for the script tag and the comment form, or add the script to your layout.
- MkDocs: add a custom fence so the block keeps its language (see `examples/hosts/mkdocs/`), and the script under `extra_javascript`.
- docsify renders after load: add `plugins: [(hook) => hook.doneEach(() => markvis.run())]` to `window.$docsify`.

**Does not work** where scripts are stripped: README and file views on github.com, the default VS Code preview, Obsidian, Notion. There, bake a picture (section 1), use the VS Code preview extension, or write the comment form so readers see the table.

Use a plain `<script>`, not `type="module"`, so the page can reach `window.markvis`. A local copy works the same: `node_modules/markvis/dist/markvis.min.js`.

Content that arrives later — a chat reply, a client-side route — needs one call once it is in the page. Blocks already drawn are left alone, so running twice never draws twice.

```js
markvis.run();                              // the whole page
markvis.run({ root: messageElement });      // one part of it
markvis.run({ querySelector: ".my-chart" }); // these elements hold chart text
```

`run` returns how many charts it drew. `markvis.init(element)` is the short form of `run({ root: element })`.

Page defaults for blocks that leave a field out: `markvis.initialize({ theme: "docs", palette: "cool", surface: "dark", width: 640 })`. A block's own field wins. To keep the script from drawing on load, use `<script src="…/markvis.min.js" data-start-on-load="false">` and call `run()` yourself. The ES module, `markvis.mjs`, never draws on import: `import { run, initialize } from "https://cdn.jsdelivr.net/npm/markvis@2/dist/markvis.mjs"`.

Demos: `apps/playground/dropin.html`, `examples/hosts/script-tag/`, `examples/hosts/mkdocs/`.

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

## 5. rehype and MDX

For pipelines that work on HTML trees — MDX docs sites, Astro, Next.js MDX, or `unified` with `remark-rehype` — use `markvis/rehype`. It replaces each chart code block with real elements (figure, SVG, table), not a raw HTML string, so MDX accepts it.

```js
import rehypeMarkvis from "markvis/rehype";

// unified
unified().use(remarkParse).use(remarkRehype).use(rehypeMarkvis).use(rehypeStringify);

// a docs preset that takes rehype plugins
presets: [["classic", { docs: { rehypePlugins: [rehypeMarkvis] } }]];
```

Astro 7: install `@astrojs/markdown-remark`, then set `markdown.processor: unified({ rehypePlugins: [rehypeMarkvis] })` and `markdown.syntaxHighlight: { type: "shiki", excludeLangs: ["chart", "markvis", "vis"] }` so Shiki leaves chart blocks alone. Host examples: `examples/hosts/docusaurus/`, `examples/hosts/astro/`.

## 6. JavaScript

Pass one chart block — the inside a Markdown renderer hands a code-block plugin, or the whole block with its fence lines — and get the chart in one call. It never throws.

```js
import { render } from "markvis";

const result = render(blockText, { width: 480 });
element.innerHTML = result.html;
```

`result.html` is the same HTML every other path emits: a `<figure>` with the SVG, a caption, and the data table, or, when the block is wrong, the data table and one error line. When `result.ok` is true, `result.svg` is the SVG alone and `result.chart` is the parsed chart. Otherwise `result.error.code` is a stable code and `result.table` holds the rows.

Options: `width` (default 720), and `theme`, `palette`, `surface` for blocks that leave them out — a block's own field always wins. `filename` names the source for a derived title. In the browser the drop-in exposes the same function as `markvis.render`.

To parse without drawing, use `parseBlock(blockText)`. To read every chart in a Markdown document, use `parseDocument`.

## 7. React

`markvis/react` draws a block in a React app. `react` 18 or later is the only peer; nothing else is installed.

```jsx
import { Markvis } from "markvis/react";

// Block text: from Markdown, an API field, or a file
<Markvis source={blockText} />

// A chart object and rows: from a backend, no Markdown
<Markvis
  chart={{ type: "bar", title: "Revenue by month", x: "month", y: "revenue", unit: "USD" }}
  data={[{ month: "Jan", revenue: 120 }, { month: "Feb", revenue: 95 }]}
/>
```

Both forms go through the same parser. `chart` + `data` becomes a block (header lines, then CSV), so it is checked like text and fails with the same error codes, keeping the rows. The chart takes the width of the element around it and redraws after that width changes. Props: `width`, `theme`, `palette`, and `surface` (used where the block leaves them out), `className`, and `onError(error)`.

In react-markdown, or anything that takes a `components` map:

```jsx
import Markdown from "react-markdown";
import { markvisComponents, remarkMarkvisStreaming } from "markvis/react";

<Markdown
  remarkPlugins={streaming ? [remarkMarkvisStreaming] : []}
  components={markvisComponents}
>
  {reply}
</Markdown>
```

Only `chart` / `markvis` / `vis` code blocks change. Merge your own with `{ ...markvisComponents, ...mine }`. While a reply streams, `remarkMarkvisStreaming` holds a block whose closing fence has not arrived: it shows "Drawing chart…" and the whole rows so far, never an error, and draws when the fence closes. Leave the plugin out once the reply is complete, so a block that was never closed still draws. No `rehype-raw` is needed.

A server render uses the default width (720) until the page hydrates. To let the SVG shrink to its box before then, add `.markvis svg { max-width: 100%; height: auto; }`.

Host example: `examples/hosts/react-markdown/`.

## Also

- VS Code preview: `extensions/vscode-markvis-preview` (install from folder; not yet on the Marketplace).
