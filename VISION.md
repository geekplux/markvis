# VISION.md — markvis 2.0

Markdown 是 AI 时代的编程语言。Mermaid 赢了「结构」（流程、时序、状态）。markvis 要赢「数字」。

一张图的源码必须同时是数据。模型读 .md 能算 max/min。模型改一行 CSV 就能重画。没装插件的人至少还能看见表。失败时数据不准消失。

2017 的 markvis 解决的是「少上传一张图」。那是渲染器。2.0 的产品是语言：

    围栏 / GFM 表 / HTML 注释
            ->
         parser
            ->
         Chart IR + JSON Schema
            ->
     SVG | 表降级 | stats | playground | 以后 MCP

默认渲染器是我们自己的确定性 SVG。不要把 Vega-Lite / ECharts / d3 当核心。那些以后只能是 engine: 选项。

品牌：保住 github.com/geekplux/markvis 和 npm 名 markvis。发 2.0.0 必须 GeekPlux 本人点头。故事是「2017 年那个项目，按 AI 重写」。

不要做：Tableau、跟 Mermaid 抢流程图、一图一个 npm 包、主题市场、账号、短链、把 d3 灵活性当成 API。
