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

Comment keys: `type` (required), `x`, `y`, `title`, `unit`, `series`, `theme`, `palette`, plus legal encodings (`layout`, `innerRadius`, `min`, `max`). Same meaning as fence headers.

## Fields

| Field | Required | Default | Notes |
| --- | --- | --- | --- |
| `markvis` | no | `2` | Language version. |
| `type` | yes | — | `bar` \| `line` \| `area` \| `scatter` \| `pie` \| `hist` \| `heatmap` \| `funnel` \| `waterfall` \| `radar` \| `gauge`. |
| `title` | no | derived | Conclusion title when present. |
| `theme` | no | `folio` | Grammar only: `folio` \| `highcharts` \| `shadcn` \| `docs` \| `ant` \| `recharts`. |
| `palette` | no | theme default | Colors only: `ink` \| `porcelain` \| `warm` \| `cool` \| `vivid`. Omit → theme pack colors. |
| `unit` | no | — | Display suffix for values. |
| `x` | typed | first category / numeric col | Independent axis or labels. |
| `y` | typed | first numeric col | Measure. |
| `series` | no | — | Optional column that splits series. |
| `layout` | no | `grouped` when omitted | On `bar` / `line` / `area` only: `grouped` \| `stacked` \| `percent`. |
| `innerRadius` | no | theme `PIE_INNER_RATIO` | On `pie` only. `[0, 1]`. Omit → theme hole; `0` = solid. |
| `min` | no | `0` at paint | On `gauge` only. |
| `max` | no | `max(y, 1)` at paint | On `gauge` only. Both set ⇒ min < max. |
| data | yes | — | CSV or GFM after a blank line. |

`x` / `y` / `series` must name real header columns. CORE keys stay separate from type-local encodings. Undeclared or illegal encodings → `E_UNKNOWN_FIELD` + table.

## Types

| Type | x | y | series | Rules |
| --- | --- | --- | --- | --- |
| `bar` | category | number | optional; `layout` | Keep input row order. Never sort x. |
| `line` | ordered category or number | number | optional; `layout` | Keep input row order. |
| `area` | same as line | number | optional; `layout` | Fill under line(s). |
| `scatter` | number | number | optional | One mark per row. |
| `pie` | label | number ≥ 0 | ignored | Do **not** normalize to 100. Optional `innerRadius`. |
| `hist` | number | optional weight | ignored | Renderer bins; table keeps raw rows. |
| `heatmap` | category | intensity | required | Long form. Keep order. |
| `funnel` | stage | number ≥ 0 | ignored | Keep order. |
| `waterfall` | step | signed delta | ignored | Running baseline. |
| `radar` | spoke | number ≥ 0 | optional | Scale max = max(y) or 1. |
| `gauge` | label | number | ignored | First row. Optional `min`/`max`. |

## Encodings

| Encoding | Legal on | Values | Omit |
| --- | --- | --- | --- |
| `layout` | `bar` `line` `area` | `grouped` \| `stacked` \| `percent` | `grouped` |
| `innerRadius` | `pie` | `[0, 1]` | theme `PIE_INNER_RATIO` (explicit `0` = solid) |
| `min` | `gauge` | number | 0 |
| `max` | `gauge` | number | max(y, 1) |

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
| `E_NEGATIVE_VALUE` | Funnel or radar value < 0. |
| `E_YAML_TABLE_CONFLICT` | Header fields disagree with progressive table mapping. |
| `E_EMPTY_FENCE` | Fence body empty. |
| `E_UNKNOWN_THEME` | `theme` not in the allow-list. |
| `E_UNKNOWN_PALETTE` | `palette` not in the allow-list. |

`theme` is grammar. `palette` is colors only. Never merge them. Contribute a type: repo `docs/TYPES.md`.
