# Wave 3 type packs

> GeekPlux review. Do not npm publish in this PR.

## Summary

Additive **markvis 2.x** on `feat/wave3-types` tip **`7112986`**: two new type packs — `sankey` `treemap` — same registry path as Waves 0–2. Unknown type still → `E_UNKNOWN_TYPE` + table. Pack-local layout only (no d3-hierarchy / d3-sankey). Closes the START-plan catalog gap.

## Why

Waves 0–2 shipped the pack spine, encodings, and the first five additive packs. Wave 3 fills the last planned ids without pulling chart runtimes into `packages/`.

## Architecture

```
packages/types/<id>/
  type.ts
  README.md
  examples/
packages/types/registry.ts
packages/types/_paint/<id>.ts   # pack-owned marks + layout
```

Deps stay `@markvis/ir` ← `@markvis/types` ← `@markvis/render-svg`. Theme ‖ palette orthogonal — no new theme ids. CORE fence keys unchanged; Wave 1–2 fences (`layout` / `innerRadius` / `min` / `max`) untouched.

## User-facing types in this PR

| Id | extras | Table | Rules |
| --- | --- | --- | --- |
| `sankey` | `[]` | `x` source, `series` target (**required**), `y` flow ≥ 0 | One row = one link; keep order; nodes = unique `x` ∪ `series`; self-link → `E_UNKNOWN_FIELD`; neg → `E_NEGATIVE_VALUE`; cycles allowed (L→R columns) |
| `treemap` | `[]` | `x` label, `y` ≥ 0, `series` optional parent | Omit `series` → flat leaves; with `series` → two levels only; neg → `E_NEGATIVE_VALUE`; `y≤0` omitted from paint (table kept) |

MVP paint: sankey node rects + cubic links (palette by link index); treemap squarify/slice-dice in-pack; labels only when they fit. Designer only if review fails look.

## Explicitly out

- >2-level treemap, sunburst, circular sankey
- Sankey node extras / curvature fence keys
- More type ids beyond these two
- 3D / WebGL / maps / tiles
- Animation-as-source
- Runtime chart-library deps (no d3-hierarchy / d3-sankey)
- Competitor names on public marketing pages
- npm publish (GeekPlux publishes after review)

## Compatibility

- Semver: **2.x additive**. Prior eleven types + encodings still parse.
- Theme ‖ palette unchanged and independent.
- Unknown type / theme / palette still `E_UNKNOWN_*` + table.

## Test plan

- [x] Registry + extras sync; schema regenerate
- [x] ≥1 valid + ≥1 invalid under each pack
- [x] `examples/valid` + `out` + gallery bake (`64`–`65`)
- [x] Invalid: self-link, missing sankey `series`, sankey/treemap neg (`31`–`34`; plus prior `13`)
- [ ] `pnpm test` + `pnpm markvis check` valid/invalid — Verifier gate
- [x] CHANGELOG Unreleased, SPEC / TYPES / llms catalogs updated
- [x] PR description complete

## Screenshots / examples

Baked on tip `7112986` (paths under `examples/out/`):

- [x] sankey — `64-sankey-marta-flow`
- [x] treemap — `65-treemap-marta-boardings`
- [x] invalid — `examples/invalid/31`–`34` (and `13-sankey-type`)

## llms.txt vs llms-full.txt

- `llms.txt` — CORE types include `sankey` `treemap`; never invent sunburst/chord/donut/stacked-bar.
- `llms-full.txt` — catalog rows for both packs.
- Skill: unknown type → fetch full spec or use a known type.

## Follow-up

- Optional Designer pass if sankey curves / treemap label overflow fail review
- No further type waves planned from START; new ids need a fresh product bet

## Branch / release discipline

- Branch: `feat/wave3-types` → `master` (after [#20](https://github.com/geekplux/markvis/pull/20))
- Tip: `7112986` (bake + gallery + catalog)
- No drive-by master SHAs; no force-push master; no npm publish
