---
name: markvis
description: Use when the user wants a chart of numbers in Markdown (bar, line, area, scatter, pie, hist, heatmap, funnel, waterfall, radar, gauge, sankey, treemap) from a table — emit a Markdown code block tagged chart|markvis|vis, never a flowchart pie/xychart, never a PNG, never Vega-Lite JSON as the default.
---

# markvis

Charts of numbers in Markdown. The table is the source (comma-separated rows or a Markdown table). Tags `chart`, `markvis`, and `vis` are the same language. Types: `bar` `line` `area` `scatter` `pie` `hist` `heatmap` `funnel` `waterfall` `radar` `gauge` `sankey` `treemap`.

## When to use

- Numbers in a doc need a chart and the rows must stay editable.
- An agent should be able to add a row, change `type`, and regenerate.
- Readers without a plugin still need the table.

## When not to use

- Flowcharts, sequence, state, ER → a structure diagram tool.
- Invented PNG / screenshot as the source of truth.
- Vega-Lite / ECharts JSON as the default artifact (optional later `engine:`, not core).
- Invented type ids (`donut`, `sunburst`, `chord`, `stacked-bar` as its own type).

## Fence shape

```
```chart
markvis: 2
type: bar
title: Q3 Revenue
unit: USD k
x: month
y: revenue

month,revenue
Jan,120
Feb,180
Mar,150
```
```

Optional `theme:`: `folio` (default) `highcharts` `shadcn` `docs` `ant` `recharts` — grammar packs only, no chart runtimes.
Optional `palette:`: `ink` `porcelain` `warm` `cool` `vivid` — colors only. Omit → theme default colors. Unknown → `E_UNKNOWN_PALETTE` + table. Never merge palette into the theme id.
Optional `surface:`: `light` (default) `dark` `export`.
Optional `orient: horizontal` on `bar` only, for long category labels. Omit means vertical.
`markvis` other than `2` is `E_BAD_VERSION`. Omit means 2.
Do not turn `N/A`, blanks, or other text into zero. Non-numeric measure cells are `E_BAD_NUMBER`. An empty cell is `E_MISSING_VALUE` when the chart needs every value. Repeated category/series keys are `E_DUP_KEY` (scatter, hist, and waterfall steps may repeat). A sankey cycle is `E_SANKEY_CYCLE`.

Also: GFM table after the blank line; or `<!-- chart: bar x=month y=revenue title="Q3" -->` immediately followed by a GFM table.

## Eight few-shots

Copy from `examples/valid/` (keep fences identical):

1. `01-bar-basic` — bar + unit + CSV  
2. `02-line-multi` — line + `series`  
3. `03-area-basic` — area, tag `vis`  
4. `04-scatter-basic` — scatter  
5. `05-pie-raw` — pie (do not normalize; 40+35+30)  
6. `06-hist-basic` — hist  
7. `07-bar-gfm` — GFM table as data  
8. `08-bar-comment` — HTML comment + table  

## Anti-patterns

| Don’t | Do |
| --- | --- |
| Flowchart `pie` / `xychart` for tables | markvis fence |
| JSON array as the data body | CSV or GFM table |
| Sort categories “to look nice” | Keep input row order |
| Force pie slices to 100 | Leave values as-is |
| Drop the table on error | Table + one-line error code |
| Emit PNG by default | Emit the fence |
