# Changelog

## 2.2.0 — 2026-10-19

Draw a chart block anywhere Markdown is shown: one call from JavaScript, React with streaming, one script tag in any Markdown page, rehype for MDX hosts, and a GitHub Action. Four more chart types, the graphite theme, and a measured instruction for models. The language stays `markvis: 2`. A 2.1 block still parses unless it hits one of the stricter checks listed under Breaking.

### Breaking

- The ES module `markvis.mjs` no longer draws on import. A page that loads it with `<script type="module" src=".../markvis@2/dist/markvis.mjs">` and relied on charts drawing by themselves now draws nothing. Import it and call `run()`, or load the classic `markvis.min.js`, which still draws once the page is ready.
- The drop-in's global (`window.markvis`) and `markvis.mjs` export `run`, `init`, `initialize`, `render`, and `parseBlock`, and nothing else; the classic `markvis.min.js` global also carries `startsOnLoad`, which reads a script tag's `data-start-on-load`. `replaceLanguageBlocks`, `replaceInDocument`, `autoReplace`, `wrapFence`, `chartBlockHtml`, `resultToHtml`, `htmlTable`, `escapeHtml`, `parseMarkdown`, `renderSvg`, `isChartBlock`, `enhanceChartSvg`, and `tipTextForMark` are gone from it. The `markvis` npm package still exports the parser and renderer functions.
- Stricter input checks. These blocks drew in 2.1 and now fail with a stable code, keeping their table: a non-numeric measure cell such as `N/A` (`E_BAD_NUMBER`); an empty cell on pie, funnel, sankey, treemap, waterfall, gauge, or a stacked/percent layout (`E_MISSING_VALUE`); a repeated category/series key, including a gauge with more than one row (`E_DUP_KEY`); a sankey cycle (`E_SANKEY_CYCLE`); and `markvis:` set to anything but `2` (`E_BAD_VERSION`). A gauge without `max` now draws against 0–100. See `docs/release-2.2.md` (Compatibility, Migration).

### Added

- Charts follow the host page through CSS variables, with fixed-color fallbacks. A chart drawn in a page writes each color as a fixed attribute plus a `style` that reads `--markvis-ink`, `--markvis-muted`, `--markvis-grid`, `--markvis-paper`, `--markvis-series-1` … `--markvis-series-8`, and the rest of 18 names (and an opt-in `--markvis-font`), so light, dark, and brand colors carry into the chart. The list ships as `CSS_VARIABLES` and `PAINT_NAMES` from `markvis/themes`. `colors: "host" | "static"` on `render()`, `renderSvg()`, `initialize()`, and `<Markvis>`; `--colors host|static` on `markvis render` and `bake`. Page: Theming.
- `parseBlock(text, { filename? })` parses one chart block: the inside a Markdown renderer hands a code-block plugin, or the whole block.
- `render(text, options?)` returns `{ ok, svg, html, chart }` or `{ ok: false, error, html, table }` in one call and never throws. `html` is the same figure, or table and one error line, that every adapter emits. Options: `width`, and `theme` / `palette` / `surface` for blocks that leave them out.
- `markvis/react`: `<Markvis source>` or `<Markvis chart data>` draws one block at the width of its container; `markvisComponents` draws chart code blocks in react-markdown; `remarkMarkvisStreaming` shows a placeholder and the rows so far while a block streams, never an error, and `<Markvis streaming>` does the same for a host that passes a block's partial text to its own renderer. `react` is an optional peer. It starts with `"use client";` so server-component frameworks load it as a client module.
- One script tag in any Markdown page: the drop-in finds chart blocks in the HTML of marked, markdown-it, highlight.js, Jekyll (kramdown + rouge), Hugo, MkDocs (custom fence), Pandoc, and docsify, and draws the comment + table form from the page. `markvis.run({ nodes, querySelector, root })`, `markvis.initialize({ theme, palette, surface, width })`, and `data-start-on-load="false"`.
- `markvis/rehype`: chart code blocks become real hast (figure, SVG, table) for MDX hosts such as Docusaurus and Astro. No raw HTML nodes, no new runtime dependency.
- A GitHub Action for any repository: `uses: geekplux/markvis@master` bakes chart blocks to SVG and commits them, so github.com shows the charts. Inputs `paths`, `commit`, `message`; a second run commits nothing. It runs the markvis release it ships with, commits only the files bake writes, and never pushes for a pull request from a fork.
- A 250-token model instruction (`docs/prompt.md`, also the opening of `llms.txt` and Integrate's Tell a model section). `pnpm eval-prompts --outputs <dir>` scores a directory of model answers: valid blocks, error codes, and chart type against `examples/prompts.md`.
- Site: a one-screen home whose first screen is a chart block that types itself while `render()` draws it, through each step from writing the block to its table fallback, on real data (the largest US energy flows in 2023, US EIA); a click opens it as a live editor. Below it: four ways in, a Your colors section (one SVG on a light and a dark page), and a card for each of the seventeen chart types. Charts on the site follow the site's light or dark mode, the social card is the hero's finished chart, and a Theming page lists the CSS variables. One generated page per chart type. `/themes` and `/ai` redirect to Theming and Integrate.
- **Wave 4 types:** `dumbbell` (two values per category, first hollow and second filled, signed change at the right) `bullet` (actual against an optional `target:` column, optional `min` / `max`), `boxplot` (distributions from raw rows, type-7 quartiles, Tukey whiskers), and `calendar` (one cell per `YYYY-MM-DD` day; new code `E_BAD_DATE`).
- `graphite` theme: editorial mono with a gray ladder, one accent on the largest value, pill bars, and heavy numbers. Inspired by lieflat-charts.
- Playground **Surface** control (`?surface=dark`).
- Horizontal bars (`orient`), surfaces (`light` / `dark` / `export`), heatmap color domain, waterfall `role`, and width-aware `renderSvg`. See `docs/release-2.2.md`.

### Changed

- Inline SVG bytes: a chart drawn in a page (`render()`, the drop-in, React, markdown-it, remark, rehype, `renderSvg()`) carries one `style` attribute per colored element and a `font-family` variable on the root, about 0.8 kB more per chart (about 0.1–0.2 kB gzip). `bake`, `markvis render`, and `surface: export` write the attribute only by default; host colors never change a baked file (`--colors host` opts in).
- The drop-in renders through `render()`: an empty block's error table shows the block as the page holds it, not a fence wrapped around it.
- The browser drop-in keeps cells past the header width in the error table, like every other path.
- markdown-it, remark, rehype, React, the drop-in, the Playground, and the command line's `preview` and `gallery` share one HTML module, so their output is the same. The command line's error table now keeps cells past the header width too.
- The themes now look distinct in structure, not just color: each owns its type ramp (floor: title 15, other roles 11), title alignment and subtitle, grid dash, axis lines and ticks, curve, point markers, legend keys, card frame, and dark paper. Every pair differs on at least four structural switches. See `docs/themes.md`.
- Readable type, wrapped labels, explicit paper/dark/export surfaces, gauge range 0–100 when `max` is omitted, sankey thickness. Funnel stays a centered silhouette.

### Fixed

- Narrow widths: below the theme's width (720) a chart's height follows its width at the theme's aspect (never under 200), and waterfall step labels split over two lines no longer reach into the title. A title wraps at most once at any width and ends in an ellipsis; the full title stays in the tooltip.
- A line or area over whole-number x (weeks 1–4, years) spans its data instead of padding to a 0 or 5 that no row has: up to 12 distinct values, each is a tick; past that, only whole-number ticks inside the data.
- Values spanning about -1e308 to 1e308 no longer hang axis ticks (bar, dumbbell, bullet, boxplot) or crash histogram bins.
- A fence cut off before its closing line, or an indented fence, keeps its rows when parsed as one block.
- Chart ids no longer import `node:crypto`, so `render()` and `markvis/react` bundle for the browser without a shim. Ids are unchanged.
- A top legend no longer sits on a wrapped title, and the y-axis title no longer runs through tick labels or repeats the unit.
- Non-numeric cells, duplicate keys, `markvis` version, multi-chart `check`, bake references, ragged fallback cells, and line gaps for missing values.
- Bullet charts keep a positive track at tiny widths; a value range that overflows to Infinity no longer writes `NaN` into a color or corner radius. Horizontal bar, dumbbell, boxplot, heatmap, pie and the axis charts also keep a positive plot (or radius) at tiny widths, and row charts drop their per-row value labels when there is no room for them.
- A stacked or percent bar reads as one bar in a theme with rounded bars: only its outermost segment is capped, the segments under it are plain rectangles, and the cap sits on the last series that has a value in that category. Before, every segment carried its own rounded end.

## 2.1.0 — 2026-09-25

Type packs land on npm. Thirteen chart kinds, layout encodings, and richer examples — still one Markdown fence language, no chart-library runtime.

### Added

- **Type packs** under `packages/types/<id>/` with a registry (same contribution shape as themes). Packs own paint; `@markvis/render-svg` keeps SVG chrome. Docs: `docs/TYPES.md`.
- **Wave 1 encodings:** `layout: grouped|stacked|percent` on `bar` / `line` / `area` (omit = grouped). `innerRadius` on `pie` in `[0, 1]` (omit = theme `PIE_INNER_RATIO`; explicit `0` = solid).
- **Wave 2 types:** `heatmap` `funnel` `waterfall` `radar` `gauge`. Gauge extras `min` / `max`. Funnel / radar negatives → `E_NEGATIVE_VALUE`.
- **Wave 3 types:** `sankey` `treemap`. Pack-local layout only (no d3-hierarchy / d3-sankey). Sankey: `series` required as target; self-link → `E_UNKNOWN_FIELD`. Treemap: flat or two levels only. Negatives → `E_NEGATIVE_VALUE`.
- Agent docs: encodings + full catalog notes in `llms.txt` / `llms-full.txt`. Spec and site Spec list all thirteen types.
- Examples densified for Wave 2–3 (real-job fences); home proof strip is bar · line · sankey.

### Changed

- Undeclared fence headers and illegal encodings fail with `E_UNKNOWN_FIELD` + table (no silent ignore).
- Old six fences without encodings stay valid; omit-encoding snapshots stay byte-stable.
- Sankey paint uses filled value ribbons (d3-sankey *behavior*, no d3 runtime) instead of thick stroked centerlines.

### Site (markvis.js.org — not an npm API change)

- Examples detail view re-renders live for theme ‖ palette (grid thumbs stay theme-baked).
- SiteNav GitHub control shows the live star count when the API responds.


## 2.0.2

README charts: same files as `examples/out/`, hosted at markvis.js.org so GitHub and npm both show them. The `v2` branch URLs 404 after the merge.

## 2.0.1

npm listing: README starts with `# markvis` so the website can render it; keywords and a short description are set. **2.x replaces 0.0.13.**

## 2.0.0

The 2017 project rewritten as a Markdown chart language. The fence is the data.

- Language tags `chart` / `markvis` / `vis` share one parser.
- Types: `bar` `line` `area` `scatter` `pie` `hist`.
- Fields: `markvis`, `type`, `title`, `unit`, `x`, `y`, `series`, plus `theme` and `palette`.
- Data: CSV or a GFM table (not JSON as the default).
- Path: fence → Chart IR → deterministic SVG. Invalid input keeps a table plus a stable error code.
- CLI: `check`, `render`, `preview`, `stats`, `to-table`, `gallery`, `bake`.
- Hosts: `markvis/remark`, `markvis/markdown-it`, browser IIFE, Play at markvis.js.org/play.
- Packed library name remains `markvis`. **2.0.0 replaces 0.0.13** on npm (`legacy/` keeps the 2017 renderer).

The frozen 0.0.13 d3 renderer lives under `legacy/`.

## 0.0.13

See `legacy/`. markdown-it plugin; d3 + per-chart packages.
