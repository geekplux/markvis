# Changelog

## Unreleased

### Added

- Wave 2 type packs: `heatmap` `funnel` `waterfall` `radar` `gauge`. Gauge extras `min`/`max`. Funnel/radar negatives use `E_NEGATIVE_VALUE`.
- Type packs under `packages/types/<id>/` with a registry (same contribution shape as themes). Paint lives with the pack; `@markvis/render-svg` keeps SVG chrome.
- Fence encodings: `layout: grouped|stacked|percent` on `bar` / `line` / `area` (omit = grouped). `innerRadius` on `pie` in `[0, 1]` (omit = theme `PIE_INNER_RATIO`; explicit `0` = solid).
- `docs/TYPES.md` — IN/OUT, encodings vs new type ids, how to contribute a type.
- Agent docs: short encodings note in `llms.txt`; fuller catalog notes in `llms-full.txt`.

### Changed

- Undeclared fence headers and illegal encodings fail with `E_UNKNOWN_FIELD` + table (no silent ignore).
- Old six fences without encodings stay valid; omit-encoding snapshots stay byte-stable.

### Fixed

- (none user-facing in this cut)


## 2.0.2

README charts: same files as `examples/out/`, hosted at markvis.js.org so GitHub and npm both show them. The `v2` branch URLs 404 after the merge.

## 2.0.1

npm listing: README starts with `# markvis` so the website can render it; keywords and a short description are set. **2.x replaces 0.0.13.**

## 2.0.0

The 2017 project rewritten as a Markdown chart language. The fence is the data.

- Language tags `chart` / `markvis` / `vis` share one parser.
- Types: `bar` `line` `area` `scatter` `pie` `hist`.
- Fields: `markvis`, `type`, `title`, `unit`, `x`, `y`, `series`, plus `theme` and `palette`.
- Data: CSV or a GFM table (not JSON as the default).
- Path: fence → Chart IR → deterministic SVG. Invalid input keeps a table plus a stable error code.
- CLI: `check`, `render`, `preview`, `stats`, `to-table`, `gallery`, `bake`.
- Hosts: `markvis/remark`, `markvis/markdown-it`, browser IIFE, Play at markvis.js.org/play.
- Packed library name remains `markvis`. **2.0.0 replaces 0.0.13** on npm (`legacy/` keeps the 2017 renderer).

The frozen 0.0.13 d3 renderer lives under `legacy/`.

## 0.0.13

See `legacy/`. markdown-it plugin; d3 + per-chart packages.
