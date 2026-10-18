---
title: Theming
pageClass: folio-docs
sidebar: true
---

# Theming

A chart drawn in your page takes its colors from your CSS, and a chart written to a file keeps the fixed colors of its `theme:` and `palette:`.

## Your colors

Every chart drawn in a page (the script tag, `render()`, React, markdown-it, remark, rehype) writes each color twice: a fixed color, and a `style` that reads a CSS variable with the same color as its fallback.

```html
<rect fill="#3B82F6" style="fill:var(--markvis-series-1,#3B82F6)" … />
```

Set a variable on any element around the chart, `:root` included, and the chart follows it: light, dark, or your brand colors. Leave it unset and the fixed color shows. Where styles are stripped, or the SVG is opened as an image, the fixed color shows too.

### The variables

| Variable | What it paints |
| --- | --- |
| `--markvis-ink` | Titles, value and legend text, axis lines, tick marks, leader lines, and slice edges. |
| `--markvis-muted` | Tick labels, units, notes, and subtitles. |
| `--markvis-grid` | Grid lines, radar rings, and the card outline. They are drawn faint (8–32 % opacity, by theme), so give it a full-strength color, such as your text color, not a pale border color. |
| `--markvis-paper` | The page under the chart: inside hollow points, gaps cut into marks, label halos, and the gaps between treemap tiles. Set it to your background. |
| `--markvis-plate` | The full-frame background that the dark and export surfaces paint. The light surface paints none and shows your page. A page that sets `--markvis-ink` should set `--markvis-plate` too, or a `surface: dark` block keeps its dark plate under your ink. |
| `--markvis-plot` | The plot-area fill, on surfaces that paint one. Set it with the plate. |
| `--markvis-series-1` | The first series, or every mark of a single-series chart. |
| `--markvis-series-2` | The second series. |
| `--markvis-series-3` | The third series. |
| `--markvis-series-4` | The fourth series. |
| `--markvis-series-5` | The fifth series. |
| `--markvis-series-6` | The sixth series. |
| `--markvis-series-7` | The seventh series. |
| `--markvis-series-8` | The eighth series; a ninth series starts again at series 1, lighter. |
| `--markvis-accent` | The one highlighted mark (the largest value) in themes that have an accent. |
| `--markvis-up` | Waterfall steps that rise. |
| `--markvis-down` | Waterfall steps that fall. |
| `--markvis-total` | Waterfall totals and subtotals. |
| `--markvis-font` | The chart's font family. Opt-in: none of the snippets below set it, and a chart keeps its theme's font until you do. Numbers in the `docs` theme keep their own monospace face. |

The same list ships as `CSS_VARIABLES` (and the names without the prefix as `PAINT_NAMES`) from `markvis/themes`.

### Follow the system light or dark mode

```css
:root {
  --markvis-ink: #171717;
  --markvis-muted: #737373;
  --markvis-grid: #171717;
  --markvis-paper: #ffffff;
  --markvis-plate: #ffffff;
  --markvis-plot: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --markvis-ink: #f5f5f4;
    --markvis-muted: #a8a29e;
    --markvis-grid: #f5f5f4;
    --markvis-paper: #1c1917;
    --markvis-plate: #1c1917;
    --markvis-plot: #1c1917;
  }
}
```

### Tailwind `dark:`

Set the variables as arbitrary properties on the element that holds your content:

```html
<article
  class="[--markvis-ink:#171717] [--markvis-muted:#737373] [--markvis-grid:#171717]
         [--markvis-paper:#ffffff] [--markvis-plate:#ffffff] [--markvis-plot:#ffffff]
         dark:[--markvis-ink:#f5f5f4] dark:[--markvis-muted:#a8a29e] dark:[--markvis-grid:#f5f5f4]
         dark:[--markvis-paper:#1c1917] dark:[--markvis-plate:#1c1917] dark:[--markvis-plot:#1c1917]"
>
  …
</article>
```

### Obsidian theme variables

In a CSS snippet or a plugin's `styles.css`, map the theme's own variables, so a chart follows whichever theme the vault uses:

```css
.markvis {
  --markvis-ink: var(--text-normal);
  --markvis-muted: var(--text-muted);
  --markvis-grid: var(--text-normal);
  --markvis-paper: var(--background-primary);
  --markvis-plate: var(--background-primary);
  --markvis-plot: var(--background-primary);
  --markvis-accent: var(--color-accent);
  --markvis-series-1: var(--color-blue);
  --markvis-series-2: var(--color-orange);
  --markvis-series-3: var(--color-green);
  --markvis-series-4: var(--color-purple);
  --markvis-series-5: var(--color-yellow);
  --markvis-series-6: var(--color-cyan);
  --markvis-series-7: var(--color-pink);
  --markvis-series-8: var(--color-red);
  --markvis-up: var(--color-green);
  --markvis-down: var(--color-red);
}
```

### What does not follow the page

- Heatmap and calendar cells, their color key, and the hatch for a missing cell. They are mixed from a fixed ramp.
- Labels drawn on a mark: inside a bar, on a heatmap cell, or on a treemap tile. Each is black or white, picked for the mark's fixed color over the theme's fixed paper. Treemap tiles are translucent, so on a dark page the page shows through them and a tile label can fall below 4.5:1. An opaque, pre-mixed tile fill is planned. If you change a series color a lot, check these labels too.
- The plot border of the export surface.
- Opacity. Grid lines, axis lines, and area fills keep the theme's opacity over the color you set.

A line's end label that the theme darkens to read on its paper still follows `--markvis-series-N`: it takes your series color at full strength, and falls back to the darkened color.

### Fixed colors

A file has no page to read, so `npx markvis bake` and `npx markvis render` write fixed colors only, and so does `surface: export`. Pass `--colors host` to keep the variables in a file. In code, `render(text, { colors: "static" })`, `renderSvg(chart, { colors: "static" })`, `markvis.initialize({ colors: "static" })`, and `<Markvis colors="static">` write fixed colors only; `"host"` is the default.

## Themes

Optional fence field `theme:` picks a named look. Omitted means `folio`. Unknown is `E_UNKNOWN_THEME` plus table fallback — never a silent swap. A theme's colors are the fixed colors above; your variables, when set, win over them.

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
