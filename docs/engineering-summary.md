# Engineering summary

## What changed

Shared data handling now classifies each measure cell as a finite number, a missing cell, or invalid text before any chart paints. Invalid text fails with `E_BAD_NUMBER` and the row and column. Missing cells are gaps on line, area, grouped bar, scatter, histogram, heatmap, and radar, and errors on charts that need every value. Duplicate category/series keys fail with `E_DUP_KEY`. Scatter, histogram, and waterfall steps may repeat. `markvis` other than `2` fails with `E_BAD_VERSION`. Public docs that still listed only the first six chart kinds now list the same thirteen types as the spec.

One formatter feeds ticks and value labels. Sankey thickness is `value × one pixels-per-unit scale` for the whole figure. `check` walks every extracted block. `bake` treats a following `name.svg` / `name-N.svg` image as owned, rewrites the reference when the chart count changes, and deletes a file only when that ownership is established and nothing still points at it.

`renderSvg(chart, { width, surface })` sets the frame width and a light, dark, or export surface, then the painters lay out in that width. Title, tick, and value sizes stay at a readable floor (21 / 12 / 13) unless the theme is already larger. Text width uses the in-repo estimator (0.62em Latin, 1em wide scripts). The title line count is measured at the same x the title is drawn, and the unit shares the last line's width, so a wrapped title stays above the plot. A horizontal bar draws that title across the full figure width: at 390px the USD example is two lines, "Synthetic regional" and "program costs · USD", and the bars start below them. Bar charts gained `orient: horizontal`. Heatmap, treemap, waterfall, gauge, radar, funnel, and line/area paint use that shared frame and the numeric classes. Funnel stays a centered silhouette: each band narrows from one stage to the next, and the label sits to the right of the shape. Sankey outer labels use the reserved margin, and the full node name stays in a `<title>`.

## Why it matters

A pasted table was able to draw `N/A` as zero, hide a second broken chart from `check`, point a README at a stale SVG, and draw two Sankey links of 100 at different thicknesses. Those figures were not safe to publish. The same inputs now fail with the table intact, or draw a figure whose labels, scale, and thickness match the numbers.

## What was tested

- `pnpm test` after the changes: 33 files, 810 tests, including the title, funnel, Sankey, small-fraction, and inside-frame label regressions. The baseline before the changes was 764 passing tests.
- New vitest files call `parseMarkdown`, `renderSvg`, `runCli`, and both adapters' `chartBlockHtml`.
- `examples/valid` (88 files) and `examples/invalid` (39 files) through the parser fixtures.

## What was visually inspected

SVG output, not screenshots, in `examples/compare/`: bar, multi-series line, scatter, pie, histogram, long labels, long title, small fractions, negatives, a dense bar, non-ASCII labels, heatmap, funnel, waterfall, radar, gauge, sankey including equal flows, treemap, and the horizontal USD bar at 720px and 390px. The same page includes 960px layouts and light, dark, and export surfaces. The malformed bar is the adapter fallback: the original rows (blank, `N/A`, `abc`, and zero) plus `E_BAD_NUMBER`, not a chart. The line with an empty middle y is two markers and no segment through the gap. On the small-fraction bar, `0.003` sits inside the tallest bar below the title. Checked text on the negative, dense, non-ASCII, horizontal, and line-gap figures stays inside the SVG at 720px and at 390px.

Playwright's command-line tool reported version 1.63.0, then the Chromium download timed out, so there is no browser screenshot. The SVG checks above do not depend on that screenshot.

## Performance

Forty iterations, one process, markvis 2.1.0 and this branch, on the same inputs:

| Fixture | Parse before | Parse after | Render before | Render after | SVG bytes before | SVG bytes after |
| --- | --- | --- | --- | --- | --- | --- |
| `02-line-multi` | 0.070 ms | 0.062 ms | 0.203 ms | 0.171 ms | 6052 | 6416 |
| `35-bar-thirteen-cats` | 0.017 ms | 0.023 ms | 0.103 ms | 0.089 ms | 5151 | 5404 |
| small fractions | 0.009 ms | 0.009 ms | 0.040 ms | 0.040 ms | 2428 | 2565 |
| scatter | 0.015 ms | 0.018 ms | 0.061 ms | 0.077 ms | 3794 | 4334 |
| pie | 0.012 ms | 0.015 ms | 0.046 ms | 0.049 ms | 2885 | 3002 |
| histogram | 0.024 ms | 0.023 ms | 0.073 ms | 0.094 ms | 4407 | 4977 |
| funnel | 0.015 ms | 0.018 ms | 0.033 ms | 0.055 ms | 2735 | 3096 |
| waterfall | 0.016 ms | 0.014 ms | 0.077 ms | 0.110 ms | 4020 | 5607 |
| radar | 0.021 ms | 0.023 ms | 0.065 ms | 0.070 ms | 3065 | 3276 |
| gauge | 0.014 ms | 0.018 ms | 0.027 ms | 0.027 ms | 1847 | 1975 |
| treemap | 0.014 ms | 0.025 ms | 0.070 ms | 0.098 ms | 4957 | 6145 |

There is no speed target. Byte counts are the stable comparison. Times move a few hundredths of a millisecond between runs. Output is larger where titles wrap, a surface rect is present, or labels carry the full string in a `<title>`.

## Remaining limitations

- Text width is an estimate. A host font that is much wider than 0.62em can still collide.
- Histogram empty rows are skipped rather than rejected. Invalid histogram text is rejected.
- Waterfall totals exist only when the author sets `role`. There is no inferred total.
- Funnel bands narrow from one stage's value to the next. The side label is the stage name and its value.
- Radar `max` below the data expands the scale to the data so a spoke is not clipped; the authored maximum is not drawn as a second ring in that case.
- `parseMarkdown` still returns the first chart. `check` and `parseDocument` cover every chart. Host plugins replace each fence on their own.
- The package version field is still 2.1.0 and has not been published.

## Blocked work

None in the repository. Publishing and a live model evaluation were out of scope and were not attempted.
