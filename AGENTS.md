# AGENTS.md — markvis 2.0

Read CONSTITUTION.md, VISION.md, and GOAL.md first. They win over this file.
Branch: v2. Truth on disk only. No Notion. No pstack in chat.
Coder only via grok -p on branch v2.

## English-only committed text

Committed repo text (documents, code, comments) is English only.
The user may prompt in Chinese or any other language.
English is the only source language in the repo. Do not add extra README locales or i18n.
Frozen `legacy/` (including `legacy/docs/zh-cn`) is not rewritten.
Unicode labels inside `examples/` fixtures are data, not documentation language.

## Language frozen (Grok Build — do not reopen)

Language is frozen. Do not add a chart type. Do not add d3.

Types only: `bar` | `line` | `area` | `scatter` | `pie` | `hist`.
Tags only: `chart` / `markvis` / `vis` → one parser.
Fields only: `markvis`, `type`, `title`, `unit`, `x`, `y`, `series`.
Data: CSV or GFM table. No JSON as default data. No JS in a fence.
`heatmap` / `donut` / stacked-bar-as-type / `treemap` / `sankey` / `map`: NO.

Forbidden in `packages/` and `apps/` (dependencies, imports, tests):
`d3`, `d3-node`, `markvis-bar`, `markvis-line`, `markvis-pie`,
`markdown-it-fence`, `babel-preset-es2015`, `jsdom-as-renderer`.
Do not pull jsdom, Vega-Lite, ECharts, or Observable Plot to render SVG.
legacy/ may keep old deps. `packages/*` tests must not import `legacy`.

A PR that adds a type or a forbidden dep is rejected.
Product forks (JSON core, 7th type) default NO — one DECISIONS row, no debate.

CI contract is `.github/workflows/check.yml` and must stay:

    pnpm install
    pnpm test
    pnpm markvis check examples/valid
    pnpm markvis check examples/invalid          # exit must be non-zero
    pnpm --filter playground build

vitest must keep covering `@markvis/parser`, `@markvis/render-svg`, and `@markvis/cli`.

## Stack allow / forbid (CONSTITUTION section 2)

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
- Root package `markvis` is re-export + CLI bin only

Forbidden in `packages/` and `apps/` dependencies (adding any item is a reject):
d3, d3-node, markvis-bar, markvis-line, markvis-pie, markdown-it-fence, babel-preset-es2015, jsdom-as-renderer

Do not add a 7th type. Do not make d3 the default renderer. Do not pull d3 / d3-node / jsdom at runtime just to emit a figure.

`legacy/` may keep old deps, but `packages/*` tests must not import `legacy`.

## Layout pointer (CONSTITUTION section 3)

CONSTITUTION.md
VISION.md
GOAL.md
AGENTS.md
STATUS.md
DECISIONS.tsv
SPEC.md
llms.txt
llms-full.txt
schema/markvis-2.schema.json
legacy/                  frozen 0.0.13 tree moved in whole
packages/ir/
packages/parser/
packages/render-svg/
packages/cli/
packages/remark/
packages/markdown-it/
packages/compat-legacy/  optional, default-off old YAML parse
packages/themes/
packages/browser/
apps/playground/
apps/web/
examples/valid/01.md … 50.md
examples/invalid/01.md … 15.md
examples/prompts.md      30 natural-language lines -> fences
examples/out/*.svg
docs/architecture.md
docs/integrate.md
docs/themes.md
docs/visual-spec.md
docs/site.md
docs/examples.md
docs/landing.md
docs/research-brief.md
docs/model-errors.md
docs/best-practices.md
skills/markvis/SKILL.md
.github/workflows/check.yml

## Frozen language (CONSTITUTION section 4)

Frozen. Do not add a type. Do not add a field. Do not add d3.

Language tags: `chart` / `markvis` / `vis` share one parser.

Header:
    markvis: 2
    type: bar|line|area|scatter|pie|hist
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

## Roles and loop (CONSTITUTION section 6)

Architect
- Dispatch only one W number per round.
- Read STATUS.md and the last 20 rows of DECISIONS.tsv first.
- If Coder is patching jest/xo/d3 golden files inside `legacy/`: stop them immediately and record DECISIONS.
- Do not open a pstack arena in the channel.
- Product forks (JSON as core, a 7th chart type) default NO — one DECISIONS row, no debate past 10 messages.

Coder
- Work in the repo only via `grok -p`. Report back to the channel: commit, files, commands, pass/fail.
- Minimal diffs. Tests first, then implementation. A PR without parser/renderer tests is not done.
- One package at a time. Do not refactor the CLI and change grammar in the same unit.
- Commit messages: `feat(parser): ...` / `test(render-svg): ...`
- Do not add a type. Do not add d3. Do not change frozen grammar.
- Do not force-push `master`. Do not npm publish.
- After a run, write the commands and exit codes into STATUS.
- In Grok Build, `/poteto-mode` only for non-trivial changes. Scaffold does not need a review panel.

Writer
- SPEC examples must match real files in `examples/`. No fake fences in docs.
- The Skill description must work as a trigger, not an ad.
- Do not invent fields.

Researcher
- Short, sourced, in service of VISION. Do not output “could also consider ECharts” sentences that send Coder off the path.

Shared
- Every `/loop` is a cold start: trust disk, not chat memory.
- Same W fails twice: STATUS marks BLOCKED + one question, skip to the next independent W.
- Two consecutive rounds with zero file changes: stop the loop, @GeekPlux, attach command output.
- Do not accept “close enough” or “feels usable” as done.
