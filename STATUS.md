# STATUS.md — markvis 2.0

previous U2 cancelled; legacy modernization is not 2.0.

## Snapshot

- Workdir: /workspace/markvis
- Branch: v2
- Updated: 2026-09-04 (Coder) W0 follow-up

## Waves

- [x] W0 纠偏
- [ ] W1 研究
- [ ] W2 规格
- [ ] W3 例子
- [ ] W4 IR + parser
- [ ] W5 schema
- [ ] W6 render-svg
- [ ] W7 CLI
- [ ] W8 宿主
- [ ] W9 playground
- [ ] W10 AI 面
- [ ] W11 工程硬化
- [ ] W12 加厚

## Active

W0 done. Next: W1 研究.

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
