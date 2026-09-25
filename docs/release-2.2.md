# Release note — 2.2 candidate

The package version field is still `2.1.0` because this branch is not published. The behavior below is what a 2.2 release would ship. Language version stays `markvis: 2`.

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
- Funnels are left-aligned stage bars. The stage label sits beside the bar, in ink that matches the surface. Conversion to the previous stage is a percent rounded to one decimal.
- Line and area charts leave a gap for an empty cell. They do not connect through it or drop it to zero.
- `surface: light` (default), `dark`, and `export` each paint a coordinated background and ink. A transparent figure with dark text is no longer the only surface.

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
- The default surface is warm paper, not a transparent canvas.
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
