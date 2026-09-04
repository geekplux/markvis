# Markvis 2.0 - Goal

## Product

Markvis stays a markdown-it plugin: a vis fence with YAML + data becomes an inline chart (SVG/DOM), not an uploaded image.

Trial UI for this GOAL: apps/playground (only static, reads examples/). No marketing site this cut.

## Acceptance (Phase A)

Done when all true:

1. Baseline green on Node 20+: pnpm install and pnpm test pass.
2. Public contract typed (.ts / .d.ts) for plugin entry and fence options.
3. Modern module shape (ESM + CJS) and examples/proof still produces bar+line+pie.
4. Chart render boundary: layouts behind a small interface;
for bar/line/pie.
5. apps/playground serves locally and renders examples.
6. Docs in-repo (README/GOAL/STATUS) match code. Truth lives only in repo markdown, not Notion.

Out of scope: marketing site, Vega-Lite/Echarts, new chart types, editor app.

## Conduct

Architect picks one unit per wake, updates STATUS.md, does not implement.
Coder implements only via Grok Build in this checkout. No large code pastes in the channel.
pstack only inside Grok Build, never in the channel.
Stop Phase A when acceptance is green and playground opens locally, or two wakes with zero file changes - then ping GeekPlux.
