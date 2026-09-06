# Site copy

Source for the public homepage. English. Public voice only.
Coder mounts onto `/` per `docs/design/HOME.md` (white product home — not beige wash).

## 1. Hero

markvis

Charts in Markdown. The fence is the data.

Buttons: Playground · Examples

## 2. What it does

- The fence (or GFM table) is the source — the rows stay in the file.
- Same input yields the same SVG.
- No plugin still shows the table, so readers never lose the numbers.

## 3. Who it helps

**README / post authors** — figures without uploading a PNG that drifts from the data.

**Agent-written Markdown** — edit a row, redraw the chart; the agent never paints pixels.

**No-screenshot workflows** — refuse a bitmap as the source of truth.

## 4. Proof

Three uncropped SVGs (folio). One quiet caption each — never duplicate the SVG title as a heading.

1. Feb led Q3 — `examples/out/01-bar-basic.svg`
2. Pro pulled ahead — `examples/out/02-line-multi.svg`
3. Shares stay raw — `examples/out/05-pie-raw.svg`

## 5. 30-second start

1. Open [Playground](https://markvis.js.org/play) — paste a fence or pick an example.
2. Or bake a README: `markvis bake README.md` (keeps the fence, inserts the image).

## 6. Use it

| Where | How |
| --- | --- |
| GitHub README | `markvis bake` — images show with no JS |
| Any page | `markvis.min.js` (zero network) |
| remark | `@markvis/remark` |
| markdown-it | `@markvis/markdown-it` |

## 7. Themes

Four looks via a fence header (`folio` default): folio · highcharts · shadcn · docs — try them on [Examples](/examples).

## 8. Footer

MIT · [GitHub](https://github.com/geekplux/markvis) · 0.0.13 frozen under `legacy/` · site from branch `v2`
