# THEMES — grammar matrix (not palettes)

A theme is a **grammar**: mark form, axes, legend policy, typeface, plot chrome, padding. Hex is one column, never the whole theme.

Site `light`|`dark` (`SITE.md` §G) is unrelated. Fence `theme=` picks a pack under `packages/themes/*`.

Pass rule (PM): a stranger viewing a **B&W print** of `01-bar-basic` + `02-line-multi` can name the theme. If they only see “same chart, darker ink,” the pack fails.

Measured tip: `7b3ffb3` (tokens + baked SVGs).

## Observation — live packs today

| axis | folio | highcharts | shadcn | docs | ant |
| --- | --- | --- | --- | --- | --- |
| canvas | `720×480` | `720×440` | `720×460` | `720×480` | `720×420` |
| face | system UI | Arial | Inter | Inter | system / Helvetica |
| title | `17/600` | `16/600` | `16/600` | `15/600` | `18/600` |
| tick | `10` | `11` | `11` | `10` | `11` |
| bar `RX` | `3` | `0` | `6` | `0` | `2` |
| bar max W | `72` | `64` | `68` | `64` | `56` |
| line stroke / r | `1.75` / `2.5` | `2` / `3.5` | `2` / `3.5` | `1.5` / `2` | `2` / `3` |
| multi series | **end-labels** (≤4) | **color legend** | **color legend** | **end-labels** (folio) | **color legend** |
| plot frame | none | `#ffffff`+`#ccd6eb` | `#ffffff`+`#e5e5e5` | none | `#ffffff`+`#d9d9d9` |
| axis titles | no | yes | no | no | yes |
| grid max | `3` @ `0.10` | `5` @ `0.22` | `2` @ `0.06` | `3` @ `0.06` | `4` @ `0.16` |
| margins T/R/B/L | `36/20/26/48` | `36/20/36/56` | `36/20/28/48` | `28/16/22/40` | `28/14/28/48` |
| gap few | `0.28` | `0.22` | `0.32` | `0.30` | `0.24` |

**Judgment:** folio / highcharts / shadcn / ant already differ on mark + chrome + legend. **docs** is the weak twin of folio (same end-labels, no frame, same height — only quieter zinc + thinner stroke). Pie / scatter / hist barely fork across packs — that is why switching themes on Examples still feels like a tint.

## Steal / don’t

| id | steal | don’t |
| --- | --- | --- |
| folio | editorial open figure, value labels on bars, end-labels for few series | plot box; demo-tool chrome |
| highcharts | white plot, blue-gray border, axis titles, denser grid, square bars, legend ≥2, fat markers | HC logo, credits spam, stacked-percent types, runtime |
| shadcn | card radius language (`BAR_RX:6`), quiet grid, Inter, soft `#e5e5e5` frame, legend ≥2 | axis field titles; loud HC border |
| docs | zinc/slate ink, thin `1.5` stroke, tight margins, sharp `RX:0`, muted palette | card frame; saturated categorical; looking like folio with gray bars |
| ant | annotation title (`18`), tight canvas, teal/brick, technical axis titles, `#d9d9d9` frame | G2 runtime; copying HC border hex |
| recharts *(target)* | default Cartesian grid, legend **bottom**, stroke `2`, reserved tooltip gutter in **browser only** | `recharts` npm; looking like shadcn or HC |

## Instruction — required grammar (Coder rework)

Every pack must keep the locked **signature** below. Palette may change only inside its signature. Unknown → `E_UNKNOWN_THEME`.

### folio — open editorial

1. No plot bg/border.
2. Multi-series line/area: **end-labels**, not legend (`END_LABEL_SERIES_MAX ≥ 2`).
3. Soft bar tops `BAR_RX: 3`. Value labels on bars when room.
4. Tallest default canvas (`480`). System UI face.
5. B&W tell: open sheet + labels at line ends.

### highcharts — boxed instrument

1. Plot `#ffffff` + border `#ccd6eb` (or equivalent cool gray-blue — not `#e5e5e5` / `#d9d9d9`).
2. `AXIS_TITLES: true`. `BAR_RX: 0`. `LINE_POINT_R ≥ 3.5`. Grid denser than others (`MAX_INTERIOR_GRID ≥ 5` or hairline ≥ `0.20`).
3. Multi-series: **legend only**.
4. Arial stack.
5. B&W tell: hard plot rectangle + axis title words + square bars.

### shadcn — soft card

1. `BAR_RX ≥ 6`. Plot border soft neutral (`#e5e5e5` class), **no** axis titles.
2. Quietest grid (`MAX_INTERIOR_GRID ≤ 2`, hairline ≤ `0.08`).
3. Inter. Widest bar gaps (`BAR_GAP_FEW ≥ 0.30`).
4. Multi-series: legend.
5. B&W tell: chunky rounded bars + soft thin frame + sparse grid.

### docs — page figure (must leave folio)

**Rework priority #1.** Today fails B&W vs folio.

1. Keep sharp `BAR_RX: 0`, thin stroke `1.5`, tick `10`, title `15`, muted zinc palette.
2. **Change form:** multi-series → **legend under plot** (not end-labels). `END_LABEL_SERIES_MAX: 0`.
3. **Change chrome:** no full HC box; instead a **baseline-only** emphasis OR a hairline top rule under the title (not a four-sided plot rect). Pick one and keep it unique vs folio’s fully open sheet.
4. Margins stay tighter than folio (`left ≤ 40`, `top ≤ 28`).
5. Optional: omit bar value labels by default (`BAR_LABEL_N_ON` higher threshold) so docs figures stay quieter than folio.
6. B&W tell: small title + crisp thin bars + bottom legend + tight inset — never end-labels.

### ant — annotation technical

1. Title `18/600`, `TITLE_TO_PLOT ≥ 20`, canvas `420` tall.
2. Axis titles on. Plot border `#d9d9d9` class (warmer/neutral than HC).
3. Narrower bars (`BAR_MAX_WIDTH ≤ 56`). Teal/brick first two hues.
4. Multi-series: legend.
5. B&W tell: big title air + short frame + narrow columns.

### recharts — target slot (ship after reworks)

Do not land until docs (and any weak twin) pass B&W.

1. **Cartesian grid:** light full grid (vertical + horizontal), not hairline-only horizontals — must read different from HC denser horiz and shadcn sparse.
2. Legend **below** plot (centered or start), even for 1 series when demo-like.
3. Stroke `2`, markers `r=3`, `BAR_RX: 0`, no axis titles (labels on ticks only).
4. Plot bg transparent or very light; border optional `#e2e8f0` — must not equal HC `#ccd6eb` or ant `#d9d9d9`.
5. Face: system UI (not Inter-only, not Arial-only).
6. Browser-only later: tooltip gutter; bake stays static.
7. B&W tell: visible XY grid + legend under the chart.

## Shared painter work (all themes)

These make theme switches feel like color-only today — fix in the same unit as docs rework:

1. **Pie / hist / scatter:** fork at least two of: label style (leaders vs inside), stroke, radius ratio, or legend policy per theme — do not share one pie silhouette across all ids.
2. Examples/Play theme chip: switching theme must swap the **baked SVG** for that theme stem (already required); spot-check live after Pages green.
3. Verifier: assert B&W skeletons (strip fills) differ on ≥3 of: legend|end-label, plot-frame, bar-rx, axis-titles, viewBox height, title font-size, grid line count — not palette alone.

## Acceptance

- Matrix above is the lock. Coder reworks **docs** first, then any pack that fails B&W naming, then **recharts**.
- GeekPlux can open Examples, flip themes, and see form/type/chrome change — not only fill hex.
- No new chart types. No vendor runtimes.

@Coder start with docs. @Verifier add B&W skeleton asserts after docs lands. @PM keep `recharts` paused until docs PASS.
