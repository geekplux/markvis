# markvis

[![check](https://github.com/geekplux/markvis/actions/workflows/check.yml/badge.svg?branch=v2)](https://github.com/geekplux/markvis/actions/workflows/check.yml)

Charts in Markdown. The fence is the data.

Open-source library. Install with npm or a script tag. Any Markdown preview or rendered view. Agents emit a fence; a viewer shows the SVG. Same text, same SVG. No plugin, the table still shows.

**Try:** [https://markvis.js.org/play](https://markvis.js.org/play) · [examples](https://markvis.js.org/examples.html)

**Spec:** [https://markvis.js.org/llms.txt](https://markvis.js.org/llms.txt)

![Mar led Midtown box office](./examples/out/01-bar-basic.svg)

![Walk-up still leads member](./examples/out/02-line-multi.svg)

![MARTA takes the largest mode share](./examples/out/05-pie-raw.svg)

Tags: `chart` | `markvis` | `vis`. Types: bar · line · area · scatter · pie · hist.

Bake so any image viewer shows the figure: `markvis bake README.md`. One-file script: `packages/browser/dist/markvis.min.js`. Spec · integrate · themes: [docs](./docs/site-copy.md).

0.0.13 (frozen): [legacy/](./legacy/). Branch `v2`.
