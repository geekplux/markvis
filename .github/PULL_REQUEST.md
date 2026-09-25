# Wave 2 type packs

> GeekPlux review. Do not npm publish in this PR.

## Summary

Additive **markvis 2.x** on `feat/wave2-types` tip **`d5204b9`**: five new type packs — `heatmap` `funnel` `waterfall` `radar` `gauge` — same registry path as the six. Unknown type still → `E_UNKNOWN_TYPE` + table. No chart-library runtimes.

## Why

Wave 0+1 shipped the pack spine and encodings. Wave 2 grows the catalog along that spine: one folder per kind, registry entry, examples, loud failure on unknown ids. Agents keep a small CORE surface; the full catalog stays in `llms-full.txt` / SPEC.

## Architecture

```
packages/types/<id>/
  type.ts
  README.md
  examples/
packages/types/registry.ts
packages/types/_paint/<id>.ts   # pack-owned marks
```

Deps stay `@markvis/ir` ← `@markvis/types` ← `@markvis/render-svg`. Chrome stays in render-svg. Theme ‖ palette orthogonal — no new theme ids. CORE fence keys unchanged; Wave 1 `layout` / `innerRadius` fences unchanged. Leave `E_PIE_NEGATIVE` alone.

## User-facing types in this PR

| Id | extras | Table | Rules |
| --- | --- | --- | --- |
| `heatmap` | `[]` | `x` cat, `series` cat (required), `y` number (intensity) | Long form only; keep row order; both cats discrete |
| `funnel` | `[]` | `x` stage, `y` number ≥ 0 | Keep order; `series` ignored; neg → `E_NEGATIVE_VALUE` |
| `waterfall` | `[]` | `x` step, `y` signed delta | Keep order; paint running baseline; `series` ignored |
| `radar` | `[]` | `x` spoke, `y` number ≥ 0, `series` optional | Keep order; scale max = max(y) (or 1 if all 0); neg → `E_NEGATIVE_VALUE` |
| `gauge` | `["min","max"]` | `x` label, `y` number; first data row | omit `min`→0, omit `max`→max(y,1); both set ⇒ `min < max` or `E_UNKNOWN_FIELD`; `series` ignored |

MVP geometry. Visual polish (heatmap scale, gauge arc) only if review fails the look.

## Explicitly out

- sankey / treemap (Wave 3)
- heatmap color-domain extras
- waterfall total-row markers
- 3D / WebGL / maps / tiles
- Animation-as-source
- Runtime chart-library deps
- Competitor names on public marketing pages
- npm publish (GeekPlux publishes after review)

## Compatibility

- Semver: **2.x additive**. Old six + Wave 1 encodings still parse.
- Theme ‖ palette unchanged and independent.
- Unknown type / theme / palette still `E_UNKNOWN_*` + table.

## Test plan

- [x] Registry + extras sync; schema regenerate
- [x] ≥1 valid + ≥1 invalid under each pack
- [x] `examples/valid` + `out` + gallery bake (`59`–`63`)
- [x] Invalid: missing heatmap `series`, funnel/radar neg, bad gauge `min`/`max`, `min` on bar
- [ ] `pnpm test` + `pnpm markvis check` valid/invalid — Verifier gate
- [x] CHANGELOG Unreleased, SPEC / TYPES / llms catalogs updated
- [x] PR description complete

## Screenshots / examples

Baked on tip `d5204b9` (paths under `examples/out/`):

- [x] heatmap — `59-heatmap-atl`
- [x] funnel — `60-funnel-signup`
- [x] waterfall — `61-waterfall-pnl`
- [x] radar — `62-radar-skills`
- [x] gauge — `63-gauge-uptime`
- [x] invalid — `examples/invalid/26`–`30`

## llms.txt vs llms-full.txt

- `llms.txt` — CORE types include Wave 2 ids + short gauge `min`/`max` note; never invent sankey/treemap/donut/stacked-bar.
- `llms-full.txt` — catalog table + extras rows for `min`/`max`.
- Skill: unknown type → fetch full spec or use a known type.

## Follow-up (Wave 3)

- Packs: `sankey` / `treemap` after table shapes are locked
- Optional: heatmap color-domain extras, waterfall total markers, Designer pass on gauge/heatmap if MVP look fails

## Branch / release discipline

- Branch: `feat/wave2-types` → `master` (separate PR from [#19](https://github.com/geekplux/markvis/pull/19))
- Tip: `d5204b9` (bake + gallery + schema)
- No drive-by master SHAs; no force-push master; no npm publish
