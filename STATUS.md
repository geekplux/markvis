# STATUS.md — markvis 2.0

previous U2 cancelled; legacy modernization is not 2.0.

## Snapshot

- Workdir: /workspace/markvis
- Branch: v2
- Updated: 2026-09-04 (Coder) W5 schema from IR

## Waves

- [x] W0 纠偏
- [x] W1 研究 (docs/research-brief.md on disk; conclusion matches VISION)
- [x] W2 规格 (SPEC.md Writer draft accepted)
- [x] W3 例子 (52 valid + 18 invalid; seeds 01-08 match SPEC)
- [x] W4 IR + parser (zod Chart IR; fence/comment/CSV/GFM parser; 70 fixtures)
- [x] W5 schema (schema/markvis-2.schema.json from ChartIRSchema; pnpm schema:check)
- [ ] W6 render-svg
- [ ] W7 CLI
- [ ] W8 宿主
- [ ] W9 playground
- [ ] W10 AI 面
- [ ] W11 工程硬化
- [ ] W12 加厚

## Active
W6 -> Coder (render-svg). Writer holds W10 docs.

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
