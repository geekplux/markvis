# AGENTS.md — markvis

Read VISION.md and SPEC.md first. They win over this file. Default branch is `master`. See CONTRIBUTING.md.

## English-only committed text

Committed repo text (documents, code, comments) is English only.
The user may prompt in Chinese or any other language.
English is the only source language in the repo. Do not add extra README locales or i18n.
Frozen `legacy/` (including `legacy/docs/zh-cn`) is not rewritten.
Unicode labels inside `examples/` fixtures are data, not documentation language.

## Language frozen

Do not invent a type id. Do not add d3.

Types only: `bar` | `line` | `area` | `scatter` | `pie` | `hist` | `heatmap` | `funnel` | `waterfall` | `radar` | `gauge` | `sankey` | `treemap`.
Tags only: `chart` / `markvis` / `vis` → one parser.
Fields only: `markvis`, `type`, `title`, `unit`, `x`, `y`, `series`.
Optional `theme:` and `palette:` follow `SPEC.md`. Type-local extras: `layout`, `innerRadius`, `min`, `max`.
Data: CSV or GFM table. No JSON as default data. No JS in a fence.
`donut` / stacked-bar-as-type / `sunburst` / `chord` / `map`: NO. (Wave 3: `sankey` `treemap` are in.)

Forbidden in `packages/` and `apps/` (dependencies, imports, tests):
`d3`, `d3-node`, `markvis-bar`, `markvis-line`, `markvis-pie`,
`markdown-it-fence`, `babel-preset-es2015`, `jsdom-as-renderer`.
Do not pull jsdom, Vega-Lite, ECharts, or Observable Plot to render SVG.
legacy/ may keep old deps. `packages/*` tests must not import `legacy`.

A PR that invents a type id or adds a forbidden dep is rejected.

CI contract is `.github/workflows/check.yml` and must stay:

    pnpm install
    pnpm build
    pnpm test
    pnpm markvis check examples/valid
    pnpm markvis check examples/invalid          # exit must be non-zero
    pnpm --filter playground build

vitest must keep covering `@markvis/parser`, `@markvis/render-svg`, and `@markvis/cli`.

## Stack allow / forbid

Allow:
- pnpm workspaces + TypeScript strict
- Node 20
- IR defined with zod (or equivalent), then generate `schema/markvis-2.schema.json`
- Tests: vitest
- Docs-site Markdown hosts: a remark plugin + a markdown-it plugin (thin adapters; the core must not bind to either)
- Playground: Vite + the same parser and render-svg in the browser, zero backend
- SVG: handwritten deterministic strings or a minimal in-house layout; forbidden to pull d3 / d3-node / jsdom at runtime just to emit a figure
- CI: GitHub Actions `.github/workflows/check.yml`; the same commands must run locally
- Packages: `@markvis/ir` `@markvis/parser` `@markvis/render-svg` `@markvis/cli` `@markvis/remark` `@markvis/markdown-it`
- Root package `markvis` is the public library + CLI bin

Forbidden in `packages/` and `apps/` dependencies (adding any item is a reject):
d3, d3-node, markvis-bar, markvis-line, markvis-pie, markdown-it-fence, babel-preset-es2015, jsdom-as-renderer

Do not invent `donut` / `sunburst` / `chord` / stacked-bar as type ids. Do not make d3 the default renderer. Do not pull d3 / d3-node / jsdom at runtime just to emit a figure.

`legacy/` may keep old deps, but `packages/*` tests must not import `legacy`.

## Frozen language

Language tags: `chart` / `markvis` / `vis` share one parser.

Header:
    markvis: 2
    type: bar|line|area|scatter|pie|hist|heatmap|funnel|waterfall|radar|gauge|sankey|treemap
    title:
    unit:
    x:
    y:
    series:

Then a blank line, then CSV or a GFM table. Do not use JSON as the default data form. Do not put JS in a fence.

Also legal:
    <!-- chart: bar x=month y=revenue title="Q3" -->
    immediately followed by a GFM table

Illegal: unknown type, JSON data block, missing header, pie negatives, empty table. Illegal input must carry a stable error code and degrade to a table plus one error line. Never drop the data.

`title` may be omitted; derive from the filename or the first column. Keep input row order; do not silently sort `x`. Pie does not auto-normalize to 100.
