# SITE — Lattice

Named language: **Lattice**. One accent field. Hard geometry. Visible construction grid. Type too big on purpose. Almost no shadow. Charts stay theme grammars (folio default on marketing figures). Do not restyle chart marks to match the field.

Public pages never name competing diagram tools. Do not write “premium / modern / clean.”

Supersedes the empty-right hero in live `/`. Keeps Field tokens from `HOME.md`. Adds lattice, hero figure, motion, and docs family rules in one place. Page-specific paint still lives in `HOME.md` / `EXAMPLES.md` / `DOCS.md` / `PLAY.md` when they disagree on local slots; this file wins on lattice, hero right, animation, and the accordion ban.

References (structure only — never copy assets, wordmarks, or product names into UI):

- motion.dev — field + inset panel + two CTAs + hairline feature row
- zed.dev — construction grid energy, product in the hero, italic/display line
- vite.dev — section rules, measured gaps, logo/grid bands

## Observation — live refs (1280 CSS, 2026-09-10)

Measured with the tab open. Steal structure, not assets.

| surface | measured |
| --- | --- |
| motion.dev field | `#FFDB2A`, 1280×720. Panel `#080B08` ~520×510 at x56. **Right of panel is empty yellow** (~696px). No construction grid on the field — only control borders. |
| zed.dev | Page ~`#F5F5F3`. Construction energy: ~10px undergrid at ~4% stroke; side tick tracks ~32px with 1px marks; hairlines ~`#DADDE2`. Hero holds product, not a void. |
| vite.dev | Dark `#16171D`, rules `#3B3440`. Hero splits ~623 / 543 with a **visual canvas on the right** (x675, ~543×532). Section rules with measured spacers (~74–93px). |
| markvis.js.org `/` | Field `#FFDB2A` under 72px nav, 1265×720. Panel `#080B08` 520×~567 at x64. **Empty yellow x584→1265 (~681px)** — the desert START rejects. |
| markvis.js.org `/examples` | 4-col grid, cards ~276×193 paper. Click opens `?id=`; siblings shrink to ~157×113 while an in-flow detail steals width. Banned in `EXAMPLES.md`. |

Takeaway: keep Motion’s field + ink panel + CTA rhythm. Fill the right like a product-in-hero page (canvas / figure), not like Motion’s empty field. Lattice opacity stays quiet (field rules `rgba(8,11,8,0.14)` ≈ the faint undergrid energy).

## Tokens (locked)

| role | value |
| --- | --- |
| field | `#FFDB2A` |
| ink | `#080B08` |
| body ink | `#0E1312` |
| cell | `#0E130F` |
| paper | `#EDEBE5` |
| muted | `#979D97` |
| footer | `#F8F8F6` |
| rule on field | `rgba(8,11,8,0.14)` |
| rule on ink | `rgba(237,235,229,0.16)` |
| rule strong | `rgba(8,11,8,0.28)` |
| radius | `0` |
| shadow | none (hover may use `translateY(-1px)` only) |
| accent blue | none on marketing chrome |

Mono: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. Display / body: system UI sans unless a face is already shipped.

## A. Lattice

The yellow field is a surface with structure, not a PNG fill.

1. On the home field (`min-height: 720px`), draw a **construction grid**:
   - Optional quiet undergrid: `10px` pitch, stroke `rgba(8,11,8,0.06)` (construction energy, not a screenshot of another site).
   - Vertical columns: `12` tracks across the content inset `clamp(24px, 5vw, 68px)`.
   - Column gutters: hairlines `1px` in `rgba(8,11,8,0.14)`.
   - Horizontal rules every `72px` from the top of the field (same stroke).
   - Grid sits **behind** the ink panel and the hero figure; `pointer-events: none`.
2. Below the fold (dark body `#0E1312`): section bands separated by full-bleed hairlines `1px` `rgba(237,235,229,0.16)`. Feature row uses `gap: 1px` on a rule-colored background so cells read as a lattice, not floating cards.
3. Examples and docs pages: same dark body + hairline section rules. Card grids use `gap: 16px` but the **page** still shows left/right inset rules aligning to the home content edge.
4. Lattice must not jitter on hover or load. Animate opacity/transform of content only, never the grid lines’ positions.

## B. Hero

Desktop first screen (`>=900px`):

1. Field full-bleed `#FFDB2A`, nav on field, height `72px` (see `HOME.md` nav).
2. **Left:** ink panel `#080B08`, width `min(520px, 46%)`, padding `48px`, radius `0`, vertically centered. Meta, two-voice headline (`markvis.` `#FFDB2A` + paper line), CTAs with trailing `>`, chips — as `HOME.md`.
3. **Right:** not empty yellow (live `/` measured ~681px void; Motion also leaves this empty — we do not). Prefer one of these, in order:
   - **A (preferred):** a live playground fragment (one bar or line fence rendered), paper cell `#EDEBE5`, padding `16px`, radius `0`, width `min(520px, 42%)`, vertically centered. Caption under it `11px` mono uppercase muted on the field: `LIVE FIGURE` or the fence title.
   - **B (if live fragment is blocked):** a **3-tile strip** of uncropped folio SVGs in paper cells, stacked or `1×3` with `gap: 12px`, same vertical center. One caption for the strip.
4. Panel and figure share one horizontal band inside the field padding. Space between them `clamp(24px, 4vw, 48px)`.
5. Fail condition: first screen at `1440` with more than ~40% contiguous empty field to the right of the panel.

390:

- Panel almost full width: `calc(100% - 32px)`.
- CTAs stacked, height `48px`.
- Live figure / strip **under** the panel, full content width, not beside it.
- Lattice may drop to 4 columns + fewer horizontal rules. No horizontal scroll.

## C. Motion (animation)

CSS / WAAPI only. No Lottie. Honor `prefers-reduced-motion: reduce` → all durations `0`, no transforms beyond static layout.

| element | motion | duration / easing |
| --- | --- | --- |
| home panel | fade + `translateY(8px → 0)` | `280ms` `cubic-bezier(0.22, 1, 0.36, 1)` |
| hero figure / strip | fade + `translateY(8px → 0)`, delay `80ms` | `320ms` same ease |
| feature cells | stagger fade-in `40ms` each, max 5 | `240ms` |
| CTA hover | invert fill/text (field ↔ ink) | `120ms` |
| chip hover | border → paper 56% | `120ms` |
| feature cell hover | `translateY(-1px)` only | `120ms` |
| examples card hover | `translateY(-1px)` + hairline to paper | `120ms` |
| examples drawer | slide from right `100% → 0` | `240ms` same ease |
| lattice | **never** moves | — |

Do not animate layout widths of sibling cards.

## D. Type

| slot | size / weight | color |
| --- | --- | --- |
| display (hero / section h1) | `44px/700`, tracking `-0.04em`, lh `1.05` | paper on ink; name voice field yellow |
| display floor @390 | `36px/700` | same voices |
| feature title | `11px` mono uppercase, tracking `0.12em`, weight `560` | `#FFDB2A` |
| feature body | `13px/400`, max `22ch` (desktop cell); full sentence, no clip at `200px` width | muted |
| nav / chip / CTA | `11px` mono uppercase, tracking `0.12em` | per control |
| docs h1 | `44px/700` paper | |
| docs body | `15–16px/400` paper, muted for secondary | |

Writer owns feature-band sentences and example titles. Five feature cells minimum, readable at `1440` and stacked at `390`.

## E. Mobile 390

- No horizontal page scroll: `scrollWidth === clientWidth` at `390` and `430`.
- Nav collapses center links at `max-width: 768px` (not `390`). Menu `44px`. Playground stays in bar. See `HOME.md` mobile nav.
- Panel, CTAs, figure stack as in §B.
- Feature lattice: one column, `gap: 1px` retained.
- Tap targets `>= 44px`.

## F. Docs pages

`/spec`, `/integrate`, `/ai`, `/themes` (and VitePress article chrome):

- Yellow nav, dark body `#0E1312`, light footer `#F8F8F6`.
- Fat h1 `44px/700` paper.
- Hairline rules between sections (`1px` ink-rule).
- Code blocks cell `#0E130F`, radius `0`.
- No blue accent. Tokens match this file.
- Play keeps paper figure pane per `PLAY.md`.

## Instruction — Coder (site chrome)

1. Custom homepage layout only. Default VitePress hero is a fail.
2. Implement lattice + hero right + motion from this file; keep Field copy slots from `HOME.md`.
3. Delete empty-right desert. If playground fragment is not ready in the same unit, ship the 3-tile folio strip first.
4. Do not merge to `main`. Work on `v2` only.

## Acceptance — site

- `markvis.js.org` first screen: structure on the right (live figure or 3-tile), lattice visible on the field, panel motion on load, CTA/chip/feature hover motion.
- `390` and `1440`: no overflow; hero right not empty on desktop.
- `prefers-reduced-motion`: animations off.
- Charts in atlas/examples stay theme-painted; marketing lattice does not recolor marks.

## G. Site mode — `light` | `dark` (not chart theme)

Architect lock: site mode ≠ fence `theme=` (folio|highcharts|…). Mode is `apps/web` chrome only.

### Observation — live fail

- Marketing pages force body ink `#0E1312`. Examples paints its own `#0E1312` island (`.gallery-page` / `.folio-examples`) so it never follows a light surface.
- There is no `light` document class. User asked for both modes.
- Mobile Menu uses a checkbox + absolute link panel; nav sets `overflow-x: hidden`, which clips the open panel — click looks dead.

### Judgment

One shared token surface for `/`, `/examples`, `/play`, docs. Yellow field stays the brand hero in both modes. Body and cards flip paper ↔ ink. Chart SVGs keep their theme grammar.

### Tokens

| role | `dark` (default) | `light` |
| --- | --- | --- |
| page / body | `#0E1312` | `#F8F8F6` |
| field (hero + nav) | `#FFDB2A` | `#FFDB2A` |
| ink (panel, wordmark on field) | `#080B08` | `#080B08` |
| paper (cards, figure cells) | `#EDEBE5` | `#FFFFFF` |
| muted | `#979D97` | `#737373` |
| cell / band | `#0E130F` | `#EDEBE5` |
| footer | `#F8F8F6` | `#EDEBE5` |
| rule on ink body | `rgba(237,235,229,0.16)` | `rgba(8,11,8,0.12)` |
| examples card | **none** (transparent + hairline) | **none** (transparent + hairline) |
| drawer / sheet | paper | paper |

Document: `html.dark` | `html.light`. System preference on first visit; toggle in nav; persist `localStorage` key `markvis-site-mode`.

### Instruction — Coder

1. Replace hard-coded `#0e1312` page fills with `var(--site-page)`. Examples / gallery / family / docs share it — **no island bg** on `/examples`.
1b. Examples cards: transparent fill + `var(--site-rule)` hairline — **not** `--site-paper` slabs. Drawer may stay paper. See `EXAMPLES.md` § Card surface.
2. Hero field + lattice stay field yellow in both modes. Ink panel stays ink. Below-fold bands use `--site-page` and `--site-cell`.
3. Nav: Mode control is an **icon button**, not word labels `Light`/`Dark`.
   - Hit target `44×44`. Radius `0`. On the field: ink glyph, transparent fill, `1px` ink at 28% border optional.
   - Glyph: sun when current mode is `dark` (action = switch to light); moon when current is `light`. Inline SVG, `18×18`, stroke `1.75`, no fill soup.
   - `aria-label`: `Switch to light mode` / `Switch to dark mode` (visible text optional via sr-only only).
   - Place between Menu and Playground on mobile; end of link cluster / before Playground on desktop.
4. Mobile Menu bug: open panel must be visible. Do not clip it with nav `overflow-x: hidden`. Prefer `overflow: visible` on `.home-nav` / `.family-nav`, clip the page shell instead. Checkbox/button must toggle at `390`. Acceptance: tap Menu → links visible and tappable; tap again → closed.
5. Do not put light/dark into `packages/themes/*`.

### Acceptance

- Toggle flips `/` and `/examples` together; examples is not a darker box on a light site.
- `390` Menu opens a usable link list.
- Fence `theme=shadcn` still paints shadcn grammar in both site modes.

