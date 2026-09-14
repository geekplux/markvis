# Changelog

## 2.0.0-rc.1

The 2017 project rewritten as a Markdown chart language. The fence is the data.

- Language tags `chart` / `markvis` / `vis` share one parser.
- Types: `bar` `line` `area` `scatter` `pie` `hist`.
- Fields: `markvis`, `type`, `title`, `unit`, `x`, `y`, `series`, plus `theme` and `palette`.
- Data: CSV or a GFM table (not JSON as the default).
- Path: fence → Chart IR → deterministic SVG. Invalid input keeps a table plus a stable error code.
- CLI: `check`, `render`, `preview`, `stats`, `to-table`, `gallery`, `bake`.
- Hosts: `markvis/remark`, `markvis/markdown-it`, browser IIFE, Play at markvis.js.org/play.
- Packed library name remains `markvis`. This RC is **not** npm `latest` (`latest` is still `0.0.13`).

The frozen 0.0.13 d3 renderer lives under `legacy/`.

## 0.0.13

See `legacy/`. markdown-it plugin; d3 + per-chart packages.
