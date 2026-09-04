# visual-spec — Ledger → markvis (transparent canvas)

Language: **Ledger** (`docs/designer-language.md`). Critique: `docs/visual-critique.md`.

Constraints: static deterministic SVG · six types only · **no** `theme:` · **no** HTML poster · **no** animation · **no** d3 · implement only in `packages/render-svg` · regenerate `examples/out/*` + `examples/gallery.html` · update vitest snapshots in the same unit.

Fixture sources for 01 / 02 / 05 / 09 / 17 may receive **title-only** edits so the IR title is a conclusion (never a chart-type word). No other product escape hatches.

**Host assumption:** light Markdown article. Canvas is transparent so the host background shows through. Do not assume a paper plate.

---

## Canvas

- **Transparent.** Do **not** emit a full-frame `<rect>` (no paper `#F7F4EF`, no card fill, no background slab).
- First paints after `<title>` / `<desc>` are chrome and marks only.
- SVG root keeps `viewBox` and size attrs; fill remains unset / none.

---

## Locked tokens

| Token | Value |
| --- | --- |
| Frame default | `720` wide · height `480` minimum; **grow height** up to `640` when label-driven bottom margin would drop plot height below `0.55 × height` |
| Canvas | transparent — **no** full-frame fill |
| Ink | `#171717` |
| Quiet | `#737373` |
| Hairline | ink `#171717` at opacity `0.10`, stroke `1` (horizontal grid only) |
| Structure | ink `#171717` at opacity `0.28`, stroke `1` (baseline, leaders, pie slice separators) |
| S1 | `#3B82F6` |
| S2 | `#F97316` |
| S3 | `#10B981` |
| S4 | `#A855F7` |
| S5 | `#EAB308` |
| S6 | `#14B8A6` |
| S7 | `#F43F5E` |
| S8 | `#64748B` |
| Font | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` |

Single series = S1 only. Extra hues only for extra series / pie slices. Cap 8; then reuse S1… at `opacity 0.7`.

Tick / category text uses Quiet (`#737373`). Title and value labels use Ink.

---

## Type grades (3)

| Role | Size | Weight | Fill |
| --- | --- | --- | --- |
| Title | `17px` | `600` | ink |
| Unit (title tspan) | `12px` | `400` | quiet |
| Value / end-label | `11px` | `500` | ink |
| Tick / category | `10px` | `400` | quiet |
| Note (rare) | `11px` | `400` | quiet |

No axis-name layer by default (see Quiet chrome).

---

## Title rule

- Render the IR title string only. **Never** prefix/suffix chart type (`bar`, `line`, `pie`, "Share" as type).
- Title **left-aligned** to plot left (`text-anchor="start"` at plot `x`).
- Unit rides title as ` · USD` / ` · USD k` only when unit exists; never on every tick. Honest units once.
- Fixture titles for the five acceptance SVGs **must be conclusions**, e.g.:
  - 01: claim Feb led (with number)
  - 02: claim free leads pro
  - 05: claim A leads at 40
  - 09: claim Jul peak
  - 17: claim North America leads spend
- If IR title empty: fall back to yField (+ unit when present) — still not a chart type.

---

## Quiet chrome

Steal the upside from shadcn area charts: structure that disappears until you look for it.

- **Do not draw** an axis box (no left+bottom rectangle framing the plot).
- **Baseline only** on the plot floor (structure stroke). No top or right axis strokes.
- **No tick lines** sticking off the axis — tick *text* only.
- **Do not draw** rotated y-axis name or x-axis name when the title already names the measure (default: **omit both**).
- **Horizontal grid only:** hairlines at major y-ticks **except** the baseline (axis owns the baseline). **≤3** interior gridlines. **No vertical grids.**
- Dual encoding (same rigor as before):
  - `n_categories ≤ 6` (bar/hist): **value labels on** · **omit interior y-grid** (baseline + ticks only)
  - `n_categories > 8`: **value labels off** · keep ticks + interior horizontal grid (≤3)
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

## Soft series

Steal the upside from shadcn area charts: soft fill under a quiet stroke.

### Bar / hist

- Gap = `28%` of band when `n ≤ 6`; `18%` when `n > 6`.
- Grouped series: `2px` inner gap.
- **Max bar width `72px`** when `n ≤ 4` (center the bar in the band). Stop stadium slabs.
- Top radius only: `rx = 3`. No `crispEdges`. Square frame/axes still.
- Fill S1 (or series color), solid. No bar stroke.
- Value label: `8px` above top if height ≥ `28`; else inside near top. Skip if bar width < `14`.

### Line / area

- **Linear** segments only — **not** spline / curve / monotone cubic.
- Stroke `1.75px`, round cap/join.
- Points `r = 2.5` if vertices ≤ `40`; else no points.
- Area: series fill `opacity 0.22`, stroke on top edge.
- **≤4 series:** end-label at last point (series name, `11px/500`, series color) — **no color legend**.
- **>4 series:** compact legend under title, left-aligned to plot left.

### Scatter

- Points `r = 3`, `fill-opacity 0.85`, no stroke. No connectors.

### Pie

- Do not normalize to 100. Angle proportional to raw value.
- Radius `0.34 × min(plotW, plotH)`. Center in the **plot box**, not the frame (title already took top).
- Slice separator stroke = **structure** (ink at 0.28) `1.5px` — not paper, not a light fill stroke.
- Outside labels name · value + structure leaders `1px`. No side legend when outside labels exist.
- Title still must be a conclusion, not a chart-type word.

---

## A11y & determinism

Keep title, desc, role=img, labelledby/describedby, data-markvis, stable ids, series/x/y attrs. Same IR to same bytes.

---

## Out of scope

`theme:`, dark mode, paper / full-frame canvas fill, animation, tooltips, new types, marketing chrome, HTML posters, d3, vertical grids, axis boxes, tick lines, spline interpolation.

## Done when

1. designer-language.md and this file match Ledger transparent canvas.
2. Acceptance SVGs pass measured critique with no paper rect.
3. Tests green and gallery regenerated.
4. Product owner has not rejected the five.
