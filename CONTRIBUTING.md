# Contributing

Thank you for helping with markvis. The product is a tiny Markdown chart **language**. PRs that add a seventh chart type or a new core renderer are declined.

## Setup

```bash
git clone https://github.com/geekplux/markvis.git
cd markvis
pnpm install
pnpm build
pnpm test
pnpm markvis check examples/valid
pnpm markvis check examples/invalid   # must exit non-zero
pnpm --filter playground build
```

Node 20. pnpm 9. Default branch is `master`. Open PRs against `master`.

## Frozen language

- Tags: `chart` | `markvis` | `vis` — one parser.
- Types: `bar` | `line` | `area` | `scatter` | `pie` | `hist` only.
- Fields: `markvis`, `type`, `title`, `unit`, `x`, `y`, `series`, plus existing `theme` and `palette`.
- Data: CSV or a GFM table. Do not make JSON the default data form. Do not put JavaScript in a fence.
- Do not add d3, d3-node, Vega-Lite, ECharts, or jsdom as a runtime just to emit SVG (`packages/` and `apps/`).
- Keep input row order. Do not silently sort `x`. Do not auto-normalize pie to 100.
- Invalid input: table plus one stable error code. Never drop the rows.

`SPEC.md` is the grammar. `VISION.md` is why. `AGENTS.md` is the same forbid list for coding agents.

## Fixtures first

Add or change a file under `examples/valid/` or `examples/invalid/` before touching the parser or renderer. Invalid cases need a stable error code already listed in the parser. Gallery stories live in `docs/examples.md`.

## Tests

A PR without parser / renderer / CLI coverage for the change is not done. Use the same commands CI runs (see `.github/workflows/check.yml`). If you change fences, themes, or SVG output, regenerate examples (including theme snapshots when visuals change on purpose).

Site or Play UI: include desktop and 390-wide screenshots.

## Docs and language

Committed repo text (documents, code, comments) is English only. The Skill description in `skills/markvis/SKILL.md` must stay a trigger, not an ad. Do not invent fields in README, Skill, or `llms.txt`.

## Pack

`pnpm pack:lib` writes `markvis-2.0.0-rc.1.tgz`. npm `latest` is 0.0.13; do not publish this rc as `latest`.

## Issues

Use the templates. Prefer a full fence over a description. Check [Play](https://markvis.js.org/play) and [Examples](https://markvis.js.org/examples) first.

## Conduct and security

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security](./SECURITY.md)
- How v2 lands on `master` without rewriting history: [docs/release.md](./docs/release.md)

`legacy/` is the frozen 0.0.13 tree. Do not modernize it in this repository.
