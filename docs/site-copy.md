# Site copy

Source for the public homepage. English. Public voice only. Coder pastes onto `/` (C8).

## Hero

markvis

Charts in Markdown. The fence is the data.

Buttons: Playground · Examples

## What it does

- Write a chart as a Markdown fence (or GFM table). The rows are the source of truth.
- Render deterministic SVG — same input, same bytes.
- Keep the table when a host has no plugin, so readers never lose the numbers.

## Who benefits

- README authors who want figures without uploading PNGs
- AI-written Markdown that can edit a row and redraw
- Docs workflows that refuse a screenshot as the source of truth

## 30-second start

1. Open the Playground and paste a fence, or pick an example.
2. Or: `markvis check examples/valid` then `markvis render` on one file.
3. For GitHub READMEs: `markvis bake README.md` (keeps the fence, inserts the image).

## Use it

| Where | How |
| --- | --- |
| GitHub README | `markvis bake` — images show with no JS |
| Any page | drop in `markvis.min.js` (zero network) |
| remark | `@markvis/remark` |
| markdown-it | `@markvis/markdown-it` |

Types: bar · line · area · scatter · pie · hist. Tags: `chart` | `markvis` | `vis`.

Optional look: `theme: folio` (default) · `highcharts` · `shadcn` · `docs`.

## Footer

0.0.13 is frozen under `legacy/`. This site ships from branch `v2`.
