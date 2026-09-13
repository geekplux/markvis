# CONSTITUTION.md — markvis 2.0

This is not a new chat. This is the repository constitution. Write it to disk immediately:

- CONSTITUTION.md (this full text)
- VISION.md
- GOAL.md
- AGENTS.md
- STATUS.md (first line: previous U2 cancelled; legacy modernization is not 2.0)

Read these before touching code. The old GOAL defined 2.0 as “add types to 0.0.13” — void. github.com/geekplux/markvis `v2` was still Babel 6 + d3 + markvis-bar/line/pie. That was U1 reviving old tests, not the product.

Coding is only the Coder using Grok Build on branch `v2`. The channel forbids large implementation dumps. pstack / poteto-mode only inside Grok Build. No Notion. Old `master` is read-only. Old `src/` and old tests move into `legacy/` and freeze.

After Architect writes the four files, start `/loop 30m` until the stop condition holds. Do not wait for the next human sentence.

==================================================
1. VISION
==================================================

Markdown is the programming language of the AI era. Mermaid won **structure** (flow, sequence, state). markvis must win **numbers**.

A chart’s source must also be the data. A model that reads `.md` can compute max/min. Changing one CSV row redraws the figure. People without a plugin still see the table. On failure the numbers must not disappear.

2017 markvis solved “upload one fewer image.” That was a renderer. 2.0’s product is a language:

    fence / GFM table / HTML comment
            ↓
         parser
            ↓
         Chart IR + JSON Schema
            ↓
     SVG | table fallback | stats | playground | later MCP

The default renderer is our own deterministic SVG. Do not make Vega-Lite / ECharts / d3 the core. Those can only be a later `engine:` option.

Brand: keep github.com/geekplux/markvis and the npm name `markvis`. Shipping 2.0.0 requires GeekPlux’s own approval. The story is “the 2017 project, rewritten for AI.”

Do not: Tableau, compete with Mermaid for flowcharts, one npm package per chart, a theme marketplace, accounts, short links, or treat d3 flexibility as the API.

==================================================
2. STACK (copy into AGENTS.md; a violation is a reject)
==================================================

Allow:
- pnpm workspaces + TypeScript strict
- Node 20
- IR defined with zod (or equivalent), then generate `schema/markvis-2.schema.json`
- Tests: vitest
- Docs-site Markdown hosts: a remark plugin + a markdown-it plugin (thin adapters; the core must not bind to either)
- Playground: Vite + the same parser and render-svg in the browser, zero backend
- SVG: handwritten deterministic strings or a minimal in-house layout; forbidden to pull d3 / d3-node / jsdom at runtime just to emit a figure
- CI later: GitHub Actions; the same commands must run locally first
- Packages: `@markvis/ir` `@markvis/parser` `@markvis/render-svg` `@markvis/cli` `@markvis/remark` `@markvis/markdown-it`
- Root package `markvis` is re-export + CLI bin only

Forbidden in `packages/` and `apps/` dependencies:
d3, d3-node, markvis-bar, markvis-line, markvis-pie, markdown-it-fence, babel-preset-es2015, jsdom-as-renderer

`legacy/` may keep old deps, but `packages/*` tests must not import `legacy`.

==================================================
3. LAYOUT (grow to this list; do not invent another tree)
==================================================

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

==================================================
4. FROZEN GRAMMAR
==================================================

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

==================================================
5. WORKFLOW (in order; tick STATUS when a block is done; do not change grammar in parallel)
==================================================

W0 Course-correct
Move the old tree into `legacy/`. Root becomes a monorepo. STATUS records U2 cancelled.
`grep` of `packages` and `apps` must not hit `d3-node` or `markvis-bar`.

W1 Research
`docs/research-brief.md`: Mermaid pie/xychart, Vega-Lite, 2017 markvis, Observable Plot.
The conclusion must stand with VISION: a small in-house DSL, not a Vega wrap.

W2 Spec
SPEC.md must have: grammar, field table, semantics of the six types, fallback rules, eight copy-paste examples, error-code table.
Writer writes. Architect may only tighten wording, never add a 7th type.

W3 Examples
At least 50 valid, at least 15 invalid. Each file starts with an intent paragraph.
Cover: six types, multi-series, 12+ categories, unicode, omitted title, large numbers and 0, pie that does not sum to 100, row-order preserved, three language tags, GFM table, HTML-comment form, long labels.
Invalid: unknown type, JSON data, missing header, extra column, pie negative, empty data, duplicate column names, type typo, YAML vs table conflict, header-only.

W4 IR + parser
zod IR. Tests for all 65 fixtures. Stable error codes. Zero render dependencies.

W5 schema
Generate `schema/markvis-2.schema.json` from IR. CI checks hand-edit drift.

W6 render-svg
Six types. Axes, ticks, grid, title, legend, default 8 colors (enough contrast), aria-label, figure semantics.
Same IR -> same SVG bytes. Snapshots committed under `examples/out`. One pixel change fails tests.

W7 CLI
`markvis check | render | preview | stats | to-table`
`stats` prints type n min max series.
`preview` opens a single-file left/right compare; it need not be the full product.

W8 Hosts
One remark adapter and one markdown-it adapter. Fixture: Markdown that contains a fence; HTML output contains both svg and table.
Without a plugin the source is still legal Markdown.

W9 playground
Vite. Fence on the left, SVG + fallback table on the right. Top example switcher bound to `examples/valid`.
Copy fence / Copy SVG. Invalid input shows the table + error; never a blank screen.
`pnpm --filter playground build` must pass.

W10 AI surface
`skills/markvis/SKILL.md`: when to use, when not to use a structure-diagram tool, 8 few-shots, anti-patterns.
`llms.txt` + `llms-full.txt`.
`examples/prompts.md`: 30 plain-language lines. Coder writes `scripts/eval-prompts` (may start stubbed, but must be able to run `check`).
Failures go in `docs/model-errors.md`.

W11 Engineering harden
vitest covers parser / render / cli.
`.github/workflows/check.yml`: install + test + check valid + check invalid non-zero + playground build.
AGENTS.md for future Grok Build: language is frozen, do not add a type, do not add d3.
`docs/best-practices.md` is the human contrib rules.

W12 Thicken (start only after W0–W11 are green; this is the fuel that keeps work going)
- compat-legacy: parse 2017 YAML vis fences into the new IR as far as possible; default off; tests live separately
- GitHub Action: paste rendered SVG on the PR comment
- `packages/mcp/README.md` + minimal validate/suggest/render/toTable (local stdio is enough)
- Visual regression: besides snapshots, `examples/gallery.html` generated by the CLI
- `docs/landing.md` ≤40 lines: what it is, why it is not a flowchart DSL, how to try, three svgs
- README top becomes the 2.0 entry; old usage links to `legacy/README.md`
- Perf: write a check+render ceiling for 1000-row CSV into tests (measure first, then set the threshold; no invented numbers)
- a11y: every SVG has title/desc; color is not only a colorblind-hostile red/green pair

Do not announce “done for today” until W12 is finished. Do not propose a public site until W9 is finished.

==================================================
6. BEST PRACTICES (a violation in a round means redo)
==================================================

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

==================================================
7. ACCEPTANCE (missing any item means do not stop)
==================================================

    pnpm test
    pnpm markvis check examples/valid
    pnpm markvis check examples/invalid          exit code must be non-zero
    pnpm markvis stats examples/valid/01-bar-basic.md
    pnpm --filter playground build
    rg "d3-node|markvis-bar|markvis-line|markvis-pie" packages apps && exit 1

playground dev: can switch examples, edit a fence and get a figure, copy the fence.
Every valid example has a matching svg in `examples/out`.
CONSTITUTION.md VISION.md SPEC.md SKILL.md live in the repo, not only in the channel.

==================================================
8. LOOP (arm it now)
==================================================

After W0 files land, Architect runs:

    /loop 30m read CONSTITUTION.md GOAL.md STATUS.md DECISIONS.tsv.
    If acceptance commands are all green and W12 at least has gallery + landing + README entry: stop the loop, @GeekPlux.
    Otherwise do exactly one unchecked W. Name the owner.
    Coder tasks must include a complete one-line `grok -p`.
    Write one TSV row. Do not solve problems in chat.

Heartbeat must not be shorter than 30 minutes. Not 5 minutes. Do not nest another `/loop` inside the Grok Build session watching the same work.

==================================================
9. ARCHITECT FIRST SENTENCE NOW
==================================================

1. Confirm workdir and branch `v2`
2. Confirm old code is planned to move into `legacy/` (or is moving)
3. Confirm CONSTITUTION.md is written
4. Cancel U2
5. Dispatch W0 to Coder, VISION/SPEC to Writer

Start. Do not wait for the next human message.
