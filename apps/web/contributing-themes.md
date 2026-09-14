---
title: Contributing themes
pageClass: folio-docs
sidebar: true
---

# Contributing themes

A theme is a **grammar** pack: mark form, axes, legend policy, typeface, plot chrome, padding. Hex is one column — never the whole theme. Site light/dark mode is unrelated.

Do not invent a seventh chart type. Do not pull a chart runtime into `packages/` or `apps/`.

## Layout

Add a pack under `packages/themes/<id>/`:

```
packages/themes/<id>/
  theme.ts          # token table (same keys as folio)
  README.md         # intent + fence id
  examples/         # ≥ bar, line, pie fences with theme: <id>
```

## Steps

1. Implement `theme.ts` with the same `ThemeTokens` keys as `packages/themes/folio/theme.ts`. No vendor chart deps.
2. Register the pack in `packages/themes/registry.ts` (`themeRegistry` + package exports). Missing packs fail loudly via `resolveThemePack`.
3. Add the id to `THEMES` in `@markvis/ir` so the parser accepts the fence string. Omit → `folio`. Unknown → `E_UNKNOWN_THEME` plus table fallback — never a silent swap.
4. Wire Play / Examples labels separately; this package is token truth only.
5. Keep snapshots under `examples/out/themes/` green when visuals change on purpose (`UPDATE_SNAPSHOTS=1`).

`@markvis/render-svg` imports the registry only. Public fence field:

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

Allowed today: `folio` · `highcharts` · `shadcn` · `docs` · `ant` · `recharts`. See [Themes](/themes) for grammar vs palette.
