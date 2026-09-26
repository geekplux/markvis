# bar

Use for category × number comparisons where row order matters (months, regions, ranked lists). One mark per category; optional `series` for grouped bars.

Do not use for continuous x (prefer `line` / `scatter`), part-to-whole slices (`pie`), or raw distribution bins (`hist`).

Optional `layout: grouped | stacked | percent` (Wave 1). Omit or `grouped` keeps side-by-side bars. Optional `orient: horizontal` for long category labels. An empty y is a missing mark, not a zero. Stacked and percent require every cell.
