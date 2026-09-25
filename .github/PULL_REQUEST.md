# Type packs + Wave 1 encodings

> GeekPlux review — [#19](https://github.com/geekplux/markvis/pull/19). Do not npm publish in this PR.

## Summary

Additive **markvis 2.x** on `feat/type-packs` tip **`d31325f`**: chart types become **type packs** (mirror themes), then Wave 1 encodings (`layout` on bar/line/area, `innerRadius` on pie). No 3.0. Old six fences still parse.

## Why

The agent surface stays small (`llms.txt` = CORE). The catalog grows as packs (`llms-full.txt`). Contributors add a type the way they already add a theme: a folder, a registry entry, examples, and loud failure on unknown ids. Visual richness comes from encodings and later packs — not from bundling another chart runtime.

## Architecture

```
packages/types/<id>/
  type.ts
  README.md
  examples/
packages/types/registry.ts
packages/types/_paint/     # shared paint kit (no types → render-svg import)
```

Deps: `@markvis/ir` ← `@markvis/types` ← `@markvis/render-svg`. Packs own paint. Unknown id → `E_UNKNOWN_TYPE` + table. Type-local extras only; undeclared → `E_UNKNOWN_FIELD`. Docs: `docs/TYPES.md`.

## User-facing types / encodings in this PR

### Wave 0

- Six packs: `bar` `line` `area` `scatter` `pie` `hist`.
- Zero visual change for fences without encodings. Verifier PASS @ `6c1e2ce`.

### Wave 1

- `layout: grouped|stacked|percent` on `bar` / `line` / `area` (omit = grouped).
- `innerRadius` on `pie` in `[0, 1]`: omit → theme `PIE_INNER_RATIO`; explicit `0` = solid; `(0, 1]` = donut hole.
- Still six type ids. No `donut` / `stacked-bar` types.

## Explicitly out

- 3D / WebGL / canvas force layouts
- Geo maps / tiles
- Custom series as JS callbacks
- Animation-as-source (draw-in stays playground-only)
- Runtime chart-library deps
- Naming competitor tools on public marketing pages
- npm publish (GeekPlux publishes after review)
- Wave 2 packs (`heatmap` `funnel` `waterfall` `radar` `gauge`)

## Compatibility

- Semver: **2.x additive**. Old six fences still parse.
- Theme ‖ palette unchanged and independent.
- Unknown type / theme / palette still `E_UNKNOWN_*` + table.

## Test plan

- [x] `pnpm test` green (Coder: 612 passed / 2 skipped @ `b131db9`)
- [x] Old six omit-encoding fixtures byte-stable
- [x] Unknown type → table + `E_UNKNOWN_TYPE`
- [x] Encoding fixtures + invalid (wrong type / bad value) — valid `53`–`58`, invalid `22`–`25`
- [x] `check examples/valid` 58 ok; `check examples/invalid` 25 errors
- [ ] Verifier re-gate after encoding bake
- [x] CHANGELOG Unreleased entry
- [x] PR description complete
- [x] `/examples` encoding cards baked (`53`–`58` in `out` + gallery)

## Screenshots / examples

Baked on tip `b131db9` (PR body tip `d31325f`) (paths under `examples/out/` and themed packs):

- [x] stacked bar — `53-bar-stacked`
- [x] percent bar — `54-bar-percent`
- [x] stacked line — `55-line-stacked`
- [x] percent area — `56-area-percent`
- [x] pie `innerRadius: 0` — `57-pie-inner-radius-0`
- [x] pie `innerRadius: 0.5` — `58-pie-donut`
- [x] grouped baseline — existing old-six / omit-`layout` fixtures
- [x] invalid extras — `examples/invalid/22`–`25` (wrong type + bad values)

## llms.txt vs llms-full.txt

- `llms.txt` — CORE + one short encodings paragraph; never invent a type name.
- `llms-full.txt` — encodings table + CORE types.
- Skill: unknown type → fetch full spec or use a core type.

## Follow-up PR (Wave 2)

- Packs: `heatmap` `funnel` `waterfall` `radar` `gauge`
- Each: ≥2 valid + ≥1 invalid + snapshots + `/examples` card
- Wave 3: sankey / treemap after table shape is written down

## Branch / release discipline

- Branch: `feat/type-packs` → `master` via [#19](https://github.com/geekplux/markvis/pull/19)
- Tip: `d31325f` (bake `b131db9` + this PR checklist)
- One PR for Wave 0+1; no drive-by master SHAs; no force-push master; no npm publish
