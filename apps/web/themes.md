---
title: Themes
pageClass: folio-docs
sidebar: true
---

# Themes

Optional fence field `theme:` picks a named look. Omitted means `folio`. Unknown is `E_UNKNOWN_THEME` plus table fallback — never a silent swap.

```chart
type: bar
theme: folio
title: Feb led Q3 at 180
x: month
y: revenue

month,revenue
Jan,120
Feb,180
Mar,150
```

Allowed ids: `folio` · `highcharts` · `shadcn` · `docs` · `ant` · `recharts` · `graphite`.

## Theme vs palette

A **theme** is a grammar: mark form, axes, legend policy, typeface, plot chrome, padding. Hex is one column inside that grammar — not the product.

**Palette** is a second axis (colors only): optional fence `palette:` with `ink` · `porcelain` · `warm` · `cool` · `vivid`. Omit → theme pack default colors. Unknown → `E_UNKNOWN_PALETTE` + table. Play and Examples detail keep **two** controls (Theme + Color) — never one merged dropdown.

Hex tables live in `docs/themes.md` / `packages/themes/palettes.ts`. Do not invent hex lists on this page.

Site light/dark mode is chrome only — unrelated to fence `theme=`.

## Packs on disk

Token packs live in `packages/themes/<id>/theme.ts`, resolved by `packages/themes/registry.ts`. `@markvis/render-svg` imports the registry only. No vendor chart runtimes. Site marketing figures stay folio unless a theme control is on.

| id | B&W tell (short) |
| --- | --- |
| `folio` | Open sheet, large left title, end-labels for few lines, dashed second series |
| `highcharts` | Centered title + subtitle unit, tick marks, axis titles, circle legend below |
| `shadcn` | Card outline, subtitle unit, no axis line, smooth lines without points, rounded bars |
| `docs` | UPPERCASE tracked title + rule, monospace numbers, dotted grid |
| `ant` | Dashed grid, short ticks, haloed points, donut with spider leaders |
| `recharts` | Dashed x and y grid, both axis lines with ticks, hollow points |
| `graphite` | Charcoal gray ladder, one accent on the largest value, pill bars, heavy numbers |

Each pack also has its own dark paper for `surface: dark`.

## Side by side

The same chart in every theme. Open one to see it in Examples, where every figure has every theme.

<ThemeStrip stem="02-line-multi" />

<ThemeStrip stem="01-bar-basic" />

To try a theme on your own data, change one line in the fence:

```chart
type: line
theme: graphite
title: Walk-up still leads member
x: week
y: count
series: plan

week,plan,count
W1,walk-up,64
W1,member,28
W2,walk-up,69
W2,member,33
```

## How to add a pack

See [Contributing themes](/contributing-themes). Same `ThemeTokens` keys as folio, register in the registry and in `@markvis/ir` `THEMES`, keep snapshots green.
