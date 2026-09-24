# Type packs + Wave 1 encodings

> GeekPlux review. Verifier gates before open. Do not npm publish in this PR.

## Summary

Additive **markvis 2.x** on `feat/type-packs` tip **`192d54f`** (plus Writer docs after): chart types become **type packs** (mirror themes), then Wave 1 encodings (`layout` on bar/line/area, `innerRadius` on pie). No 3.0. Old six fences still parse.

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

- [x] `pnpm test` green (Coder: 576 passed / 2 skipped @ `192d54f`)
- [x] Old six omit-encoding fixtures byte-stable
- [x] Unknown type → table + `E_UNKNOWN_TYPE`
- [x] Encoding fixtures + invalid (wrong type / bad value)
- [ ] Verifier Wave 1 gate (full checklist)
- [x] CHANGELOG Unreleased entry
- [x] PR description complete
- [ ] `/examples` screenshot pass (grouped / stacked / percent / pie+innerRadius; no wallpaper)

## Screenshots

Attach after Verifier / bake if missing:

- [ ] grouped bar/line/area
- [ ] stacked bar/line/area
- [ ] percent bar/line/area
- [ ] pie with `innerRadius` (and omit vs `0` vs theme)

## llms.txt vs llms-full.txt

- `llms.txt` — CORE + one short encodings paragraph; never invent a type name.
- `llms-full.txt` — encodings table + CORE types.
- Skill: unknown type → fetch full spec or use a core type.

## Follow-up PR (Wave 2)

- Packs: `heatmap` `funnel` `waterfall` `radar` `gauge`
- Each: ≥2 valid + ≥1 invalid + snapshots + `/examples` card
- Wave 3: sankey / treemap after table shape is written down

## Branch / release discipline

- Branch: `feat/type-packs` from `origin/master`
- Code tip: `192d54f` (Wave 1); Writer docs commit follows
- One PR for Wave 0+1; no drive-by master SHAs; no force-push master
