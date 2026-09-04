# GOAL.md - markvis public v2 site

## Locked
- Docs engine: VitePress only (not docsify/Docusaurus/Starlight/Mintlify)
- Gallery north star: https://www.highcharts.com/demo density (grid of small charts, click to enlarge). Do not steal new chart families, 3D, stock, gauges, maps, JS animation as product.
- Language frozen: chart|markvis|vis and bar|line|area|scatter|pie|hist. No theme field. One default look.
- No npm latest / 2.0.0 stable. Alpha only if GeekPlux says after site live.
- master stays 0.0.13. GitHub Pages must build FROM v2.
- Replace markvis.js.org (today docsify on master). markvis-editor.js.org untouched; homepage links to /play.

## GOAL NOW
Public VitePress site at apps/web with Mermaid.js.org energy + Highcharts demo density.
Routes: / (home), /play, /examples, /spec, /integrate, /ai.
Home: one sentence, Open playground + Examples + GitHub, three live SVGs from examples/out, short fence sample, footer 0.0.13 under legacy/.
Playground: keep apps/playground, product UI (left fence / right figure / switcher / Copy fence / Copy SVG / Open in gallery).
Examples: Highcharts-style gallery, >=40 cards from examples/valid (currently 52), conclusion titles, click for full figure + fence + copy. Generated so docs cannot drift.

## Sequence (one unit at a time)
S1 Coder: apps/web VitePress scaffold + home shell routes
S2 Designer: examples gallery UX tokens/layout (Highcharts density) then Coder implements /examples
S3 Coder: productize apps/playground UI
S4 Writer: home /integrate /ai page copy
S5 Coder: GitHub Pages from v2 replacing docsify
S6 optional: more valid variants inside six types only
