# Chart types

A **type** is a chart kind (`bar`, `line`, …). A **type pack** is how that kind ships in the repo — same contribution shape as a theme pack.

Theme = grammar (mark form, axes, legend, typeface, chrome). Palette = color. Type = which mark language the fence asks for. The three stay independent.

Agents should fetch `https://markvis.js.org/llms.txt` for CORE. The full catalog lives in `llms-full.txt`. Never invent a type name.

## Core types (forever)

These stay valid forever. Additive only.

| Id | Role |
| --- | --- |
| `bar` | Category x, number y. Keep row order. |
| `line` | Ordered x, number y. Optional `series`. |
| `area` | Same as line, filled. |
| `scatter` | Number x, number y. One mark per row. |
| `pie` | Label x, number y ≥ 0. Do not force slices to 100. |
| `hist` | Number x. Table keeps the raw rows. |
| `heatmap` | x cat × series cat, y intensity. Long form; `series` required. |
| `funnel` | x stage, y ≥ 0. Keep order; `series` ignored. |
| `waterfall` | x step, y signed delta. Running baseline; `series` ignored. |
| `radar` | x spoke, y ≥ 0. Optional `series`; scale max = max(y) or 1. |
| `gauge` | First row. Optional `min`/`max`; `series` ignored. |
| `sankey` | x source, series target (required), y flow ≥ 0. One row = one link. |
| `treemap` | x label, y ≥ 0, optional series parent (two levels max). |

Unknown `type` → `E_UNKNOWN_TYPE` + table. Near-miss spelling → `E_TYPE_TYPO` (still invalid). Failure always keeps the rows.

## Encodings vs new type ids

**Encoding** = optional field on an existing type. Same id, richer drawing.

**New type id** = a new pack under `packages/types/<id>/` with its own table shape and README.

| Want | Do this | Do not |
| --- | --- | --- |
| Side-by-side / stacked / 100% series on bar, line, or area | Fence field `layout: grouped \| stacked \| percent` | Invent `stacked-bar` / `grouped-line` |
| Donut look | `type: pie` + `innerRadius` in `(0, 1]` (omit = theme `PIE_INNER_RATIO`; `0` = solid) | Invent `donut` |
| Heatmap, funnel, waterfall, radar, gauge | Wave 2 type packs (`heatmap` `funnel` `waterfall` `radar` `gauge`) | Stuff them into pie/bar with magic fields |
| Sankey / treemap | Wave 3 type packs (`sankey` `treemap`) | Invent node extras, curvature keys, or >2-level trees |

Type-local extra keys only. Undeclared keys → `E_UNKNOWN_FIELD`.

## IN

2D, tabular, deterministic SVG:

- Layout encodings on bar / line / area: `grouped` | `stacked` | `percent`
- Pie `innerRadius` in `[0, 1]` (still `pie`; omit = theme default hole)
- Wave 2 packs: heatmap, funnel, waterfall, radar, gauge
- Gauge extras: `min` / `max` (omit min → 0, omit max → max(y, 1); both set ⇒ min < max)
- Wave 3 packs: sankey, treemap (pack-local layout; no d3-hierarchy/sankey)

## OUT

- >2-level treemap, sunburst, circular sankey
- Sankey node extras / curvature fence keys
- 3D, WebGL, canvas force layouts
- Geo maps / tiles
- Custom series as JavaScript callbacks
- Animation-as-source (draw-in stays playground-only)
- Chart runtimes as library dependencies (no d3-hierarchy / d3-sankey)

## Pack layout

```
packages/types/<id>/
  type.ts           # pack contract + render hooks the registry expects
  README.md         # when to use / when not
  examples/         # ≥1 valid fence + ≥1 invalid fence
packages/types/registry.ts
```

Mirror themes: register in `registry.ts`; missing packs fail loudly; parser rejects unknown fence ids with a stable error + table fallback — never a silent swap.

## Contributing a type

1. Add `packages/types/<id>/` with `type.ts`, README (when / when not), and examples (valid + invalid).
2. Register the id in `packages/types/registry.ts`.
3. Wire the id into the shared type list the parser accepts.
4. Add SPEC / `llms-full.txt` entries; keep `llms.txt` CORE-sized.
5. Snapshots + `/examples` card when the type is user-facing.
6. Do not pull a chart runtime into `packages/` or `apps/`.

## Docs map

| Doc | Job |
| --- | --- |
| `llms.txt` | CORE for agents — small |
| `llms-full.txt` | Full catalog |
| `SPEC.md` | Normative fence language |
| `docs/TYPES.md` | This file — IN/OUT + how to contribute |
| `docs/themes.md` / contributing themes | Grammar packs |
