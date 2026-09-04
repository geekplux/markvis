# CONSTITUTION.md — markvis 2.0

这不是一条新聊天。这是仓库宪法。立刻覆盖写入：

- CONSTITUTION.md（本条全文）
- VISION.md
- GOAL.md
- AGENTS.md
- STATUS.md（先写：previous U2 cancelled; legacy modernization is not 2.0）

读完再动手。旧 GOAL 把 2.0 定义成「给 0.0.13 加类型」——作废。
github.com/geekplux/markvis 的 v2 仍是 babel6 + d3 + markvis-bar/line/pie。那叫 U1 救活旧测试，不是产品。

编码只许 Coder 用 Grok Build 在分支 v2。频道禁止大段实现。pstack / poteto-mode 只许在 Grok Build 里。不用 Notion。旧 master 只读。旧 src/ 和旧测试搬进 legacy/ 后冻结。

Architect 写完四份文件后立刻 /loop 30m，直到停机条件成立。不要等人类下一句。

==================================================
1. VISION
==================================================

Markdown 是 AI 时代的编程语言。Mermaid 赢了「结构」（流程、时序、状态）。markvis 要赢「数字」。

一张图的源码必须同时是数据。模型读 .md 能算 max/min。模型改一行 CSV 就能重画。没装插件的人至少还能看见表。失败时数据不准消失。

2017 的 markvis 解决的是「少上传一张图」。那是渲染器。2.0 的产品是语言：

    围栏 / GFM 表 / HTML 注释
            ↓
         parser
            ↓
         Chart IR + JSON Schema
            ↓
     SVG | 表降级 | stats | playground | 以后 MCP

默认渲染器是我们自己的确定性 SVG。不要把 Vega-Lite / ECharts / d3 当核心。那些以后只能是 engine: 选项。

品牌：保住 github.com/geekplux/markvis 和 npm 名 markvis。发 2.0.0 必须 GeekPlux 本人点头。故事是「2017 年那个项目，按 AI 重写」。

不要做：Tableau、跟 Mermaid 抢流程图、一图一个 npm 包、主题市场、账号、短链、把 d3 灵活性当成 API。

==================================================
2. 技术栈（写进 AGENTS.md，违反即拒）
==================================================

允许：
- pnpm workspaces + TypeScript strict
- Node 20
- IR 用 zod（或同等）定义，再生成 schema/markvis-2.schema.json
- 测试：vitest
- 文档站级 Markdown 宿主：remark 插件 + markdown-it 插件（薄适配，核心不准绑其中一个）
- 试用页：Vite + 浏览器里跑同一份 parser 和 render-svg，零后端
- SVG：手写确定性字符串或最小自研 layout，禁止运行时拉 d3/d3-node/jsdom 才能出图
- CI 以后：GitHub Actions，先本地能跑同样命令
- 包管理：@markvis/ir @markvis/parser @markvis/render-svg @markvis/cli @markvis/remark @markvis/markdown-it
- 根包 markvis 只做 re-export 和 CLI bin

禁止出现在 packages/ 和 apps/ 的 dependencies：
d3, d3-node, markvis-bar, markvis-line, markvis-pie, markdown-it-fence, babel-preset-es2015, jsdom-as-renderer

legacy/ 可以保留旧依赖，但 packages/* 的测试不准 import legacy。

==================================================
3. 目录（按这个长，不准另起一套）
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

==================================================
4. 冻结语法
==================================================

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

==================================================
5. 工作流（按序，做完一块勾 STATUS，不要并行改语法）
==================================================

W0 纠偏
把旧树移到 legacy/。根目录变成 monorepo。STATUS 写明 U2 cancelled。
grep packages apps 不得命中 d3-node 或 markvis-bar。

W1 研究
docs/research-brief.md：Mermaid pie/xychart、Vega-Lite、2017 markvis、Observable Plot。
结论必须站 VISION：自研小 DSL，不包 Vega。

W2 规格
SPEC.md 必须有：语法、字段表、6 种图语义、降级规则、8 个可复制例子、错误码表。
Writer 写。Architect 只准收紧字句，不准加第 7 种 type。

W3 例子
valid 至少 50 个，invalid 至少 15 个。每个文件顶部一段 intent。
覆盖：6 种图、多系列、12+ 类目、unicode、缺 title、大数与 0、不求和 pie、行序保持、三种语言标签、GFM 表、HTML 注释形态、长 label。
invalid：未知 type、JSON 数据、缺表头、多一列、pie 负、空数据、重复列名、type 拼错、YAML 和表冲突、只有头没有数据。

W4 IR + parser
zod IR。全部 65 个 fixture 的测试。错误码稳定。零渲染依赖。

W5 schema
从 IR 生成 schema/markvis-2.schema.json，CI 检查手改漂移。

W6 render-svg
6 种图。轴、刻度、网格、title、legend、默认 8 色（对比足够）、aria-label、figure 语义。
同一 IR -> 同一 SVG 字节。快照提交 examples/out。改一像素测试红。

W7 CLI
markvis check | render | preview | stats | to-table
stats 打印 type n min max series。
preview 打开单文件左右对照，不必是完整产品。

W8 宿主
remark 和 markdown-it 各一个适配器。fixture：输入含围栏的 md，输出 HTML 同时含 svg 和 table。
无插件时源码仍是合法 Markdown。

W9 playground
Vite。左围栏右 SVG+降级表。顶部例子切换绑定 examples/valid。
Copy fence / Copy SVG。无效输入显示表+错误，禁止白屏。
pnpm --filter playground build 必须过。

W10 AI 面
skills/markvis/SKILL.md：何时用、何时不准用 Mermaid、8 few-shot、反模式。
llms.txt + llms-full.txt。
examples/prompts.md：30 句人话。Coder 写一个 scripts/eval-prompts（可以先伪，但要能跑 check）。
失败记入 docs/model-errors.md。

W11 工程硬化
vitest 覆盖 parser/render/cli。
.github/workflows/check.yml：install + test + check valid + check invalid 非0 + playground build。
AGENTS.md 写给未来 Grok Build：语言已冻，禁止加 type，禁止加 d3。
docs/best-practices.md 写给人看的贡献规则。

W12 加厚（W0-W11 全绿才开始，这是「不停工作」的燃料）
- compat-legacy：把 2017 YAML vis 围栏尽量解析到新 IR，默认关闭，测试单独放
- GitHub Action：PR 评论里贴渲染 SVG
- packages/mcp/README.md + 最小 validate/suggest/render/toTable（能本地 stdio 跑就行）
- 视觉回归：除快照外再做一个 examples/gallery.html 由 CLI 生成
- landing.md ≤40 行：是什么、为什么不是 Mermaid、怎么试、三张 svg
- README 顶部改成 2.0 入口，旧用法链到 legacy/README.md
- 性能：1000 行 CSV 的 check+render 上限写进测试（自己量，再定阈值，不准空想数字）
- a11y：每个 SVG 有 title/desc，颜色不只靠色盲不友好的红绿一对

未做完 W12 不准宣布「今天做完」。未做完 W9 不准提官网。

==================================================
6. 最佳实践（每轮违反就重做）
==================================================

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

==================================================
7. 验收（少一条就不能停）
==================================================

    pnpm test
    pnpm markvis check examples/valid
    pnpm markvis check examples/invalid          退出码必须非 0
    pnpm markvis stats examples/valid/01-bar-basic.md
    pnpm --filter playground build
    rg "d3-node|markvis-bar|markvis-line|markvis-pie" packages apps && exit 1

playground dev：能切例子、能改围栏出图、能复制围栏。
每个 valid 例子在 examples/out 有对应 svg。
CONSTITUTION.md VISION.md SPEC.md SKILL.md 都在仓库里，不是只在频道里。

==================================================
8. 循环（现在就臂）
==================================================

Architect 在 W0 文件落地后执行：

    /loop 30m 读 CONSTITUTION.md GOAL.md STATUS.md DECISIONS.tsv。
    若验收命令全绿且 W12 至少完成 gallery + landing + README 入口：停 loop，@GeekPlux。
    否则只做一个未勾选 W。点名负责人。
    Coder 的任务必须附上完整 grok -p 一句话。
    写一行 TSV。不要聊天解决问题。

心跳不要短于 30 分钟。不要 5 分钟。不要让 Grok Build 会话自己再套一层 /loop 盯同一件事。

==================================================
9. Architect 此刻第一句话
==================================================

1. 确认 workdir 和分支 v2
2. 确认旧代码已计划移入 legacy/（或正在移）
3. 确认 CONSTITUTION.md 已写入
4. 取消 U2
5. 派 W0 给 Coder，派 VISION/SPEC 给 Writer

开始。不要等下一封人类消息。
