# visual-spec — default SVG look (W14a)

One default. No `theme:`. Tokens only. Implement in `packages/render-svg`.

Read against: `examples/gallery.html`, `out/01-bar-basic`, `02-line-multi`, `05-pie-raw`, `09-bar-twelve-categories`, `17-bar-long-labels`.

---

## Canvas

| Token | Value |
| --- | --- |
| Frame | `720×480` viewBox (keep) |
| Paper | `#F7F4EF` fill on a root `<rect width="100%" height="100%"/>` — never naked transparent |
| Ink | `#1C1917` |
| Mute | `#78716C` |
| Hairline | `#E7E5E4` |
| Axis | `#A8A29E` |
| Font | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` |

Plot sits on paper. Grid and axes are quieter than marks.

---

## Type scale

| Role | Size | Weight | Fill |
| --- | --- | --- | --- |
| Title | `18px` | `600` | `#1C1917` |
| Axis name | `11px` | `500` | `#78716C` |
| Tick / category | `10px` | `400` | `#57534E` |
| Value label | `10px` | `500` | `#1C1917` |
| Legend | `11px` | `400` | `#1C1917` |
| Unit beside title | `12px` | `400` | `#78716C` |

Title stays centered under the top margin. Unit rides the title line as `Title · USD k` (or `(USD)`), never repeated on every tick.

---

## Color (Okabe–Ito, dialed down)

Single series = accent only. Extra hues only for extra series / pie slices. Never rainbow.

| Slot | Hex | Use |
| --- | --- | --- |
| Accent / S1 | `#2B6CB0` | single-series bars, first line, first pie slice |
| S2 | `#C65D2E` | second series |
| S3 | `#2F8F6B` | third |
| S4 | `#B08900` | fourth |
| S5 | `#6B5B95` | fifth |
| S6 | `#8B6B4A` | sixth |
| S7 | `#C44C6A` | seventh |
| S8 | `#4A7C8C` | eighth |
| Slice gap | `#F7F4EF` | pie stroke = paper (not pure white) |

Stop at 8 series. More → reuse S1… with 70% opacity, do not invent new hues.

---

## Grid & axes

- Y grid: horizontal hairlines only, `stroke #E7E5E4`, `stroke-width 1`. No vertical grid.
- Axis path: `stroke #A8A29E`, `stroke-width 1`. Tick marks 4px, same stroke.
- Baseline (y=0) same as axis, not thicker.
- Marks must read louder than axes. If a mark color fails contrast on paper, darken the mark — do not thicken the axis.

---

## Margins (from labels, not fixed leftovers)

Default inset before measuring labels: `top 48`, `right 24`, `bottom 48`, `left 56`.

Then grow:

- **Left** = max(56, y-tick text width + 12 + axis-name gutter 18).
- **Bottom** = max(48, category label extent + 12 + axis-name gutter 16).
  - If category labels rotate −55°, bottom = `sin(55°) × longestLabelWidth + 20`.
- **Top** = title block (title + optional unit + legend row) + 12. Legend sits under title, left-aligned to plot left — not overlapping the plot.
- **Right** = max(24, overhang of value labels or pie leaders).

No clipped ticks. No label–label collision: if category labels would overlap at 0°, rotate −55°; if still overlapping, drop every other label and keep `data-full-label` for a11y. Do not ellipsis mid-word on the drawn label when the full string fits at −55° inside the grown bottom margin (`17` currently truncates — stop that).

---

## Numbers

- Integer ≥ 1000 → thousands separators: `1,200` not `1200`, not `1.2k`, not `200k`.
- Tick formatter: same rule. Prefer full numbers + authored unit over auto-k/M — title `· USD`, ticks `0 / 200,000 / 400,000`, value labels `420,000`. Do not invent `USD k` / divided ticks when the fixture unit is `USD`. Authored units like `USD k` stay as written.
- Value labels on bars: full separated number (`420,000`), unit only in title. Title, ticks, and values share one scale.

---

## Bar

- Category gap: `20%` of band. Bar width fills the rest. Grouped bars: `2px` gap between series in a band.
- Corner: `rx=2` on the top two corners only (bottom flush to baseline). Drop `shape-rendering="crispEdges"` so radius renders.
- Fill: accent (or series color). No stroke on bars.
- Value label: centered on bar, `8px` above the top (or inside near top if bar height < 28). One label per bar. Skip label if bar width < 14.
- Single series: one accent. No legend.

## Line / area

- Stroke `1.75px`, `round` join/cap.
- Points: filled circles `r=2.5`, same series color, no stroke. Skip points when a series has > 40 vertices.
- Area: same hue at `fill-opacity 0.16`, stroke on the top edge only.
- Multi-series: legend under title; colors S1… in order.

## Scatter

- Points `r=3`, series color, `fill-opacity 0.85`, no stroke.
- Optional light hairline axes only (same tokens). No connecting path.

## Hist

- Same as bar tokens (gap, radius, accent). No value labels on bins by default (density reads as area). Bin edges on ticks.

## Pie

- Do **not** normalize to 100. Slice angle ∝ raw value (keep current IR rule).
- Radius: `min(plotW, plotH) × 0.36`. Center in plot (not shifted for a side legend).
- Slice stroke: paper `#F7F4EF`, `1.5px`.
- Labels: **outside** — `name · value` (separated), `10px/500`. Thin leaders: `stroke #A8A29E`, `1px`, from slice mid-angle to label; label sits `12px` beyond leader end. Prefer left/right clusters to avoid overlap; nudge radially, never stack on the pie.
- No side color legend when outside labels are present.
- Keep `data-raw-value` and the desc note that sizes are raw.

---

## A11y & determinism (keep)

- `<title>` + `<desc>` + `role="img"` + `aria-labelledby` / `aria-describedby` (already on gallery).
- `data-markvis`, `data-chart-type`, `data-id`, series/x/y data attrs stay.
- Same IR → same SVG bytes. No random ids that change every render (ids may hash from content; keep stable).
- Paper rect is the first child after title/desc so captures still show background.

---

## Out of scope

- Second theme, dark mode, `theme:` field.
- Animation, tooltips, brush.
- New chart types.
- Marketing chrome in the SVG.

## Done when

Regenerated `examples/out/01-bar-basic.svg`, `02-line-multi.svg`, `05-pie-raw.svg`, `09-bar-twelve-categories.svg`, `17-bar-long-labels.svg` plus `examples/gallery.html` match this file. Vitest snapshots updated in the same unit. GeekPlux has not rejected those five figures.
