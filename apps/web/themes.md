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

Allowed ids: `folio` · `highcharts` · `shadcn` · `docs` · `ant` · `recharts`.

## Theme vs palette

A **theme** is a grammar: mark form, axes, legend policy, typeface, plot chrome, padding. Hex is one column inside that grammar — not the product.

**Palette** is a second axis (colors only). It is not shipped yet; do not invent hex lists here. When it lands, theme stays the grammar and palette stays the colors.

Site light/dark mode is chrome only — unrelated to fence `theme=`.

## Packs on disk

Token packs live in `packages/themes/<id>/theme.ts`, resolved by `packages/themes/registry.ts`. `@markvis/render-svg` imports the registry only. No vendor chart runtimes. Site marketing figures stay folio unless a theme control is on.

| id | B&W tell (short) |
| --- | --- |
| `folio` | Open sheet, soft bar tops, end-labels for few series |
| `highcharts` | Hard plot box, axis titles, square bars, legend |
| `shadcn` | Soft card frame, rounded bars, quiet grid, legend |
| `docs` | Tight inset, thin stroke, bottom legend, no end-labels |
| `ant` | Big title air, narrow columns, technical axes |
| `recharts` | XY grid, bottom legend, stroked scatter rings |

## How to add a pack

See [Contributing themes](/contributing-themes). Same `ThemeTokens` keys as folio, register in the registry and in `@markvis/ir` `THEMES`, keep snapshots green.
