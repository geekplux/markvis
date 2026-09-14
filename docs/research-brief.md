# Research brief: why not Mermaid / Vega-Lite / 2017 markvis

markvis 2.0 is a tiny versioned chart language (CSV/GFM → Chart IR → deterministic SVG). Conclusion matches VISION.md: do not wrap Vega-Lite; do not revive 2017 d3 plugins; do not pretend Mermaid already owns numbers.

## Mermaid pie / xychart
Mermaid’s pie is label:value prose inside a `pie` fence; values must be positive ([docs](https://mermaid.js.org/syntax/pie.html)). XY Chart is a separate DSL for bar+line only, with its own axis/config surface ([docs](https://mermaid.js.org/syntax/xyChart.html)). Numbers live in Mermaid’s imperative series lists, not as reusable tabular data. GitHub renders Mermaid well for structure (flow/sequence); quantitative tables, progressive HTML-comment+GFM form, and “bad fence → table + error” are outside that product. Competing there dilutes Mermaid’s strength and leaves agents without a stable numeric source.

## Vega-Lite
Vega-Lite is a high-level grammar of interactive graphics: declarative JSON encodings, transforms, layers, selections ([site](https://vega.github.io/vega-lite/), [docs](https://vega.github.io/vega-lite/docs/)). Models already emit that JSON when asked for a chart spec. Wrapping it as “markvis” would not create a Markdown language; it would create a Vega-Lite sidecar. Optional later `engine:` is fine. Not v2 core.

## 2017 markvis
Published markvis (`0.0.13`) is a markdown-it plugin that needs d3 / d3-node and ships chart code via separate `markvis-bar` / `markvis-line` / `markvis-pie` packages ([README](https://github.com/geekplux/markvis/blob/master/README.md), [package.json](https://github.com/geekplux/markvis/blob/master/package.json)). Build is Babel 6; the fence produces pictures, not a versioned IR with table fallback. That stack made embeds. It did not make a language agents can edit.

## Decision
Default = custom grammar + own SVG renderer. Mermaid stays structure. Vega-Lite stays an engine option later. 2017 d3 plugins are out of core.
