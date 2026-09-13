# VISION.md — markvis 2.0

Markdown is the programming language of the AI era. Mermaid won **structure** (flow, sequence, state). markvis must win **numbers**.

A chart’s source must also be the data. A model that reads `.md` can compute max/min. Changing one CSV row redraws the figure. People without a plugin still see the table. On failure the numbers must not disappear.

2017 markvis solved “upload one fewer image.” That was a renderer. 2.0’s product is a language:

    fence / GFM table / HTML comment
            ->
         parser
            ->
         Chart IR + JSON Schema
            ->
     SVG | table fallback | stats | playground | later MCP

The default renderer is our own deterministic SVG. Do not make Vega-Lite / ECharts / d3 the core. Those can only be a later `engine:` option.

Brand: keep github.com/geekplux/markvis and the npm name `markvis`. Shipping 2.0.0 requires GeekPlux’s own approval. The story is “the 2017 project, rewritten for AI.”

Do not: Tableau, compete with Mermaid for flowcharts, one npm package per chart, a theme marketplace, accounts, short links, or treat d3 flexibility as the API.
