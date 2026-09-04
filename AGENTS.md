# AGENTS.md — markvis 2.0

Read CONSTITUTION.md, VISION.md, and GOAL.md first. They win over this file.
Branch: v2. Truth on disk only. No Notion. No pstack in chat.
Coder only via grok -p on branch v2.

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

允许：
- pnpm workspaces + TypeScript strict
- Node 20
- IR 用 zod（或同等）定义，再生成 schema/markvis-2.schema.json
- 测试：vitest
- 文档站级 Markdown 宿主：remark 插件 + markdown-it 插件（薄适配，核心不准绑其中一个）
- 试用页：Vite + 浏览器里跑同一份 parser 和 render-svg，零后端
- SVG：手写确定性字符串或最小自研 layout，禁止运行时拉 d3/d3-node/jsdom 才能出图
- CI：GitHub Actions `.github/workflows/check.yml`；本地必须能跑同样命令
- 包管理：@markvis/ir @markvis/parser @markvis/render-svg @markvis/cli @markvis/remark @markvis/markdown-it
- 根包 markvis 只做 re-export 和 CLI bin

禁止出现在 packages/ 和 apps/ 的 dependencies（加任何一项即拒）：
d3, d3-node, markvis-bar, markvis-line, markvis-pie, markdown-it-fence, babel-preset-es2015, jsdom-as-renderer

禁止加第 7 种 type。禁止把 d3 当默认渲染器。禁止运行时拉 d3/d3-node/jsdom 才能出图。

legacy/ 可以保留旧依赖，但 packages/* 的测试不准 import legacy。

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
legacy/                  旧 0.0.13 代码整棵挪进来
packages/ir/
packages/parser/
packages/render-svg/
packages/cli/
packages/remark/
packages/markdown-it/
packages/compat-legacy/  可选，默认关闭的旧 YAML 解析
apps/playground/
examples/valid/01.md … 50.md
examples/invalid/01.md … 15.md
examples/prompts.md      30 条自然语言 -> 围栏
examples/out/*.svg
docs/landing.md
docs/research-brief.md
docs/model-errors.md
docs/best-practices.md
skills/markvis/SKILL.md
.github/workflows/check.yml

## Frozen language (CONSTITUTION section 4)

已冻结。禁止加 type。禁止加字段。禁止加 d3。

语言标签：chart / markvis / vis 同一个 parser。

头：
    markvis: 2
    type: bar|line|area|scatter|pie|hist
    title:
    unit:
    x:
    y:
    series:

空一行后：CSV 或 GFM 表。不要 JSON 当默认数据。不要围栏里写 JS。

也合法：
    <!-- chart: bar x=month y=revenue title="Q3" -->
    紧跟一张 GFM 表

非法：未知 type、JSON 数据块、缺表头、pie 负数、空表。非法必须带稳定 error code，并降级成表 + 一行错，不准丢数据。

title 可省略，从文件名或第一列推导。输入行序保持，禁止偷偷 sort x。pie 不自动归一化到 100。

## Roles and loop (CONSTITUTION section 6)

Architect
- 每轮只派一个 W 编号。
- 先读 STATUS.md 和 DECISIONS.tsv 最后 20 行。
- 发现 Coder 在修 legacy/ 里的 jest/xo/d3 黄金文件：立刻叫停并记 DECISIONS。
- 不要在频道开 pstack arena。
- 产品分叉（要不要 JSON 核心、要不要第 7 种图）默认 NO，记一笔，不要讨论超过 10 条消息。

Coder
- 只通过 grok -p 在仓库干活。回频道只报：commit、文件、命令、通过/失败。
- 最小改动。先测试后实现。parser/renderer 没有测试的 PR 不算完成。
- 一次一个包。不要同时重构 CLI 和改语法。
- commit 信息：feat(parser): ... / test(render-svg): ...
- 禁止加 type。禁止加 d3。禁止改冻结语法。
- 禁止 force-push master。禁止 npm publish。
- 跑完必须把命令和退出码写进 STATUS。
- Grok Build 里非平凡改动才 /poteto-mode。脚手架不必开评审团。

Writer
- SPEC 例子必须和 examples/ 里真实文件一致，禁止文档里的假围栏。
- Skill 的 description 要能当触发器，不要写成广告。
- 不发明字段。

Researcher
- 短、有出处、服务 VISION。不要输出「也可以考虑 ECharts」这种让 Coder 跑偏的句子。

通用
- /loop 每次都是冷启动：状态只信磁盘，不信聊天记忆。
- 同一 W 失败两次：STATUS 标 BLOCKED + 一个问题，跳到下一个互不依赖的 W。
- 连续两轮零文件变更：停 loop，@GeekPlux，附命令输出。
- 不要用「差不多了」「感觉能用」当验收。
