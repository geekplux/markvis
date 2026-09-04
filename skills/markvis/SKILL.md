---
name: markvis
description: Use when the user wants a quantitative chart in Markdown (bar, line, area, scatter, pie, hist) from tabular data — emit a markvis fence (chart|markvis|vis), never Mermaid pie/xychart, never a PNG, never Vega-Lite JSON as the default.
---

# markvis

Quantitative charts in Markdown. Source is the data (CSV or GFM table). Tags `chart`, `markvis`, and `vis` share one parser. Types: `bar` `line` `area` `scatter` `pie` `hist` only.

## When to use

- Numbers in a doc need a chart and the rows must stay editable.
- An agent should be able to add a row, change `type`, and regenerate.
- Readers without a plugin still need the table.

## When not to use

- Flowcharts, sequence, state, ER → Mermaid.
- Invented PNG / screenshot as the source of truth.
- Vega-Lite / ECharts JSON as the default artifact (optional later `engine:`, not core).
- A 7th chart type (`donut`, `heatmap`, `stacked-bar` as its own type).

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
| Mermaid `pie` / `xychart` for tables | markvis fence |
| JSON array as the data body | CSV or GFM table |
| Sort categories “to look nice” | Keep input row order |
| Force pie slices to 100 | Leave values as-is |
| Drop the table on error | Table + one-line error code |
| Emit PNG by default | Emit the fence |
