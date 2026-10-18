# Release note — 2.2.0

What 2.2.0 ships. Language version stays `markvis: 2`. The new ways to draw a block (`render`, `markvis/react`, the script tag in any Markdown page, `markvis/rehype`, the GitHub Action, the model instruction) are listed in `CHANGELOG.md`; this note covers the chart changes and the site.

## Charts follow the host page

The one chart-visible change beyond layout: a chart drawn in a page takes its colors from the page.

- Every chart drawn in a page (the script tag, `render()`, `renderSvg()`, React, markdown-it, remark, rehype) writes each color twice: a fixed attribute, and a `style` that reads a CSS variable with the same color as its fallback, for example `fill="#3B82F6" style="fill:var(--markvis-series-1,#3B82F6)"`. The root `<svg>` reads `--markvis-font`.
- Eighteen color variables: `--markvis-ink`, `--markvis-muted`, `--markvis-grid`, `--markvis-paper`, `--markvis-plate`, `--markvis-plot`, `--markvis-series-1` through `--markvis-series-8`, `--markvis-accent`, `--markvis-up`, `--markvis-down`, `--markvis-total`, plus the opt-in `--markvis-font`. They ship as `CSS_VARIABLES` and `PAINT_NAMES` from `markvis/themes`.
- A page that sets none of them sees the same colors as before. Where styles are stripped, or the SVG is opened as an image, the fixed color shows.
- Files keep fixed colors: `markvis bake`, `markvis render`, and `surface: export` write the attribute only; host colors never change a baked file (`--colors host` opts in). `colors: "host" | "static"` on `render()`, `renderSvg()`, `initialize()`, and `<Markvis>`, and `--colors host|static` on `render` and `bake`, choose either mode.
- Heatmap and calendar color mixes, labels drawn on a mark, and the export plot border stay fixed. The Theming page lists every variable and three host snippets (system light or dark mode, a dark class on the page, and an editor theme's own variables).
- Inline SVG grows by about 0.8 kB per chart (about 0.1 to 0.2 kB gzip).

## Narrow widths

- Below the theme's width (720) a chart's height follows its width at the theme's aspect, never under 200. A title wraps at most once and ends in an ellipsis; the full title stays in the tooltip.
- A line or area over whole-number x (weeks, years) spans its data with whole-number ticks instead of padding to a value no row has.

## Site

markvis.js.org, not an npm API change:

- The home page fits its point on one screen. The first screen is a chart block that types itself, and the chart beside it is `render()` on that text, step by step: write, paste, change the kind (bar, sankey, treemap, heatmap), stack, theme, palette, page color, dark, width, and the table that stays when a block is invalid. The rows are real: the ten largest US source-to-sector energy flows in 2023 (US EIA, Monthly Energy Review). A click or a key opens the block as a live editor; reduced motion shows the finished chart with a Play button.
- Below it: four ways in (script tag, JavaScript, React, GitHub), Your colors (one SVG drawn on a light and a dark page, each setting a few `--markvis-*` variables), and "Seventeen kinds of chart": one card per type, each drawing the first example of that type, with its block and an Open in Play link to the same file. A numbers line (`56 kB gzip · 0 dependencies · under 1 ms a chart · plain SVG`) is held to `dist/markvis.min.js` by a test.
- Charts on the site, in the examples gallery, and in Play follow the site's light or dark mode through the same CSS variables, so no chart sits on a white card in dark mode.
- The social card (`og.png`) is the hero's finished chart.
- The docs sidebar runs Get started, Integrate, Theming, Chart types, Spec, Contributing. Theme content and the CSS variables live on the new Theming page; the model instruction moves to Integrate's "Tell a model". `/themes` and `/ai` redirect.
- The Playground is called Play.
- The README opens with a chart block and its picture, the numbers line, four ways in, and the model line.

## User-visible improvements

- Figures are laid out for the width you ask for. `renderSvg(chart, { width: 390 })` reflows the title, labels, and plot. Type stays about 21px for titles and 12px for ticks instead of shrinking with the SVG.
- Long titles wrap, including the unit on the last line, and the plot starts below those lines. Long category labels wrap or truncate, and the full string stays in an SVG `<title>`.
- Bar charts accept `orient: horizontal` for long labels. Vertical fences stay vertical. Input order and a zero baseline stay.
- Heatmaps draw a labeled color scale. A missing cell is hatched, not painted as the low color. `min` and `max` share that scale across figures.
- Treemaps use squarified tiles, parent headings, and parent-related colors. Tiny cells are not labeled.
- Sankey ribbons use one thickness for a value, at both ends and across the figure. Outer labels use that margin, and a truncated name keeps the full string in a `<title>`.
- Waterfall bars show the delta and the level after it. Increases and decreases use different colors and a sign. An optional `role` column can mark `total` or `subtotal`. Step text is never treated as a total.
- Gauges are a labeled range. If you omit `max`, the range is 0–100, and the unit sits next to the value. A value outside the range is marked above or below range.
- Radar charts show numeric rings, one scale for every series, and lighter fills. A grouped bar is the clearer choice when the exact number matters.
- Funnels stay centered bands that narrow from each stage to the next, with the stage name and value to the right of the shape.
- Line and area charts leave a gap for an empty cell. They do not connect through it or drop it to zero.
- `surface: light` (default) keeps a transparent canvas and dark ink, so the figure sits on the Markdown host. `surface: dark` and `surface: export` paint their own paper.

## Correctness fixes

- `0` stays zero. An empty measure cell is missing. `N/A`, `abc`, and any other non-numeric text is `E_BAD_NUMBER` with the row and column. The original table is kept.
- A repeated category/series key is `E_DUP_KEY`. Scatter, histogram, and waterfall step labels may repeat. Nothing silently keeps the last row.
- Tick and value labels use one formatter. `0.001`, `0.002`, and `0.003` stay distinct. Negative zero is shown as `0`.
- Sankey thickness is `value × one scale`. Equal values match. A cycle is `E_SANKEY_CYCLE`.
- `markvis check` reads every chart in a file and in a directory. One invalid chart makes the exit code non-zero and names the file and chart. Valid siblings are still reported.
- `markvis bake` rewrites an owned image reference when the chart count changes, overwrites the SVG that reference points at, and leaves author images alone. A second bake of an unchanged file does not rewrite it. A generated file is deleted only when this bake owned it and no chart still references it.
- `markvis: 99` is `E_BAD_VERSION`. Omitting `markvis` still means version 2.
- Fallback HTML from markdown-it and remark keeps extra cells that the parser kept.

## Intentional visual changes

- Default type is larger. Titles are 21px, ticks 12px, values 13px.
- The default figure does not paint a background. The host page does.
- Category labels are no longer rotated 55 degrees.
- Theme packs still differ in chrome, palette, and any type size already larger than the readable floor.

## Compatibility

- Existing vertical fences, themes, palettes, and layouts still parse.
- These inputs now fail instead of drawing a misleading figure:
  - `markvis` set to anything other than `2`
  - a non-numeric measure cell
  - an empty cell on pie, funnel, sankey, treemap, waterfall, gauge, or a stacked/percent layout
  - a repeated category/series key on bar, line, area, pie, heatmap, radar, sankey, or treemap
  - a sankey cycle
  - a gauge with more than one row
- A gauge that omitted `max` used to draw a full arc (`max(y, 1)`). It now draws against 0–100 unless you set `max`.
- Baked filenames for a single chart stay `name.svg`. Adding a second chart renames the owned reference to `name-1.svg` and writes `name-2.svg`.

## Migration

- Put `max` on a gauge whose value is not a percent of 100.
- Replace `N/A` or blank required cells, or switch a line/area chart to a gap by leaving the cell empty.
- Split or delete duplicate category/series rows. Do not rely on the last row winning.
- Remove sankey cycles, or the chart will fail and keep the table.
- Re-run `markvis bake` once so image references match the new filenames after you add or reorder charts.
