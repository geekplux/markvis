# STATUS.md — markvis 2.0

previous U2 cancelled; legacy modernization is not 2.0.

## Snapshot

- Workdir: /workspace/markvis
- Branch: v2
- Updated: 2026-09-04 (Coder) W10 eval-prompts

## Waves

- [x] W0 纠偏
- [x] W1 研究 (docs/research-brief.md on disk; conclusion matches VISION)
- [x] W2 规格 (SPEC.md Writer draft accepted)
- [x] W3 例子 (52 valid + 18 invalid; seeds 01-08 match SPEC)
- [x] W4 IR + parser (zod Chart IR; fence/comment/CSV/GFM parser; 70 fixtures)
- [x] W5 schema (schema/markvis-2.schema.json from ChartIRSchema; pnpm schema:check)
- [x] W6 render-svg
- [x] W7 CLI (markvis check | render | preview | stats | to-table)
- [x] W8 宿主 (remark + markdown-it adapters; HTML has svg and table)
- [x] W9 playground (Vite; left fence / right SVG+table; Copy; examples/valid)
- [x] W10 AI 面 (SKILL / llms / prompts / model-errors; eval-prompts gold-fence check)
- [ ] W11 工程硬化
- [ ] W12 加厚

## Active
W10 closed. Next: W11 工程硬化.

## W10 proof (Writer)

- `skills/markvis/SKILL.md` — trigger description; when/not; 8 few-shots → examples/valid 01–08; anti-patterns
- `llms.txt`, `llms-full.txt`
- `examples/prompts.md` — 30 natural → fence
- `docs/model-errors.md` — seed table
- No new types / fields

## W10 proof (Coder)

`scripts/eval-prompts.ts` stubs model emit: parse 30 gold fences from `examples/prompts.md` (fence + HTML comment forms) and run `markvis check` on temp files. `pnpm eval-prompts` wires it. Failures print `record failures in docs/model-errors.md`. No LLM, no new types, no d3. Did not implement W11.

Files:

package.json
scripts/eval-prompts.ts
scripts/eval-prompts.test.ts
vitest.config.ts
STATUS.md
DECISIONS.tsv

Commands:

- `node -v` → v20.19.2 (exit 0)
- `pnpm -v` → 9.15.9 (exit 0)
- `pnpm test` → exit 0 (366 tests)
- `pnpm eval-prompts` → exit 0 (`eval-prompts stub: 30 gold fences`; `30 ok`)
- `pnpm markvis check examples/valid` → exit 0 (52 ok)
- `pnpm markvis check examples/invalid` → exit 1 (0 ok, 18 error)
- `pnpm markvis stats examples/valid/01-bar-basic.md` → exit 0 (`bar 3 120 180 -`)
- `rg "d3-node|markvis-bar|markvis-line|markvis-pie" packages apps` → exit 1 (no matches)
- `rg "from ['\"]legacy|require\\(['\"]legacy" packages` → exit 1 (no matches)

## W0 proof

Commit: cd61045b0f44e07befb2d433923fdd5171b09fb7
Message: feat(repo): W0 legacy move + monorepo scaffold
Parent: 6855aaccb75d88aaa3e4f7f4eb95d1bd66d54cd7

Moved 0.0.13 tree into `legacy/` (src, dist, __tests__, examples, docs site, package.json, pnpm-lock.yaml, .babelrc, .travis.yml, README). Constitution docs remain at repo root (CONSTITUTION.md, VISION.md, GOAL.md, AGENTS.md). Monorepo scaffold only: empty `packages/*` + `apps/playground`; root `markvis` re-export placeholder (`index.js` + `exports`/`bin` pointing at future packages; workspace:* deps; no implementations).

Files changed (vs 6855aac):

.gitignore
AGENTS.md
CONSTITUTION.md
DECISIONS.tsv
GOAL.md
README.md
SPEC.md
STATUS.md
VISION.md
apps/playground/package.json
docs/research-brief.md
examples/invalid/.gitkeep
examples/out/.gitkeep
examples/valid/.gitkeep
index.js
legacy/.babelrc
legacy/.editorconfig
legacy/.gitignore
legacy/.travis.yml
legacy/LICENSE
legacy/README.md
legacy/__tests__/index.js
legacy/dist/index.js
legacy/dist/render.js
legacy/docs/.nojekyll
legacy/docs/CNAME
legacy/docs/README.md
legacy/docs/_coverpage.md
legacy/docs/_navbar.md
legacy/docs/index.html
legacy/docs/markvis-logo.png
legacy/docs/markvis-logo.svg
legacy/docs/preview.png
legacy/docs/zh-cn/README.md
legacy/examples/basic.html
legacy/examples/basic.js
legacy/examples/content.js
legacy/package.json
legacy/pnpm-lock.yaml
legacy/src/index.js
legacy/src/render.js
package.json
packages/cli/package.json
packages/compat-legacy/package.json
packages/ir/package.json
packages/markdown-it/package.json
packages/parser/package.json
packages/remark/package.json
packages/render-svg/package.json
pnpm-lock.yaml
pnpm-workspace.yaml
schema/.gitkeep
skills/markvis/.gitkeep
tsconfig.json

Commands:

- `node -v` → v20.19.2 (exit 0)
- `pnpm -v` → 9.15.9 (exit 0)
- `pnpm install` → exit 0 (9 workspace projects; root links @markvis/{cli,ir,markdown-it,parser,remark,render-svg})
- `rg "d3-node|markvis-bar|markvis-line|markvis-pie" packages apps` → exit 1 (no matches)
- `git log -1 --format=%s` → feat(repo): W0 legacy move + monorepo scaffold (exit 0)

## W4 proof

Commits:
- 83be9bb342fc762cbae9b0dfe84b252886f94326 docs(examples): add 52 valid and 18 invalid chart fixtures
- 3e7eb2552d6030cbd50bf210795e59fb03b21705 feat(parser): add Chart IR (zod) and fence parser

`@markvis/ir`: zod Chart IR for bar|line|area|scatter|pie|hist. `@markvis/parser`: tags chart/markvis/vis; HTML comment + GFM; CSV and GFM tables; SPEC error codes; table fallback never drops rows; input row order kept; pie values as-is. Zero render deps. Did not implement render-svg, CLI, or playground.

Commands:

- `node -v` → v20.19.2 (exit 0)
- `pnpm -v` → 9.15.9 (exit 0)
- `pnpm test` → exit 0 (87 tests: 52 valid + 18 invalid fixtures + IR/unit)
- `rg "d3-node|markvis-bar|markvis-line|markvis-pie" packages apps` → exit 1 (no matches)
- `rg "from ['\"]legacy|require\\(['\"]legacy" packages` → exit 1 (no matches)

## W5 proof

Commit: 72b9fe5fadcd25ef4fb570a8d78067f395b194ac
Message: feat(schema): generate markvis-2 JSON Schema from IR zod
Parent: e1a0567a3f30705e612c87f3432e86f7662ceb13

`schema/markvis-2.schema.json` is generated from `@markvis/ir` `ChartIRSchema` via `zod-to-json-schema`. `pnpm schema:generate` writes it; `pnpm schema:check` (and `pnpm test`) fail if the committed file is hand-edited. Table schema is `.strict()` so extra keys are rejected in both zod and JSON Schema. Did not implement render-svg, CLI, or playground.

Files:

package.json
packages/ir/package.json
packages/ir/scripts/generate-schema.ts
packages/ir/src/index.test.ts
packages/ir/src/index.ts
packages/ir/src/json-schema.test.ts
packages/ir/src/json-schema.ts
pnpm-lock.yaml
schema/.gitkeep (deleted)
schema/markvis-2.schema.json

Commands:

- `node -v` → v20.19.2 (exit 0)
- `pnpm -v` → 9.15.9 (exit 0)
- `pnpm schema:generate` → exit 0 (wrote schema/markvis-2.schema.json)
- `pnpm test` → exit 0 (91 tests)
- `pnpm schema:check` → exit 0 (3 tests)
- hand-edit `schema/markvis-2.schema.json` then `pnpm schema:check` → exit 1
- `rg "d3-node|markvis-bar|markvis-line|markvis-pie" packages apps` → exit 1 (no matches)
- `rg "from ['\"]legacy|require\\(['\"]legacy" packages` → exit 1 (no matches)

## W6 proof

Commit: 2807f3dcec5745257f6c67af7fec6f4532205a6d
Message: feat(render-svg): add deterministic SVG renderer for six chart types
Parent: 66c2b94986421e19c60f11bc77221747e3d2f841

`@markvis/render-svg`: `renderSvg(chart: ChartIR): string`. Six types (bar/line/area/scatter/pie/hist). Cartesian axes, ticks, grid, title, legend when series/multi, Okabe–Ito 8-color palette, aria-label + title/desc. Pie slices from raw values (not normalized to 100). Hist bins with documented Sturges equal-width algorithm; optional y is weight. Ids = sha256 of canonical IR (`node:crypto`). Same IR → identical SVG bytes. Snapshots: 52 files in `examples/out/*.svg`. No d3/jsdom/legacy. Did not implement CLI, playground, or hosts.

Commands:

- `node -v` → v20.19.2 (exit 0)
- `pnpm -v` → 9.15.9 (exit 0)
- `pnpm test` → exit 0 (158 tests)
- `ls examples/out/*.svg | wc -l` → 52
- same IR twice (`01-bar-basic`) → identical bytes (exit 0)
- `rg "d3-node|markvis-bar|markvis-line|markvis-pie" packages apps` → exit 1 (no matches)
- `rg "from ['\"]legacy|require\\(['\"]legacy" packages` → exit 1 (no matches)

## W7 proof

Commit: 319094cd32ae5f93cbfab1ff6391a725d9e69d81
Message: feat(cli): add check, render, preview, stats, and to-table
Parent: a8b1d57ff356c2508aa3330e5ce14a4cc9c6b5c9

`@markvis/cli` + root `markvis` bin: `check`, `render`, `preview`, `stats`, `to-table`. `check` collects `.md` files and runs `parseMarkdown`; valid exits 0, invalid non-zero. `stats` prints type n min max series. `render` writes deterministic SVG. `preview` writes a local left-source / right-SVG-or-table HTML file. `to-table` prints GFM and, on error, recovered rows plus one error line. Vitest covers the CLI. No playground. No d3/legacy.

Files:

package.json
packages/cli/bin.js
packages/cli/package.json
packages/cli/src/cli.ts
packages/cli/src/files.ts
packages/cli/src/format.ts
packages/cli/src/index.ts
packages/cli/src/preview.ts
packages/cli/src/stats.ts
packages/cli/test/cli.test.ts
packages/cli/tsconfig.json
pnpm-lock.yaml
vitest.config.ts
STATUS.md
DECISIONS.tsv

Commands:

- `node -v` → v20.19.2 (exit 0)
- `pnpm -v` → 9.15.9 (exit 0)
- `pnpm test` → exit 0 (184 tests)
- `pnpm markvis check examples/valid` → exit 0 (52 ok)
- `pnpm markvis check examples/invalid` → exit 1 (0 ok, 18 error)
- `pnpm markvis stats examples/valid/01-bar-basic.md` → exit 0 (`bar 3 120 180 -`)
- `rg "d3-node|markvis-bar|markvis-line|markvis-pie" packages apps` → exit 1 (no matches)
- `rg "from ['\"]legacy|require\\(['\"]legacy" packages` → exit 1 (no matches)

## W8 proof

Commit: 5ff0f46d847ba60490ff7fa3aaedb5c46d8d2016
Message: feat(hosts): add remark and markdown-it adapters
Parent: fa3c31afa9f90e9cf854f5cecbd0d79cabe459e8

`@markvis/remark` and `@markvis/markdown-it`: thin adapters over `@markvis/parser` + `@markvis/render-svg`. Valid charts emit `figure` with SVG, `figcaption` (title), and data table. Invalid charts emit recovered table plus one error line with the stable code; rows are not dropped. Tags `chart` / `markvis` / `vis` and the HTML comment + GFM form are handled. Without the plugin, fences stay code blocks. Vitest covers both hosts against 52 valid + 18 invalid fixtures. No playground. No d3/legacy.

Files:

package.json
packages/markdown-it/package.json
packages/markdown-it/src/html.ts
packages/markdown-it/src/index.ts
packages/markdown-it/src/plugin.ts
packages/markdown-it/test/markdown-it.test.ts
packages/markdown-it/tsconfig.json
packages/remark/package.json
packages/remark/src/html.ts
packages/remark/src/index.ts
packages/remark/src/plugin.ts
packages/remark/test/remark.test.ts
packages/remark/tsconfig.json
pnpm-lock.yaml
vitest.config.ts
STATUS.md
DECISIONS.tsv

Commands:

- `node -v` → v20.19.2 (exit 0)
- `pnpm -v` → 9.15.9 (exit 0)
- `pnpm test` → exit 0 (341 tests)
- `pnpm markvis check examples/valid` → exit 0 (52 ok)
- `pnpm markvis check examples/invalid` → exit 1 (0 ok, 18 error)
- `pnpm markvis stats examples/valid/01-bar-basic.md` → exit 0 (`bar 3 120 180 -`)
- `rg "d3-node|markvis-bar|markvis-line|markvis-pie" packages apps` → exit 1 (no matches)
- `rg "from ['\"]legacy|require\\(['\"]legacy" packages` → exit 1 (no matches)

## W9 proof

Commit: 66c27b270815d603dafafd7ee83e8ab22818c17d
Message: feat(playground): add Vite split-view try page
Parent: 2d0d8d219316732873b855babcee95a5f7658b4e

Vite playground in `apps/playground`. Left textarea is the fence; right pane is SVG plus the data table. Top `<select>` binds `examples/valid` (52 files, globbed at build). Copy fence / Copy SVG. Invalid input paints recovered table plus one error line; empty input is `E_EMPTY_FENCE`, never a blank page. Same `@markvis/parser` and `@markvis/render-svg` in the browser; `node:crypto` is a SHA-256 shim so chart ids match Node. Zero backend. Did not implement W10 AI surface.

Files:

apps/playground/index.html
apps/playground/package.json
apps/playground/tsconfig.json
apps/playground/vite.config.ts
apps/playground/src/crypto-shim.ts
apps/playground/src/examples.ts
apps/playground/src/main.ts
apps/playground/src/preview.ts
apps/playground/src/style.css
apps/playground/src/vite-env.d.ts
apps/playground/test/crypto-shim.test.ts
apps/playground/test/examples.test.ts
apps/playground/test/preview.test.ts
pnpm-lock.yaml
vitest.config.ts
STATUS.md
DECISIONS.tsv

Commands:

- `node -v` → v20.19.2 (exit 0)
- `pnpm -v` → 9.15.9 (exit 0)
- `pnpm test` → exit 0 (360 tests)
- `pnpm markvis check examples/valid` → exit 0 (52 ok)
- `pnpm markvis check examples/invalid` → exit 1 (0 ok, 18 error)
- `pnpm markvis stats examples/valid/01-bar-basic.md` → exit 0 (`bar 3 120 180 -`)
- `pnpm --filter playground build` → exit 0
- `rg "d3-node|markvis-bar|markvis-line|markvis-pie" packages apps` → exit 1 (no matches)
- `rg "from ['\"]legacy|require\\(['\"]legacy" packages` → exit 1 (no matches)
