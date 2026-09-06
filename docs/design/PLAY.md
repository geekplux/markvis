# PLAY — product surface

Tool someone leaves open. Not a debug bar. Charts stay folio (Ledger) by default; do not restyle chart marks for marketing.

## Intent

Shares docs chrome (white), not black slab vs beige. Structure/restraint only (vite.dev / bun.sh / astro.build).

## Delete

- Preview pane forced `#F7F4EF` paper
- Toolbar white slab fighting beige VP
- 25px control heights

## Live faults

Measured 2026-09-06 check:

1. Toolbar desktop 1280×46; mobile 375×133 wraps 3 rows
2. Controls: select 188×19; buttons ~25px high — fail 44px tap
3. Editor `#171717` vs preview `#F7F4EF` — random black slab vs beige
4. Panes 640/640 desktop; mobile single column 375
5. No theme switcher yet (C6)
6. Outer VP nav 52px then embed
7. Mobile source internal overflow OK; outer no horiz scroll

## Target

- **Chrome:** page/nav white (`#fff` / VP default)
- **Layout:** left editor ≥40%, right figure ≥40%, 1px `#E4E4E7` divider
- **Editor bg:** `#FAFAFA` or `#FFFFFF` with zinc border — NOT `#171717` full pane (code can keep dark syntax theme inside editor only if using a code editor widget; otherwise light fence textarea 14px mono)
- **Figure pane bg:** `#FFFFFF`; SVG transparent
- **Toolbar:** ONE horizontal scroll row OR compact menu; height 48; controls min-height 44; gap 8; theme select + example select + Copy fence + Copy SVG + Open gallery
- **Theme control** rewrites fence theme: `folio` | `highcharts` | `shadcn` | `docs` and re-renders
- **390:** stack figure under editor OR tabs; toolbar scroll-x; no wrap mess

## Acceptance

Theme switch works; 390 toolbar not 3-row wrap; no beige/black clash.
