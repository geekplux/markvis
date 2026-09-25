# Changelog

## Unreleased

### Added

- Horizontal bars (`orient`), surfaces (`light` / `dark` / `export`), heatmap color domain, waterfall `role`, and width-aware `renderSvg`. See `docs/release-2.2.md`. The package version is still 2.1.0 until publish.

### Changed

- Readable type, wrapped labels, explicit paper/dark/export surfaces, gauge range 0–100 when `max` is omitted, sankey thickness, funnel stage bars.

### Fixed

- Non-numeric cells, duplicate keys, `markvis` version, multi-chart `check`, bake references, ragged fallback cells, and line gaps for missing values.

## 2.1.0 — 2026-09-25

Type packs land on npm. Thirteen chart kinds, layout encodings, and richer examples — still one Markdown fence language, no chart-library runtime.

### Added

- **Type packs** under `packages/types/<id>/` with a registry (same contribution shape as themes). Packs own paint; `@markvis/render-svg` keeps SVG chrome. Docs: `docs/TYPES.md`.
- **Wave 1 encodings:** `layout: grouped|stacked|percent` on `bar` / `line` / `area` (omit = grouped). `innerRadius` on `pie` in `[0, 1]` (omit = theme `PIE_INNER_RATIO`; explicit `0` = solid).
- **Wave 2 types:** `heatmap` `funnel` `waterfall` `radar` `gauge`. Gauge extras `min` / `max`. Funnel / radar negatives → `E_NEGATIVE_VALUE`.
- **Wave 3 types:** `sankey` `treemap`. Pack-local layout only (no d3-hierarchy / d3-sankey). Sankey: `series` required as target; self-link → `E_UNKNOWN_FIELD`. Treemap: flat or two levels only. Negatives → `E_NEGATIVE_VALUE`.
- Agent docs: encodings + full catalog notes in `llms.txt` / `llms-full.txt`. Spec and site Spec list all thirteen types.
- Examples densified for Wave 2–3 (real-job fences); home proof strip is bar · line · sankey.

### Changed

- Undeclared fence headers and illegal encodings fail with `E_UNKNOWN_FIELD` + table (no silent ignore).
- Old six fences without encodings stay valid; omit-encoding snapshots stay byte-stable.
- Sankey paint uses filled value ribbons (d3-sankey *behavior*, no d3 runtime) instead of thick stroked centerlines.

### Site (markvis.js.org — not an npm API change)

- Examples detail view re-renders live for theme ‖ palette (grid thumbs stay theme-baked).
- SiteNav GitHub control shows the live star count when the API responds.


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
