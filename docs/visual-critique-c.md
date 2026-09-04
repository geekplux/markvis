# visual-critique C — after transparent Ledger `11b6d26`

Method: Ledger autopsy on regenerated SVGs. Measurements from the files. No adjective without a number.

Tip at critique time: `139b050` (STATUS after `11b6d26`). Sources: `examples/out/01-bar-basic.svg`, `02-line-multi.svg`, `05-pie-raw.svg`, `09-bar-twelve-categories.svg`, `17-bar-long-labels.svg`.

---

## 01-bar-basic.svg

1. Frame `720×480`. **No** full-frame fill rect. First paint after `<desc>` is the title — transparent canvas locked.
2. Title `Feb led Q3 at 180` at `(48,24)` start `17px/600` `#171717` + unit tspan `12px/400` `#737373` — conclusion; aligns to plot left `48`.
3. Baseline only: `M48 458 L700 458`, stroke `#171717` `stroke-opacity="0.28"` — no axis box, no vertical spine.
4. No interior y-grid; ticks text-only (no tick stubs into the plot). Dual rule for `n=3`: labels on, grid off.
5. Bars fill `#3B82F6`. Width `192.67−120.67 = 72px`. Top radius ≈ `3px` (Q offset `3`).
6. Value labels `11px/500` `#171717` at `120/180/150`.
7. Plot height `458−36 = 422px` = `87.9%` of frame (≥`55%`).
8. No `#F7F4EF` anywhere in file.
9. First entry: Feb top `y=78.2` + `180` + title — same sentence.
10. Pass vs paper-plate fail: canvas, chrome, soft S1.

## 02-line-multi.svg

1. Transparent canvas. Title `Free still leads pro` at `(48,24)` start `17/600` `#171717`.
2. Horizontal hairlines only: three lines stroke `#171717` `opacity 0.10` at `y=317.33/176.67/36` — ≤3; no vertical grid.
3. Baseline `y=458` structure `opacity 0.28`. No axis box.
4. Series `#3B82F6` / `#F97316`, stroke `1.75`, points `r=2.5`, linear segments.
5. End-labels `free` / `pro` at `x=533.54`, `11px/500`, series colors — no legend.
6. Plot height `458−36 = 422` = `87.9%`.
7. No paper rect.
8. Two-vertex series remains thin (data), not a token miss.
9. First entry: free endpoint + end-label + title.
10. Pass: quiet chrome + soft series tokens.

## 05-pie-raw.svg

1. Transparent. Title `A leads at 40` at `(48,24)` — conclusion.
2. Center `(374,248)`, radius `144.16`. Fills `#3B82F6` / `#F97316` / `#10B981`.
3. Slice stroke `#171717` `opacity 0.28` width `1.5` — structure, not paper.
4. Leaders structure `1px`; labels `11px/500` `A · 40` etc.
5. No side legend. No full-frame fill.
6. Near-tie angles remain type debt, not a canvas fault.
7. First entry: largest slice + title claim.
8. Pass: transparent + structure separators.

## 09-bar-twelve-categories.svg

1. Transparent. Title `Jul peaked at 22` conclusion left-aligned.
2. Three horizontal hairlines `opacity 0.10`; baseline structure; no value labels (`n=12`).
3. Bar width `97.44−52.89 = 44.55px`; fill `#3B82F6`; `rx≈3`.
4. Plot `422/480 = 87.9%`.
5. Categories horizontal at `y=468`.
6. First entry: Jul top `y=148.53` (`data-y=22`) + title.
7. Pass: dual-encoding rule + transparent.

## 17-bar-long-labels.svg

1. Frame `720×604`. Transparent. Title conclusion at `(53.4,24)` + ` · USD`.
2. Plot `y=36..368.54` → `332.54/604 = 55.06%` — meets ≥`55%`.
3. Bar width `197.17−125.17 = 72px`. Fill `#3B82F6`. `rx≈3`.
4. Value labels on; no interior grid (`n=3`). Baseline only.
5. Ticks `0 / 200,000 / 400,000 / 600,000` match label scale.
6. Rotated categories `-55°`; frame grew instead of crushing plot.
7. No `#F7F4EF`.
8. First entry: tallest bar + `420,000` + title.
9. Pass: plot share + transparent + bar cap.

---

## Cross-cutting vs revised Ledger

| Rule | Status |
| --- | --- |
| Transparent canvas (no paper rect) | Pass (all five) |
| Ink `#171717` / Quiet `#737373` | Pass |
| Hairline @0.10 / structure @0.28 | Pass |
| No axis box; baseline only | Pass |
| Horizontal grid ≤3; none on n≤6 bars with labels | Pass |
| S1 `#3B82F6` soft mid-chroma | Pass |
| Bar ≤72 / rx=3 | Pass |
| Conclusion titles left-aligned | Pass |
| End-labels (02) | Pass |
| Plot ≥55% (17) | Pass |

## Judgment

Paper plate is gone. Quiet chrome and soft series tokens land. Spec locks hold on the five.

## Acceptance

**Designer OK** on 01 / 02 / 05 / 09 / 17 + gallery for GeekPlux aesthetic veto (transparent Ledger).

Ugly again = name a measurement. Do not add a theme or restore a paper fill.
