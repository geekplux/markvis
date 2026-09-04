# visual-spec — Ledger → markvis (W14a rewrite)

Language: **Ledger** (`docs/designer-language.md`). Critique: `docs/visual-critique.md`.

Constraints: static deterministic SVG · six types only · **no** `theme:` · **no** HTML poster · **no** animation · **no** d3 · implement only in `packages/render-svg` · regenerate `examples/out/*` + `examples/gallery.html` · update vitest snapshots in the same unit.

Fixture sources for 01 / 02 / 05 / 09 / 17 may receive **title-only** edits so the IR title is a conclusion (never a chart-type word). No other product escape hatches.

---

## Locked tokens

| Token | Value |
| --- | --- |
| Frame default | `720` wide · height `480` minimum; **grow height** up to `640` when label-driven bottom margin would drop plot height below `0.55 × height` |
| Paper | `#F7F4EF` full-frame `<rect>` first paint after title/desc |
| Ink | `#1C1917` |
| Quiet | `#78716C` |
| Tick text | `#57534E` |
| Hairline | `#E7E5E4` stroke `1` |
| Structure | `#A8A29E` stroke `1` |
| S1 accent | `#2B6CB0` |
| S2 | `#C65D2E` |
| S3 | `#2F8F6B` |
| S4 | `#B08900` |
| S5 | `#6B5B95` |
| S6 | `#8B6B4A` |
| S7 | `#C44C6A` |
| S8 | `#4A7C8C` |
| Font | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` |

Single series = S1 only. Extra hues only for extra series / pie slices. Cap 8; then reuse S1… at `opacity 0.7`.

---

## Type grades (3)

| Role | Size | Weight | Fill |
| --- | --- | --- | --- |
| Title | `17px` | `600` | ink |
| Unit (title tspan) | `12px` | `400` | quiet |
| Value / end-label | `11px` | `500` | ink |
| Tick / category | `10px` | `400` | tick text |
| Note (rare) | `11px` | `400` | quiet |

No axis-name layer by default (see Title / chrome).

---

## Title rule

- Render the IR title string only. **Never** prefix/suffix chart type (`bar`, `line`, `pie`, “Share” as type).
- Title **left-aligned** to plot left (`text-anchor="start"` at plot `x`).
- Unit rides title as ` · USD` / ` · USD k` only when unit exists; never on every tick.
- Fixture titles for the five acceptance SVGs **must be conclusions**, e.g.:
  - 01: claim Feb led (with number)
  - 02: claim free leads pro
  - 05: claim A leads at 40
  - 09: claim Jul peak
  - 17: claim North America leads spend
- If IR title empty: fall back to ``${yField}${unit ? ` · ${unit}` : ''}`` — still not a chart type.

---

## Chrome suppression

- **Do not draw** rotated y-axis name or x-axis name when the title already names the measure (default: **omit both**).
- Y-grid: hairlines at major ticks **except** the baseline (axis owns the baseline). ≤4 gridlines.
- Dual encoding:
  - `n_categories ≤ 6` (bar/hist): **value labels on** · **omit interior y-grid** (axis + ticks only)
  - `n_categories > 8`: **value labels off** · keep ticks + interior grid
  - `7–8`: value labels on if bar width ≥ `18px`, else off

---

## Margins & plot share

1. Start from content: title block (title + optional unit) top; ticks left; categories bottom.
2. Left = max(`48`, tickTextWidth + `10`).
3. Bottom = category label extent + `12` (rotation included). If horizontal labels fit with ≥`2px` gap, do not rotate.
4. Top = title baseline + `12` (no legend row if end-labels used).
5. Right = max(`20`, end-label overhang / pie leader overhang).
6. **After** margins: if `(plotBottom - plotTop) / height < 0.55`, increase `height` (and viewBox) until true, cap `640`. Do not solve label overflow by crushing the plot.

---

## Numbers

- Thousands separators on values ≥ `1000` (`420,000`).
- One scale only: title unit, ticks, and value labels share the same unit system. No auto-`k` on ticks while labels stay full.
- Prefer full numbers on ticks when value labels are full.

---

## Bar / hist

- Gap = `28%` of band when `n ≤ 6`; `18%` when `n > 6`.
- Grouped series: `2px` inner gap.
- **Max bar width `72px`** when `n ≤ 4` (center the bar in the band). Stop stadium slabs.
- Top radius only: `rx = 2`. No `crispEdges`.
- Fill S1 (or series color). No bar stroke.
- Value label: `8px` above top if height ≥ `28`; else inside near top. Skip if bar width < `14`.

## Line / area

- Stroke `1.75px`, round cap/join.
- Points `r = 2.5` if vertices ≤ `40`; else no points.
- Area: series fill `opacity 0.14`, stroke on top edge.
- **≤4 series:** end-label at last point (series name, `11px/500`, series color) — **no color legend**.
- **>4 series:** compact legend under title, left-aligned to plot left.

## Scatter

- Points `r = 3`, `fill-opacity 0.85`, no stroke. No connectors.

## Pie

- Do not normalize to 100. Angle ∝ raw value.
- Radius `0.34 × min(plotW, plotH)`. Center in the **plot box**, not the frame (title already took top).
- Slice stroke = paper `1.5px`.
- Outside labels `name · value` + structure leaders `1px`. No side legend when outside labels exist.
- Title still must be a conclusion, not “Share”.

---

## A11y & determinism

Keep `<title>`, `<desc>`, `role="img"`, labelledby/describedby, `data-markvis`, stable ids, series/x/y attrs. Same IR → same bytes.

---

## Out of scope

`theme:`, dark mode, animation, tooltips, new types, marketing chrome, HTML posters, d3.

## Done when

1. `docs/designer-language.md` and this file match Ledger.
2. Regenerated 01 / 02 / 05 / 09 / 17 pass a second measured critique (plot share, title conclusions, dual-encoding rule, bar width cap, end-labels).
3. `pnpm test` green; gallery regenerated.
4. GeekPlux has not rejected the five.
