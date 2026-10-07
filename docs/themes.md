# themes.md — markvis theme token packs

Scope: optional fence `theme: folio|highcharts|shadcn|docs|ant|recharts` (grammar). Omitted = folio. Unknown = E_UNKNOWN_THEME + table. Optional `palette: ink|porcelain|warm|cool|vivid` (colors). Omitted = theme pack default colors. Unknown = E_UNKNOWN_PALETTE + table. Themes are token packs in `packages/themes/<id>/theme.ts`, typed by `packages/themes/contract.ts` and resolved by `packages/themes/registry.ts`. No Highcharts/d3/Unovis/Recharts deps. No new chart types. Public UI: two controls (Theme + Color). Labels may say Folio / Highcharts-style / shadcn-style / Docs — avoid trademark claims in marketing copy.

Default site figures stay folio.

This file is token truth: theme grammar packs plus the color-only palette tables. Site chrome is `docs/site.md`. Ledger / folio look is `docs/visual-spec.md`. The token tables below are generated from the packs; when a pack changes, regenerate them rather than editing by hand.

---

## What a theme owns

A theme is structure first. Every pair of packs must differ on at least four structural switches in both a line and a bar chart (`packages/render-svg/test/render.test.ts`, "B&W theme skeletons"), so readers can tell them apart in black and white.

| Group | Tokens | Choices |
| --- | --- | --- |
| Type ramp | `TYPE.*` | Any size at or above the floor: title `15`, every other role `11` |
| Title | `TITLE`, `TITLE_RULE` | left or centered · capitals · letter-spacing · unit inline or as a subtitle · rule |
| Numbers | `FONT_NUMERIC` | Separate face for tick and value labels |
| Grid | `GRID` | dash pattern · width · y only or x and y |
| Axes | `AXIS`, `AXIS_TITLES` | no baseline · baseline · x and y lines · tick length · axis titles |
| Lines | `LINE_CURVE`, `MARKER`, `SERIES_DASH` | linear or monotone · filled, hollow, haloed, or no points · per-series dashes |
| Legend | `LEGEND`, `LEGEND_BELOW`, `END_LABEL_SERIES_MAX` | square, rounded, circle, or line keys · left or centered · top or bottom · end labels |
| Chrome | `FRAME`, `PLOT_BG`, `PLOT_BORDER` | card outline and radius · plot fill (always `null`) · plot border |
| Surfaces | `SURFACES.light/dark/export` | plate, paper, ink, semantic colors (waterfall, heatmap, treemap), optional dark series colors |

`palette:` replaces series colors on every surface, including a surface's own dark series colors. It never changes structure.

## Palettes (color axis)

`palette=` replaces **series / categorical fills and strokes only**. Margins, ticks, legend placement, radius, and grid stay with the theme.

Five ids, eight series each (wrap at `WRAP_OPACITY` like themes). Omit `palette=` → the theme pack’s own default `PALETTE`. Unknown id → `E_UNKNOWN_PALETTE` + table. Names are frozen: `ink` · `porcelain` · `warm` · `cool` · `vivid` — no aliases.

Hex lock (series 0…7), source of truth also `packages/themes/palettes.ts`:

| id | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **ink** | `#2A2F2A` | `#5C6560` | `#8A9188` | `#3D4A5C` | `#6B5A4E` | `#4A5C54` | `#7A6E62` | `#4E5560` |
| **porcelain** | `#5B7C99` | `#8FA3B0` | `#6A8F8A` | `#9AA4B2` | `#7B8FA6` | `#A8B4BC` | `#6E7F8E` | `#B0BEC5` |
| **warm** | `#C45C26` | `#D4892A` | `#B33A2B` | `#E0A05A` | `#9C4A2F` | `#C97B4A` | `#A65D3A` | `#D4A574` |
| **cool** | `#2F6F8F` | `#3D8B8C` | `#4A6FA5` | `#5B9AA8` | `#3A5F7A` | `#6B8FB8` | `#2E7A6E` | `#7A9BB0` |
| **vivid** | `#E11D48` | `#2563EB` | `#16A34A` | `#D97706` | `#9333EA` | `#0891B2` | `#EA580C` | `#4F46E5` |

---

## folio

### Intent

Ledger editorial default. Quiet hairline grid, value labels when the dual-encoding rule allows, end labels for a few lines, dashed series so a printout still separates them. The light figure paints no canvas; the Markdown host is the paper.

### Tell

Large left title with the unit inline · end labels instead of a legend for 2–4 lines · dashed second series

### Tokens (from `packages/themes/folio/theme.ts`)

| Token | Value |
| --- | --- |
| Font | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` |
| Numeric font (ticks, values) | same as Font |
| Ink / quiet | `#171717` / `#737373` |
| Type — title / unit | `21` / `600` · `13` / `400` |
| Type — value / tick / legend | `13` / `500` · `12` / `400` · `13` / `400` |
| Title | left |
| Unit | inline (` · unit` on the last title line) |
| Grid | solid, y only, ink at `0.10` |
| Axes | x baseline, no ticks |
| Lines | linear, stroke `1.75`, filled points (r `2.5`), dashed series for B&W |
| Bars | radius `3`, max width `72` |
| Pie | solid, leaders |
| Legend | square keys, left, under the title; end labels for ≤ 4 lines |
| Frame | none |
| Dark paper / ink | `#1c1917` / `#f5f5f4` |
| Series palette | `#3B82F6`, `#F97316`, `#10B981`, `#A855F7`, `#EAB308`, `#14B8A6`, `#F43F5E`, `#64748B` |

### Ban list

- Full-frame paper or card on the light surface
- Vertical grid, axis boxes, tick marks
- Centered title or subtitle unit
- Stronger grid than hairline `0.10`

---

## highcharts

### Intent

Classic dashboard. Centered light title with the unit as a subtitle, bold legend centered under the plot, tick marks on the category axis, axis titles. Highcharts-demo-inspired tokens only; no vendor dependency.

### Tell

Centered 18/400 title · subtitle unit · circle legend keys centered below · 6px x ticks

### Tokens (from `packages/themes/highcharts/theme.ts`)

| Token | Value |
| --- | --- |
| Font | `"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif` |
| Numeric font (ticks, values) | same as Font |
| Ink / quiet | `#333333` / `#666666` |
| Type — title / unit | `18` / `400` · `12` / `400` |
| Type — value / tick / legend | `11` / `700` · `11` / `400` · `12` / `700` |
| Title | centered |
| Unit | subtitle line |
| Grid | solid, y only, ink at `0.14` |
| Axes | x baseline, `6px` ticks, axis titles |
| Lines | linear, stroke `2`, filled points (r `4`) |
| Bars | radius `0`, max width `64` |
| Pie | solid, legend |
| Legend | circle keys, centered, below the plot |
| Frame | none |
| Dark paper / ink | `#1f2433` / `#e0e0e3` with its own series colors |
| Series palette | `#7cb5ec`, `#434348`, `#90ed7d`, `#f7a35c`, `#8085e9`, `#f15c80`, `#e4d354`, `#2b908f` |

### Ban list

- Rounded bar tops (`BAR_RX > 0`)
- Left-aligned title
- Claiming Highcharts affiliation or shipping Highcharts JS

---

## shadcn

### Intent

Card UI. The figure sits in a hairline card with a 12px radius. Title and muted description stack at the top left. No axis line, smooth monotone curves without point marks, rounded bars and keys, legend centered below.

### Tell

Card outline · subtitle unit · monotone lines with no points · bar radius 8

### Tokens (from `packages/themes/shadcn/theme.ts`)

| Token | Value |
| --- | --- |
| Font | `Geist, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` |
| Numeric font (ticks, values) | same as Font |
| Ink / quiet | `#0A0A0A` / `#737373` |
| Type — title / unit | `16` / `600` · `13` / `400` |
| Type — value / tick / legend | `12` / `500` · `12` / `400` · `12` / `500` |
| Title | left |
| Unit | subtitle line |
| Grid | solid, y only, ink at `0.08` |
| Axes | no baseline, no ticks |
| Lines | monotone, stroke `2`, none points (r `3.5`) |
| Bars | radius `8`, max width `68` |
| Pie | donut `0.5`, legend |
| Legend | rounded keys, centered, below the plot |
| Frame | card outline, radius `12` |
| Dark paper / ink | `#09090b` / `#fafafa` with its own series colors |
| Series palette | `#F54900`, `#009689`, `#104E64`, `#FFB900`, `#FE9A00` |

### Ban list

- Axis lines or tick marks
- Point markers on lines
- A filled plot well

---

## docs

### Intent

Technical manual. Uppercase tracked title with a rule, monospace numbers, dotted grid, thin lines, line-style legend keys at the bottom. Built to sit inside documentation pages.

### Tell

UPPERCASE tracked title + rule · monospace tick and value labels · dotted `1 3` grid

### Tokens (from `packages/themes/docs/theme.ts`)

| Token | Value |
| --- | --- |
| Font | `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` |
| Numeric font (ticks, values) | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` |
| Ink / quiet | `#18181B` / `#64748B` |
| Type — title / unit | `15` / `600` · `11` / `400` |
| Type — value / tick / legend | `11` / `500` · `11` / `400` · `11` / `500` |
| Title | left, capitals, tracking `0.06em`, rule under |
| Unit | inline (` · unit` on the last title line) |
| Grid | dashed `1 3`, y only, ink at `0.32` |
| Axes | x baseline, no ticks |
| Lines | linear, stroke `1.5`, filled points (r `2`), dashed series for B&W |
| Bars | radius `0`, max width `64` |
| Pie | solid, leaders |
| Legend | line keys, left, below the plot |
| Frame | none |
| Dark paper / ink | `#0f172a` / `#e2e8f0` with its own series colors |
| Series palette | `#475569`, `#64748B`, `#0F766E`, `#334155`, `#78716C`, `#57534E` |

### Ban list

- Rounded bars
- Color-heavy palettes on light paper
- End labels

---

## ant

### Intent

Data product. Dashed grid, short ticks, haloed points, circle legend keys under the title, axis titles. AntV-inspired tokens only; no `@antv/*` dependency.

### Tell

Dashed `4 4` grid · haloed points · 0.6 donut with spider leaders

### Tokens (from `packages/themes/ant/theme.ts`)

| Token | Value |
| --- | --- |
| Font | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| Numeric font (ticks, values) | same as Font |
| Ink / quiet | `#262626` / `#8C8C8C` |
| Type — title / unit | `17` / `600` · `12` / `400` |
| Type — value / tick / legend | `12` / `400` · `12` / `400` · `12` / `400` |
| Title | left |
| Unit | inline (` · unit` on the last title line) |
| Grid | dashed `4 4`, y only, ink at `0.2` |
| Axes | x baseline, `4px` ticks, axis titles |
| Lines | linear, stroke `2`, halo points (r `3.5`) |
| Bars | radius `2`, max width `56` |
| Pie | donut `0.6`, leaders |
| Legend | circle keys, left, under the title |
| Frame | none |
| Dark paper / ink | `#141414` / `#e8e8e8` |
| Series palette | `#5AD8A6`, `#E8684A`, `#5D7092`, `#F6BD16`, `#6DC8EC`, `#9270CA`, `#FF9D4D`, `#269A99` |

### Ban list

- Solid grid
- Centered title
- Shipping G2 or Ant Design Charts

---

## recharts

### Intent

React default. Dashed x and y grid, both axis lines with 6px ticks, monotone curves with hollow points, scatter rings, legend centered below.

### Tell

Dashed `3 3` grid in x and y · x and y axis lines with ticks · hollow points

### Tokens (from `packages/themes/recharts/theme.ts`)

| Token | Value |
| --- | --- |
| Font | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` |
| Numeric font (ticks, values) | same as Font |
| Ink / quiet | `#374151` / `#6B7280` |
| Type — title / unit | `16` / `600` · `12` / `400` |
| Type — value / tick / legend | `12` / `500` · `12` / `400` · `12` / `400` |
| Title | left |
| Unit | inline (` · unit` on the last title line) |
| Grid | dashed `3 3`, x and y, ink at `0.22` |
| Axes | x and y axis lines, `6px` ticks |
| Lines | monotone, stroke `2`, hollow points (r `3.5`) |
| Bars | radius `0`, max width `60` |
| Pie | solid, legend |
| Legend | square keys, centered, below the plot |
| Frame | none |
| Dark paper / ink | `#111827` / `#f3f4f6` |
| Series palette | `#8884d8`, `#82ca9d`, `#ffc658`, `#ff7300`, `#0088FE`, `#00C49F`, `#FFBB28`, `#FF8042` |

### Ban list

- Rounded bars
- Single-axis grid
- Shipping the Recharts runtime

---

## Contribution path

Add a theme pack under `packages/themes/<id>/`:

```
packages/themes/<id>/
  theme.ts          # token table that `satisfies ThemeTokens`
  README.md         # intent + fence id
  examples/         # ≥ bar, line, pie fences with theme: <id>
```

1. Implement `theme.ts` against `ThemeTokens` in `packages/themes/contract.ts` (no vendor chart deps). Give it its own dark surface.
2. Register the pack in `packages/themes/registry.ts` (`themeRegistry` + exports). Missing packs fail loudly via `resolveThemePack`.
3. Add the id to `THEMES` in `@markvis/ir` so the parser accepts the fence string (omit → folio; unknown → `E_UNKNOWN_THEME` + table).
4. Wire playground / examples UI labels separately; this package is token truth only.
5. Bake `examples/out/themes/<id>/` with `UPDATE_SNAPSHOTS=1`. `packages/render-svg/test/fixtures.test.ts` byte-checks every theme against every valid fixture, and the B&W skeleton test requires the new pack to differ from every other on at least four structural switches.

`@markvis/render-svg` imports the registry only (`themeTokens` → `resolveThemePack`). Do not add Highcharts/d3/Unovis/Recharts runtime deps.
