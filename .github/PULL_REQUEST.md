# Type packs + Wave 1 encodings

> Draft for GeekPlux review. Fill SHAs / screenshots as Wave 0 and Wave 1 land. Do not open the PR until Verifier greens the gate below.

## Summary

Additive **markvis 2.x** work on `feat/type-packs`: chart types become **type packs** (same contribution shape as themes), then Wave 1 encodings (`layout` on bar/line/area, `innerRadius` on pie). No 3.0. No npm publish in this PR.

## Why

The agent surface stays small (`llms.txt` = CORE). The catalog grows as packs (`llms-full.txt`). Contributors add a type the way they already add a theme: a folder, a registry entry, examples, and loud failure on unknown ids. Visual richness comes from encodings and new packs later — not from bundling another chart runtime.

## Architecture

```
packages/types/<id>/
  type.ts
  README.md        # when / when not
  examples/        # ≥1 valid + ≥1 invalid
packages/types/registry.ts
```

- Parser resolves `type` through the registry.
- `render-svg` paints through the registry.
- Unknown id → `E_UNKNOWN_TYPE` + table (never a silent swap).
- Type-local extra keys only; undeclared keys → `E_UNKNOWN_FIELD`.
- Docs: `docs/TYPES.md` (contribute a type). Themes remain grammar; palette remains color.

## User-facing types / encodings in this PR

### Wave 0 (architecture only)

- Move the existing six: `bar` `line` `area` `scatter` `pie` `hist` into `packages/types/<id>/`.
- **Zero visual change.** Old six fixtures stay green.

### Wave 1 (encodings)

- `layout` on `bar` / `line` / `area`: `grouped` | `stacked` | `percent` (default preserves today’s look).
- `pie` optional `innerRadius` → donut look (still `type: pie`, not a seventh type).
- SPEC + CHANGELOG + examples; `llms.txt` gains one short paragraph (not a catalog dump).

## Explicitly out

- 3D / WebGL / canvas force layouts
- Geo maps / tiles
- Custom series as JS callbacks
- Animation-as-source (draw-in stays playground-only)
- Runtime deps on Highcharts / ECharts / G2 / Recharts / d3
- Naming those tools on public marketing pages
- npm publish (GeekPlux publishes after review)
- Wave 2 packs in this PR (`heatmap` `funnel` `waterfall` `radar` `gauge`)

## Compatibility

- Semver: **2.x additive**. Old six fences still parse.
- Theme and palette axes unchanged and independent.
- Unknown type still `E_UNKNOWN_TYPE` + table.
- Unknown theme / palette still `E_UNKNOWN_*` + table.

## Test plan

- [ ] `pnpm test` green
- [ ] Old six fixtures still valid
- [ ] Invalid fixtures still non-zero / fail as expected
- [ ] Unknown type → table + `E_UNKNOWN_TYPE`
- [ ] Each new encoding has snapshots
- [ ] Theme ‖ palette still independent
- [ ] CHANGELOG entry present (Added / Changed / Fixed; user-facing first)
- [ ] This file complete (not thin)
- [ ] `/examples` shows Wave 1 without plot wallpaper

## Screenshots

<!-- After Wave 1: /examples cards for grouped, stacked, percent, pie+innerRadius -->

- [ ] grouped bar/line/area
- [ ] stacked bar/line/area
- [ ] percent bar/line/area
- [ ] pie with `innerRadius` (donut look)

## llms.txt vs llms-full.txt

- `llms.txt` — CORE only; one short Wave 1 paragraph; never invent a type name.
- `llms-full.txt` — full catalog as packs land.
- Skill: unknown type → fetch full spec or use a core type.

## Follow-up PR (Wave 2)

Separate PR after this merges (unless GeekPlux says otherwise):

- Packs: `heatmap` `funnel` `waterfall` `radar` `gauge`
- Each: ≥2 valid + ≥1 invalid + snapshots + `/examples` card
- Wave 3 later: sankey / treemap after table shape is written down

## Branch / release discipline

- Branch: `feat/type-packs` from `origin/master`
- Tip at open: _TBD_
- One PR for Wave 0+1; do not pile drive-by SHAs onto master
- No force-push to master; rebase this branch as needed
