# markvis 2.0 Spec

Tiny versioned chart language for Markdown. Source is tabular data. Path: fence | GFM table | HTML comment → parser → Chart IR → deterministic SVG (table always kept). Tags `chart`, `markvis`, `vis` share one parser. No JSON-as-default. No JS in the fence. No d3 to parse.

    fence | GFM table | HTML comment
            ↓
       @markvis/parser
            ↓
     Chart IR (@markvis/ir)
            ↓
     @markvis/types (paint) → @markvis/render-svg chrome → SVG
            ↘
          table fallback

Diagrams: `docs/architecture.md` (architecture, parse/render workflow, package structure).

This SPEC is the seed for `examples/`. The eight fences below must land verbatim as valid fixtures; do not invent a second copy in docs.

## Grammar

Order inside a fence:

1. Optional `markvis: 2`
2. Header fields, one `key: value` per line
3. Blank line
4. Data: CSV **or** one GFM table (header row required)

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

Also valid under ` ```markvis ` or ` ```vis `.

Progressive form (comment immediately followed by a GFM table):

```
<!-- chart: bar x=month y=revenue title="Q3 Revenue" -->
| month | revenue |
| --- | --- |
| Jan | 120 |
| Feb | 180 |
| Mar | 150 |
```

Comment keys: `type` (required), `x`, `y`, `title`, `unit`, `series`, `theme`, `palette`, plus type-local encodings `layout` / `innerRadius` when legal. Same meaning as fence headers.

## Field table

| Field | Required | Default | Notes |
| --- | --- | --- | --- |
| `markvis` | no | `2` | Language version. |
| `type` | yes | — | `bar` \| `line` \| `area` \| `scatter` \| `pie` \| `hist` only. |
| `title` | no | derived | From filename or first column / `y` if omitted. |
| `theme` | no | `folio` | Grammar only: `folio` \| `highcharts` \| `shadcn` \| `docs` \| `ant` \| `recharts`. |
| `palette` | no | theme default | Colors only: `ink` \| `porcelain` \| `warm` \| `cool` \| `vivid`. Omit → theme pack colors. |
| `unit` | no | — | Display suffix for values. |
| `x` | typed | first category / numeric col | Independent axis or labels. |
| `y` | typed | first numeric col | Measure. |
| `series` | no | — | Optional column that splits series. |
| `layout` | no | `grouped` when omitted | Type-local. Only on `bar` \| `line` \| `area`: `grouped` \| `stacked` \| `percent`. Omit = today's paint (`grouped`). Wrong type or bad value → `E_UNKNOWN_FIELD` + table. |
| `innerRadius` | no | theme `PIE_INNER_RATIO` | Type-local. Only on `pie`. Number in `[0, 1]`. Omit → theme default hole (folio/most = `0`; shadcn = `0.5`). Explicit `0` forces a solid pie. `(0, 1]` = donut hole as a fraction of outer radius. Wrong type or out of range → `E_UNKNOWN_FIELD` + table. |
| data | yes | — | CSV or GFM after a blank line. |

`x` / `y` / `series` must name real header columns. Unnamed extra columns stay in the fallback table, not in the mark geometry.

CORE fence keys: `markvis` `type` `title` `theme` `palette` `unit` `x` `y` `series`. Encodings are **type-local extras**, not CORE. Any header ∉ CORE ∪ that pack's extras → `E_UNKNOWN_FIELD` + table.

## Type semantics

| Type | x | y | series | Rules |
| --- | --- | --- | --- | --- |
| `bar` | category | number | optional; `layout` controls grouping | Keep input row order. Never sort x. `layout`: `grouped` (default) \| `stacked` \| `percent`. |
| `line` | ordered category or number | number | optional; `layout` as bar | Keep input row order. |
| `area` | same as line | number | optional; `layout` as bar | Fill under line(s). Same order rule. |
| `scatter` | number | number | optional | One mark per row. |
| `pie` | label | number ≥ 0 | ignored | Slice sizes as given. Do **not** normalize to 100. Optional `innerRadius` (see field table). Still `type: pie` — never invent `donut`. |
| `hist` | number | optional weight | ignored | Continuous x; renderer bins; table keeps raw rows. |

Zeros are legal. Negatives are legal on bar/line/area/scatter; illegal on `pie`.


## Encodings (Wave 1)

Optional fields that change paint on an existing type. Same `type` id — not a seventh type.

| Encoding | Legal on | Values | Omit means |
| --- | --- | --- | --- |
| `layout` | `bar` `line` `area` | `grouped` \| `stacked` \| `percent` | Today's look (`grouped`) |
| `innerRadius` | `pie` | number in `[0, 1]` | Theme `PIE_INNER_RATIO` (not always solid) |

- Explicit `innerRadius: 0` forces a solid pie and overrides the theme.
- Bad value (`layout: foo`, `innerRadius: 2`) or encoding on the wrong type → parse fail + table with `E_UNKNOWN_FIELD` (clear detail string; no new error code in Wave 1).
- Theme ‖ palette stay orthogonal. Do not invent `stacked-bar` / `donut` type ids.

## Fallback rules

1. On any error below: never drop recovered rows.
2. Emit a table of those rows (or raw body if unparsed) plus **one line** that includes the stable error code.
3. Valid HTML: `figure` → SVG + `figcaption` (title) + data table.
4. Same IR → same SVG bytes. No `Date.now`. Ids = stable hash of IR only.

## Error codes

| Code | When |
| --- | --- |
| `E_UNKNOWN_TYPE` | `type` not in the six. |
| `E_TYPE_TYPO` | Near-miss spelling of a known type (still invalid). |
| `E_JSON_DATA` | Data body is a JSON array/object. |
| `E_MISSING_HEADER` | No CSV/GFM header row. |
| `E_EMPTY_DATA` | Header only, or zero data rows. |
| `E_EXTRA_COLUMN` | Row width ≠ header width. |
| `E_DUP_COLUMN` | Duplicate header names. |
| `E_UNKNOWN_FIELD` | `x` / `y` / `series` name a missing column; undeclared header key; encoding on the wrong type; or bad encoding value. |
| `E_PIE_NEGATIVE` | Pie value < 0. |
| `E_YAML_TABLE_CONFLICT` | Header fields disagree with progressive table mapping. |
| `E_EMPTY_FENCE` | Fence body empty. |
| `E_UNKNOWN_THEME` | `theme` not in `folio` \| `highcharts` \| `shadcn` \| `docs` \| `ant` \| `recharts`. |
| `E_UNKNOWN_PALETTE` | `palette` not in `ink` \| `porcelain` \| `warm` \| `cool` \| `vivid`. |

Unknown failures still degrade to table + one line; prefer a listed code when it fits.

`theme` is grammar (mark form, axes, legend, typeface, chrome). `palette` is colors only. Never merge palette into the theme id. Play and Examples detail expose two controls (Theme + Color).

## Themes

Optional fence header `theme:` selects a named look. Allowed values: `folio` (default), `highcharts`, `shadcn`, `docs`, `ant`, `recharts`. Omit the field to get `folio`. An unknown value is a stable parse error (`E_UNKNOWN_THEME`) with table fallback — never a silent default swap. Themes are IR metadata only in this unit; they do not add chart types or pull Highcharts/d3/Unovis.

## Eight copy-paste examples

These are the canonical seeds for `examples/valid/01`–`08`.

### 1. Bar (CSV) → `01-bar-basic`

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

### 2. Line multi-series → `02-line-multi`

```chart
type: line
title: Users
x: month
y: count
series: plan

month,plan,count
Jan,free,40
Jan,pro,12
Feb,free,55
Feb,pro,18
```

### 3. Area → `03-area-basic`

```vis
type: area
title: Pipeline
x: week
y: deals

week,deals
1,8
2,11
3,9
```

### 4. Scatter → `04-scatter-basic`

```chart
type: scatter
title: Height vs weight
x: height_cm
y: weight_kg

height_cm,weight_kg
160,55
175,70
182,78
```

### 5. Pie (not normalized) → `05-pie-raw`

```markvis
type: pie
title: Share
x: name
y: value

name,value
A,40
B,35
C,30
```

### 6. Histogram → `06-hist-basic`

```chart
type: hist
title: Latency ms
x: ms

ms
12
15
14
40
42
18
```

### 7. GFM table data → `07-bar-gfm`

```chart
type: bar
title: Headcount
x: team
y: n

| team | n |
| --- | --- |
| Eng | 24 |
| Design | 6 |
| Ops | 9 |
```

### 8. Progressive comment + table → `08-bar-comment`

```markdown
<!-- chart: bar x=month y=revenue title="Q3 Revenue" -->
| month | revenue |
| --- | --- |
| Jan | 120 |
| Feb | 180 |
| Mar | 150 |
```

## Common model errors

| Mistake | Fix |
| --- | --- |
| Mermaid `pie` / `xychart` for tabular numbers | Use markvis. Mermaid is structure. |
| JSON as the data body | CSV or GFM table. |
| Invented type (`donut`, `stacked-bar`, `heatmap`) | Only the six. Use `innerRadius` / `layout` or wait for a typed pack. |
| Assuming omit `innerRadius` is always solid | Omit → theme `PIE_INNER_RATIO`; use `0` to force solid. |
| Sorting categories for looks | Keep input order. |
| Renormalizing pie to 100 | Leave values as-is. |
| Dropping the table on failure | Table + one-line error, always. |
| Default PNG or Vega-Lite JSON | Emit a markvis fence. |
| Pulling d3 to parse | Parser is text-only. |
