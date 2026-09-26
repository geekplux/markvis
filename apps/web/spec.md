---
title: Spec
pageClass: folio-docs
sidebar: true
---

# Spec

Tiny versioned chart language for Markdown. Source is tabular data. Path: fence | GFM table | HTML comment → parser → Chart IR → type pack paint → deterministic SVG (table always kept). Tags `chart`, `markvis`, `vis` share one parser. No JSON-as-default. No JS in the fence.

Aligned with repo root `SPEC.md`. Agents that need a short brief should fetch [/llms.txt](/llms.txt).

## Grammar

Order inside a fence:

1. Optional `markvis: 2`
2. Header fields, one `key: value` per line
3. Blank line
4. Data: CSV **or** one GFM table (header row required)

````md
```chart
markvis: 2
type: bar
title: Feb led Q3 at 180
unit: USD k
x: month
y: revenue

month,revenue
Jan,120
Feb,180
Mar,150
```
````

Also valid under `markvis` or `vis` fences.

Progressive form — comment immediately followed by a GFM table:

```md
<!-- chart: bar x=month y=revenue title="Feb led Q3 at 180" -->
| month | revenue |
| --- | --- |
| Jan | 120 |
| Feb | 180 |
| Mar | 150 |
```

Comment keys: `type` (required), `x`, `y`, `title`, `unit`, `series`, `theme`, `palette`, `surface`, plus legal encodings (`layout`, `innerRadius`, `min`, `max`, `orient`, `role`). Same meaning as fence headers.

## Fields

| Field | Required | Default | Notes |
| --- | --- | --- | --- |
| `markvis` | no | `2` | Language version. Any other value → `E_BAD_VERSION`. It is not rewritten to 2. |
| `type` | yes | — | `bar` \| `line` \| `area` \| `scatter` \| `pie` \| `hist` \| `heatmap` \| `funnel` \| `waterfall` \| `radar` \| `gauge` \| `sankey` \| `treemap`. |
| `title` | no | derived | Conclusion title when present. |
| `theme` | no | `folio` | Grammar only: `folio` \| `highcharts` \| `shadcn` \| `docs` \| `ant` \| `recharts`. |
| `palette` | no | theme default | Colors only: `ink` \| `porcelain` \| `warm` \| `cool` \| `vivid`. Omit → theme pack colors. |
| `unit` | no | — | Display suffix for values. |
| `x` | typed | first category / numeric col | Independent axis or labels. |
| `y` | typed | first numeric col | Measure. |
| `series` | no | — | Optional column that splits series. |
| `surface` | no | `light` | `light` \| `dark` \| `export`. Light, the default, paints no canvas so the host background shows through. Dark paints a dark paper and light ink. Export paints an opaque white card. |
| `layout` | no | `grouped` when omitted | On `bar` / `line` / `area` only: `grouped` \| `stacked` \| `percent`. |
| `innerRadius` | no | theme `PIE_INNER_RATIO` | On `pie` only. `[0, 1]`. Omit → theme hole; `0` = solid. |
| `min` | no | see type | Gauge omit → 0. Heatmap omit → data minimum. |
| `max` | no | gauge `100` | Gauge, heatmap, or radar. Omit on a gauge means a labeled 0–100 range, not the current value. |
| `orient` | no | `vertical` | On `bar` only: `horizontal` \| `vertical`. |
| `role` | no | every row is a delta | On `waterfall` only. Names a column of `delta` \| `total` \| `subtotal`. |
| data | yes | — | CSV or GFM after a blank line. |

`x` / `y` / `series` must name real header columns. CORE keys stay separate from type-local encodings. Undeclared or illegal encodings → `E_UNKNOWN_FIELD` + table.

## Types

| Type | x | y | series | Rules |
| --- | --- | --- | --- | --- |
| `bar` | category | number | optional; `layout` | Keep input row order. `orient: horizontal` puts categories on the side. Empty y is a gap unless stacked or percent. |
| `line` | ordered category or number | number | optional; `layout` | Keep input row order. An empty y is a gap. The line does not connect through it. |
| `area` | same as line | number | optional; `layout` | Fill under the line. Missing y stays a gap. |
| `scatter` | number | number | optional | One mark per row. Repeated observations stay. Both axes are labeled. |
| `pie` | label | number ≥ 0 | ignored | Do **not** normalize to 100. Optional `innerRadius`. An empty y is `E_MISSING_VALUE`. |
| `hist` | number | optional weight | ignored | Sturges bins; table keeps raw rows. Repeated samples stay. |
| `heatmap` | category | intensity | required | Long form. Empty y is a missing cell, not zero. Optional `min`/`max` share the color domain. |
| `funnel` | stage | number ≥ 0 | ignored | Centered bands narrow from each stage to the next. The label sits to the right. |
| `waterfall` | step | signed delta | ignored | Delta and the level after it are labeled. Optional `role` column. Totals are not inferred from the step name. |
| `radar` | spoke | number ≥ 0 | optional | One scale: `max` when it is at least the data max, otherwise the data max. A missing spoke is a gap. A grouped bar is clearer when the exact number matters. |
| `gauge` | label | number | ignored | One row. A second row → `E_DUP_KEY`. Omit max → 100, omit min → 0. |
| `sankey` | source | flow ≥ 0 | required (target) | One row = one link. Equal values share one thickness. A cycle → `E_SANKEY_CYCLE`. |
| `treemap` | label | number ≥ 0 | optional (parent) | Flat or two levels. `y≤0` omitted from paint. |

## Encodings

| Encoding | Legal on | Values | Omit |
| --- | --- | --- | --- |
| `layout` | `bar` `line` `area` | `grouped` \| `stacked` \| `percent` | `grouped` |
| `innerRadius` | `pie` | `[0, 1]` | theme `PIE_INNER_RATIO` (explicit `0` = solid) |
| `min` | `gauge` `heatmap` | number | gauge 0; heatmap data min |
| `max` | `gauge` `heatmap` `radar` | number | gauge 100; heatmap data max; radar data max |
| `orient` | `bar` | `horizontal` \| `vertical` | vertical |
| `role` | `waterfall` | column of `delta` \| `total` \| `subtotal` | every row is a delta |

Do not invent `donut` or `stacked-bar` type ids.

## Fallback

1. Never drop recovered rows.
2. Emit a table of those rows plus **one line** with the stable error code.
3. Valid HTML: `figure` → SVG + `figcaption` + data table.
4. Same IR → same SVG bytes.

## Error codes

| Code | When |
| --- | --- |
| `E_UNKNOWN_TYPE` | `type` not in the allowed set. |
| `E_TYPE_TYPO` | Near-miss spelling of a known type. |
| `E_JSON_DATA` | Data body is JSON. |
| `E_MISSING_HEADER` | No CSV/GFM header row. |
| `E_EMPTY_DATA` | Header only, or zero data rows. |
| `E_EXTRA_COLUMN` | Row width ≠ header width. |
| `E_DUP_COLUMN` | Duplicate header names. |
| `E_UNKNOWN_FIELD` | Missing column name; undeclared header; illegal encoding. |
| `E_PIE_NEGATIVE` | Pie value < 0. |
| `E_NEGATIVE_VALUE` | Funnel, radar, sankey, or treemap value < 0, or a `percent` layout that includes a negative. |
| `E_YAML_TABLE_CONFLICT` | Header fields disagree with progressive table mapping. |
| `E_EMPTY_FENCE` | Fence body empty. |
| `E_UNKNOWN_THEME` | `theme` not in the allow-list. |
| `E_UNKNOWN_PALETTE` | `palette` not in the allow-list. |
| `E_BAD_VERSION` | `markvis` is present and is not `2`. |
| `E_BAD_NUMBER` | A measure cell is not a finite number. The message names the row and column. |
| `E_MISSING_VALUE` | A required measure cell is empty. |
| `E_DUP_KEY` | The same category/series key appears twice. Scatter, hist, and waterfall steps may repeat. |
| `E_SANKEY_CYCLE` | Sankey links form a cycle. The table is kept. |

`theme` is grammar. `palette` is colors only. Never merge them. Contribute a type: repo `docs/TYPES.md`.
