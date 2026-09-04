# visual-critique — current `v2` @ `bb73178` (pre-rewrite)

Method: Ledger autopsy. Measurements from the SVG. No adjective without a number.

Sources: `examples/out/01-bar-basic.svg`, `02-line-multi.svg`, `05-pie-raw.svg`, `09-bar-twelve-categories.svg`, `17-bar-long-labels.svg`.

---

## 01-bar-basic.svg

1. Frame `720×480`. Paper rect `#F7F4EF` full frame. Plot box `x=56..696` (`640px`), `y=48..432` (`384px`) → plot height `384/480 = 80%` of frame.
2. Title at `(360,30)` `text-anchor="middle"` `18px/600` `#1C1917` + unit tspan `12px/400` `#78716C` “· USD k”. Text is “Q3 Revenue” — noun phrase, not a conclusion.
3. Type sizes present: title `18`, axis name `11`, ticks `10`, value labels `10` — four sizes competing.
4. Y-grid: five hairlines `#E7E5E4` `1px` at `y=432,336,240,144,48` including baseline. Axis path also draws `y=432` — baseline double-inked.
5. Axis names: “revenue” rotated at `(12,240)` `11px/500` `#78716C`; “month” at `(376,468)`. Title already carries measure + unit.
6. Bars: three paths fill `#2B6CB0`. Jan width `248−77.33 = 170.67px`. Band ≈ `213.33px`. Gap ≈ `20%`. With `n=3`, bar width `170.67` exceeds Ledger max `72` for `n≤4`.
7. Top radius via quadratic ≈ `2px` — within corner rule.
8. Value labels `120/180/150` at `10px/500` above bars **and** y-ticks `0..200` step `50`. Dual encoding on `n=3`.
9. First reading entry: Feb bar top `y=86.4` + label `180` — entry exists; title does not name Feb.
10. Single series `#2B6CB0` survives grayscale by value. Failure is hierarchy/title/geometry, not hue.
11. Title centered on frame (`x=360`); plot left is `56` — two alignment axes.
12. Sentence sent home: “there is a blue bar chart of revenue.” Ledger wants: “Feb led Q3 at 180.”

## 02-line-multi.svg

1. Frame `720×480`. Paper `#F7F4EF`. Plot `x=56..696`, `y=72..432` (`360px` tall → `75%` of frame).
2. Title “Users” at `(360,30)` centered `18px/600` — bare noun, not a conclusion.
3. Legend: two `10×10` swatches at `y=43` (`#2B6CB0`, `#C65D2E`) + labels “free”/“pro” `11px` — color legend instead of end-labels on a 2-vertex series.
4. Series strokes `#2B6CB0` / `#C65D2E`, `stroke-width=1.75`, points `r=2.5` — line grades OK.
5. X has two categories: `Jan` at `216`, `Feb` at `536`. Paths are single segments (`M216…L536…`).
6. Y-ticks `0/20/40/60`; four gridlines including baseline under the axis — same double baseline as 01.
7. Axis names “count” + “month” repeat fields already covered by title/legend.
8. No value at endpoints. Verification requires estimating against the grid.
9. First entry: free line to Feb `y=102` — entry exists; sentence missing (“free still leads pro”).
10. Two hues differ in value; grayscale OK. Failure is legend + title + missing end numbers.
11. Hierarchy: title `18`, legend `11`, ticks `10`, axis `11` — legend weight equals axis name.
12. Data marks: `4` circles + `2` segments on `720×480`. Whitespace is vacancy around a thin sparkline, not a deliberate crop.

## 05-pie-raw.svg

1. Frame `720×480`. Paper `#F7F4EF`. Pie center `(376,240)`, radius `138.24` ≈ `0.36× min(640,432)`.
2. Title “Share” `18px/600` centered — chart-type adjacent word.
3. Slices `#2B6CB0` / `#C65D2E` / `#2F8F6B`, stroke paper `1.5px`, raw values `40/35/30` (not normalized).
4. Leaders `#A8A29E` `1px` with outside labels `A · 40` etc at `10px/500` — label rule directionally right.
5. Angles: `40/105`, `35/105`, `30/105` of circle — near-ties; position/length would beat angle (type debt, not a skin fix).
6. First entry: largest blue slice — title gives no claim, so entry is “a pie.”
7. No side legend (good). Leaders present (good).
8. Hierarchy: title + label only — two levels. Better count than 01; still zero conclusion.
9. Three fills must separate by value in grayscale; near-equal slices remain risky.
10. Empty paper left/right of pie: one object centered on the canvas.
11. Label format `name · raw` is fine; title should absorb what “Share” pretends to mean.
12. Sentence today: “three parts of a whole.” Ledger wants: “A leads at 40.”

## 09-bar-twelve-categories.svg

1. Frame `720×480`. Plot `y=48..432` (`384px`, `80%`). Twelve bars, fill `#2B6CB0`, top radius ~`2px`.
2. Bar width `104−61.33 = 42.67px`, band ≈ `53.33px`, gap ≈ `20%` — acceptable for `n=12`.
3. Title “Monthly tickets” centered — noun phrase, not conclusion (e.g. Jul peak).
4. Value labels on all twelve bars (`9`–`22`) at `10px/500` **plus** y-ticks `0/10/20/30` **plus** twelve category labels — three number layers.
5. Dual encoding: grid + every value label on `n=12`. Ledger: for `n>8`, drop value labels; keep ticks/grid.
6. Category labels horizontal at `y=448`, `10px` — short months fit; no rotation (good).
7. Axis names “tickets” / “month” redundant with title.
8. First entry: Jul bar top `y=150.4`, value `22` — readable; title does not say it.
9. Baseline double-inked (grid at `432` + axis).
10. Hierarchy levels ≥4 (title, axis, tick, value).
11. Single series grayscale OK.
12. Twelve value labels are ornament once ticks exist — canvas filled because empty felt scary.

## 17-bar-long-labels.svg

1. Frame `720×480`. Axis baseline `y=220.54`. Plot top `y=48`. Plot height `220.54−48 = 172.54px` ≈ `36%` of frame — fails Ledger ≥`55%` data-region lock.
2. Title “Initiative spend · USD” centered — noun + unit, not a conclusion.
3. Y-ticks `0 / 200,000 / 400,000 / 600,000` with thousands separators; bar labels `420,000` / `185,000` / `95,000` — **one scale** (good; prior fault closed).
4. Left edge `x=73.4` for wide ticks — margin-from-label OK.
5. Category labels full strings, rotate `-55°` at `y=230.54` — no ellipsis (good); label block spans roughly `y=230..468`, larger than the plot.
6. Three bars heights ≈ `118.78` / `51.2` / `25.32` px. Shortest (`95,000`) value label at `y=205.22` sits near the baseline.
7. Bar widths `260.18−94.15 = 166.03px` on `n=3` — exceeds `72px` cap.
8. Axis name “spend” + title unit “USD” + full tick numbers — quiet ink repeated three ways.
9. First entry should be North America `420,000`; geometrically the plot is a thin ribbon over rotated text — entry is the labels, not the mark.
10. Axis title “initiative” at `y=468` under the text heap — vacancy under labels, crushed plot above.
11. Grayscale OK. Geometry fails Ledger harder than color.
12. Sentence today: “long labels with some blue.” Ledger wants: “North America leads spend at 420,000.”

---

## Cross-cutting judgments

| Rule | Status |
| --- | --- |
| Paper / ink / accent tokens | Present |
| One scale on 17 | Fixed |
| Title = conclusion | Failed on all five |
| Plot ≥55% height | Failed on 17 |
| Dual encoding | Failed on 01, 09 |
| Fat bars n≤4 | Failed on 01, 17 |
| End-label > legend | Failed on 02 |
| No chart-type title | Failed on 05 (“Share”) |
| Left-align title to plot | Failed (all centered) |

This is still a homework default with nicer hex. Tokens without editorial hierarchy.

## Acceptance for next renderer pass

Good = five files re-autopsied with: conclusion titles (fixture sources), `plotH/frameH ≥ 0.55`, no value+grid dual on `n≤6` without dropping one, bar width ≤`72` when `n≤4`, line end-labels, no “Share”/chart-type titles, title left-aligned to plot left.

Ugly = another palette swap, a second theme, or crushing the plot again for labels.
