# POLISH — live desktop + mobile miss list

Source: live `markvis.js.org` CSS `style.C40F0I6w.css` (+ HTML) on 2026-09-10 after hover wave (`ee780ea` lineage). Screenshots optional under `/workspace/markvis-live-check/`.

Named language stays **Lattice**. Public pages still never name competing tools.

## Already PASS (do not reopen)

| item | evidence |
| --- | --- |
| Home VP chrome hidden | `.folio-home-page .VPNav…{display:none!important}` |
| Mode sun/moon | `.home-nav-mode` 44×44, aria-label |
| Hero not empty desert | `.home-hero-figure` + 3-tile strip present |
| Lattice on field | `.home-lattice` 10px undergrid + 12-col / 72px rules |
| Examples cards | `.gallery-card{background:transparent;border:1px solid var(--site-rule)}` |
| Examples no island | `.gallery-page{background:transparent}` |
| Menu overflow | `.home-nav{overflow:visible}` (prior lock) |
| Hover/draw-in | Play + Examples detail only; reduced-motion tested |

## Observation — still rejects (esp. desktop)

### 1. Hero right is a **tower of paper**

`.home-figure-strip{flex-direction:column;gap:12px}` + each `.home-figure-tile{padding:16px;background:#edebe5}`. Three stacked paper plates beside a `min(520px,46%)` ink panel. Field `min-height:720` + `overflow-y:hidden` — tall strip fights the band; first screen still reads as product-in-a-box, not a single figure.

SITE.md allowed strip **or** live figure; preferred **1×3** or one live fence. Live shipped the tall stack.

### 2. Below-fold **paper islands** (same jolt Examples fixed)

| selector | fill |
| --- | --- |
| `.home-atlas .home-figures figure` | `var(--site-paper)` + pad `16` |
| `.home-figures figure` | `#edebe5` + pad `22` |
| `.home-thumbs figure` | `var(--site-paper)` + pad `8` |
| `.home-figure-tile` (hero) | `#edebe5` |

On dark `--site-page` these cream slabs float like a second app. Examples already moved to hairline cells.

### 3. Feature band density

`.home-band` = 5 cells @ desktop, pad `22` each, `gap:1px` lattice — OK structurally. Copy blocks feel sparse next to paper atlas; not the primary miss.

### 4. Play shell

`.folio-play .VPContent{background:#fff}` — ignores site mode; playground chrome still light-only island when document is `html.dark`.

### 5. Mobile 390 (CSS)

Panel stacks under field; CTAs `48` full width — OK. Strip becomes full-width tower under panel — same paper stack, worse vertical scroll. Menu path previously PASS; reconfirm after polish.

## Judgment

Next polish cut is **surface register + hero figure geometry**, not new sections or seventh theme. Match Examples: page tone + hairline; one clear hero figure band on desktop.

## Instruction — Coder (after this lock; one PR)

### A. Hero figure (desktop `≥900`)

1. Prefer **one** live fence figure in a hairline cell (transparent / `--site-page` register, `1px` `--site-rule`) — SITE option A.
2. If strip must stay: `.home-figure-strip` → **`flex-direction:row`** (`1×3`), `gap:12px`; each tile pad `8–12`, **no** `#edebe5` fill (transparent + hairline). Caption stays `FOLIO FIGURES` / fence title.
3. Field must not clip the figure (`overflow-y` visible or raise `min-height` only if needed). Fail: >40% empty yellow **or** a paper tower taller than the ink panel by >20%.

### B. Below-fold figures (home atlas / strip / thumbs)

Same as Examples § Card surface:

- figure / tile: `background: transparent` (or page), `border: 1px solid var(--site-rule)` where a cell edge is needed
- padding may stay `8–16`; SVG canvas carries the light ground
- Do **not** restore Examples paper cards

### C. Play

- `.folio-play .VPContent` uses `var(--site-page)` (or transparent over page), not hard `#fff`, when under site shell. Chart canvas may stay paper inside the paint host.

### D. Out of scope

- Denser example **data** (Researcher facts first)
- New theme / merge main / npm latest / Show HN
- Renaming public copy with competitor names

## Acceptance

- Desktop `/`: hero right is one band (live figure **or** 1×3 hairline tiles), not three stacked cream cards; ink panel + figure share one eye-height.
- Desktop below-fold: atlas/thumbs not cream islands on ink body.
- `/examples` hairline cards unchanged.
- 390: no horizontal scroll; Menu still opens; hero stack readable.
- `check`+`pages` green.

@Coder implement A→B→C in that order. @Verifier live 1280 + 390 after.
