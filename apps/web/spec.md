---
title: Spec
pageClass: folio-docs
sidebar: true
---

# Spec

Tiny versioned chart language for Markdown. Source is tabular data. Path: fence | GFM table | HTML comment → parser → Chart IR → deterministic SVG (table always kept). Tags `chart`, `markvis`, `vis` share one parser. No JSON-as-default. No JS in the fence.

Aligned with repo root `SPEC.md` on branch `v2`. Agents that need a short brief should fetch [/llms.txt](/llms.txt).

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

Comment keys: `type` (required), `x`, `y`, `title`, `unit`, `series`. Same meaning as fence headers.

## Fields

| Field | Required | Default | Notes |
| --- | --- | --- | --- |
| `markvis` | no | `2` | Language version. |
| `type` | yes | — | `bar` \| `line` \| `area` \| `scatter` \| `pie` \| `hist` only. |
| `title` | no | derived | Conclusion title when present. |
| `theme` | no | `folio` | `folio` \| `highcharts` \| `shadcn` \| `docs` \| `ant` \| `recharts`. |
| `unit` | no | — | Display suffix for values. |
| `x` | typed | first category / numeric col | Independent axis or labels. |
| `y` | typed | first numeric col | Measure. |
| `series` | no | — | Optional column that splits series. |
| data | yes | — | CSV or GFM after a blank line. |

`x` / `y` / `series` must name real header columns.

## Types

| Type | x | y | series | Rules |
| --- | --- | --- | --- | --- |
| `bar` | category | number | optional → grouped | Keep input row order. Never sort x. |
| `line` | ordered category or number | number | optional → multi-line | Keep input row order. |
| `area` | same as line | number | optional | Fill under line(s). |
| `scatter` | number | number | optional | One mark per row. |
| `pie` | label | number ≥ 0 | ignored | Do **not** normalize to 100. |
| `hist` | number | optional weight | ignored | Renderer bins; table keeps raw rows. |

## Fallback

1. Never drop recovered rows.
2. Emit a table of those rows plus **one line** with the stable error code.
3. Valid HTML: `figure` → SVG + `figcaption` + data table.
4. Same IR → same SVG bytes.

## Error codes

| Code | When |
| --- | --- |
| `E_UNKNOWN_TYPE` | `type` not in the six. |
| `E_TYPE_TYPO` | Near-miss spelling of a known type. |
| `E_JSON_DATA` | Data body is JSON. |
| `E_MISSING_HEADER` | No CSV/GFM header row. |
| `E_EMPTY_DATA` | Header only, or zero data rows. |
| `E_EXTRA_COLUMN` | Row width ≠ header width. |
| `E_DUP_COLUMN` | Duplicate header names. |
| `E_UNKNOWN_FIELD` | `x` / `y` / `series` name a missing column. |
| `E_PIE_NEGATIVE` | Pie value < 0. |
| `E_YAML_TABLE_CONFLICT` | Header fields disagree with progressive table mapping. |
| `E_EMPTY_FENCE` | Fence body empty. |
| `E_UNKNOWN_THEME` | `theme` not in the allowed set. |

## Themes

Optional `theme:` selects a named grammar pack. See [Themes](/themes). Unknown → `E_UNKNOWN_THEME` with table fallback.
