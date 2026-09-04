# visual-critique B — after Unit B `1479af9`

Method: Ledger autopsy on regenerated SVGs. Measurements from the files. No adjective without a number.

Sources: `examples/out/01-bar-basic.svg`, `02-line-multi.svg`, `05-pie-raw.svg`, `09-bar-twelve-categories.svg`, `17-bar-long-labels.svg`. Gallery embeds the same bytes.

---

## 01-bar-basic.svg

1. Frame `720×480`. Paper `#F7F4EF`. Plot `y=36..454` → height `418px` = `87.1%` of frame (≥`55%`).
2. Title `Feb led Q3 at 180` at `(48,24)` `text-anchor="start"` `17px/600` + unit tspan `12px/400` `#78716C` — conclusion; left-aligned to plot left `48`.
3. No axis-name layer. Hierarchy: title `17` / value `11` / tick `10` — three grades.
4. No interior y-grid. Axis path alone owns baseline `y=454`. Ticks `0..200` step `50` remain.
5. Bars fill `#2B6CB0`. Width `192.67−120.67 = 72px` on `n=3` (cap hit; centered in band).
6. Top radius ≈ `2px` via quadratic.
7. Value labels `120/180/150` at `11px/500` — on; dual-encoding rule for `n≤6` met (labels on, interior grid off).
8. First entry: Feb top `y=77.8` + `180` + title claim — same sentence.
9. Grayscale: single series OK.
10. Pass vs prior fail: title, align, bar width, chrome, dual rule.

## 02-line-multi.svg

1. Frame `720×480`. Plot `y=36..454` → `418px` = `87.1%`.
2. Title `Free still leads pro` at `(48,24)` start `17px/600` — conclusion.
3. No color legend. End-labels `free` / `pro` at last points `x=533.54`, `11px/500`, series fills `#2B6CB0` / `#C65D2E`.
4. Strokes `1.75`, points `r=2.5` — data grade OK.
5. Interior grid: three hairlines at `y=314.67/175.33/36` (ticks `20/40/60`); baseline not double-inked.
6. No axis names.
7. Right edge `684.72` leaves room for end-labels.
8. First entry: free endpoint `y=70.83` + end-label + title — claim holds.
9. Two-vertex series remains thin geometrically (data shape); not a token fault.
10. Pass vs prior fail: title, end-labels over legend, chrome.

## 05-pie-raw.svg

1. Frame `720×480`. Paper `#F7F4EF`.
2. Title `A leads at 40` at `(48,24)` start `17px/600` — conclusion; not “Share”.
3. Center `(374,248)`, radius `144.16`. Plot left≈`48` → horizontal mid `(48+700)/2≈374` — center in plot box.
4. Slices `#2B6CB0` / `#C65D2E` / `#2F8F6B`, stroke paper `1.5`, raw `40/35/30`.
5. Leaders `#A8A29E` `1px`; labels `A · 40` etc at `11px/500`.
6. No side legend.
7. First entry: largest slice + title claim align.
8. Near-ties still angle-encoded (type debt); not a Ledger token break.
9. Hierarchy: title + label — two levels.
10. Pass vs prior fail: title, type grades on labels.

## 09-bar-twelve-categories.svg

1. Frame `720×480`. Plot `418/480 = 87.1%`.
2. Title `Jul peaked at 22` at `(48,24)` start `17px/600` — conclusion.
3. Interior grid three hairlines; baseline axis-only.
4. **No value labels** on `n=12` — dual rule for `n>8` met.
5. Bar width `97.44−52.89 = 44.55px`; gap ≈ `18%` band class for `n>6`.
6. Category labels horizontal at `y=468`, `10px` — no rotation.
7. No axis names.
8. First entry: Jul top `y=147.47` (`data-y=22`) + title.
9. Single series `#2B6CB0` grayscale OK.
10. Pass vs prior fail: title, value-label noise removed, chrome.

## 17-bar-long-labels.svg

1. Frame `720×604` (height grown; prior was `480`). Plot `y=36..368.54` → `332.54px` / `604` = **`55.06%`** — meets ≥`55%`.
2. Title `North America leads spend at 420,000` at `(53.4,24)` start `17px/600` + ` · USD` — conclusion; aligns to plot left `53.4`.
3. Bar width `197.17−125.17 = 72px` on `n=3`.
4. Value labels on; no interior y-grid (`n=3≤6`).
5. Ticks `0 / 200,000 / 400,000 / 600,000` and labels `420,000` / `185,000` / `95,000` — one scale.
6. Category labels full strings, rotate `-55°` at `y=376.54` — no ellipsis; frame grew instead of crushing plot.
7. No axis names.
8. First entry: tallest bar + `420,000` + title — same sentence; mark region no longer a thin ribbon over labels alone.
9. Grayscale OK.
10. Pass vs prior fail: plot share, bar cap, title, height growth.

---

## Cross-cutting vs Unit A acceptance

| Rule | Status |
| --- | --- |
| Title = conclusion | Pass (all five) |
| Title left-aligned to plot | Pass |
| Plot ≥55% height | Pass (17 at `55.06%`) |
| Dual encoding rule | Pass (01/17 labels+no interior grid; 09 no labels+grid) |
| Bar width ≤72 when n≤4 | Pass (`72` on 01 and 17) |
| End-label > legend (≤4 series) | Pass (02) |
| No chart-type title | Pass (05) |
| No theme / paper tokens | Pass (`#F7F4EF`, S1–S3) |
| Gallery matches out | Pass (same titles/ids embedded) |

## Judgment

Prior pass was homework default with nicer hex. This pass closes the measured Ledger breaks. Residual: 02 is still a two-point line (data), 05 near-tie pie (type). Neither is a token/spec miss.

## Acceptance

**Designer OK** on 01 / 02 / 05 / 09 / 17 + gallery for GeekPlux aesthetic veto.

Ugly again = reject the language world, or name a new measurement. Do not add a theme.
