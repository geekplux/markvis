# markvis preview

Charts in the built-in Markdown preview, drawn from a short code block. Write a few header lines and the numbers as CSV or a table; the preview shows an SVG chart in the editor theme's colors. The block stays plain text, so it reads as a table anywhere else.

````markdown
```chart
markvis: 2
type: bar
title: Mar led Midtown box office at 9.2k tickets
unit: tickets
x: month
y: tickets

month,tickets
Sep,5200
Oct,6100
Nov,7800
Dec,8500
Jan,4800
Feb,7200
Mar,9200
Apr,6900
```
````

Open any `.md` file and run **Markdown: Open Preview** (or **Open Preview to the Side**). Blocks tagged `chart`, `markvis`, or `vis` become charts. An HTML comment such as `<!-- chart: bar x=month y=revenue title="Q3" -->` directly above a table draws that table.

- Types: `bar` | `line` | `area` | `scatter` | `pie` | `hist` | `heatmap` | `funnel` | `waterfall` | `radar` | `gauge` | `sankey` | `treemap` | `dumbbell` | `bullet` | `boxplot` | `calendar`. Optional `theme:` / `palette:` / `surface:` per the spec.
- A block that cannot draw shows its numbers as a table with one error line. The data is never dropped.
- Everything renders locally. The extension makes no network requests.

The full grammar is at [markvis.js.org](https://markvis.js.org).

## Colors

`preview.css` maps the editor theme onto the `--markvis-*` variables: `ink` from the editor foreground, `muted` from the description foreground, `grid` from the editor foreground too (the chart draws grid lines from it at a faint opacity), `paper` / `plate` / `plot` from the editor background, `series-1` to `series-8` from the `charts.*` colors (then terminal cyan and magenta), `accent` from the blue chart color, `up` / `down` from the green and red chart colors, and `total` from the chart foreground. Light, dark, and high-contrast themes follow without a setting. Where a theme leaves a color unset, the chart keeps its own fixed color.

## Build from source

The extension lives in the markvis monorepo under `hosts/vscode` and bundles the `markvis` package. From the repository root:

```bash
pnpm install
pnpm build
pnpm --filter markvis-preview compile
cd hosts/vscode
npx @vscode/vsce package
```

Install the `.vsix` with **Extensions: Install from VSIX...**.

## License

MIT
