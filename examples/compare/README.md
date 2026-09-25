# Before and after

Actual SVG from this library. `before/` is markvis 2.1.0. `after/` is this branch. Open `index.html`.

The set includes a bar, multi-series line, scatter, pie, histogram, long labels, a long title, small fractions, negatives, a dense bar, non-ASCII labels, heatmap, funnel, waterfall, radar, gauge, sankey, treemap, and the horizontal bar. Narrow (390) and wide (960) layouts, and light, dark, and export surfaces, are in the same page.

Synthetic titles say so. Fixture names such as MARTA are example data already in the repo, not a claim of measured transit counts.

The malformed bar keeps every original cell in `after/missing-malformed.html` (blank, `N/A`, `abc`, and a real zero) plus `E_BAD_NUMBER`. It is not drawn. An empty cell on a line is `after/line-gap.svg`: two markers and no segment through the gap. Negatives, non-ASCII labels, the dense bar, and the horizontal USD bar are on the same page at 720px and at 390px. Version 2.1.0 had no width or surface argument, so those rows use its 720px figure as the before image.
