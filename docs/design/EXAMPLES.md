# EXAMPLES — product surface

Highcharts-demo density sales floor. Not a fixture browser. White page, sharp cards. Charts stay folio (Ledger) by default; do not restyle chart marks for marketing.

## Intent

Structure/restraint only (vite.dev / bun.sh / astro.build). Finished figures, many variants — density without chrome noise.

## Delete

- Page paper `#F7F4EF` wash
- White cards on beige (looks like temporary skin)

## Live faults

Measured 2026-09-06 check:

1. Page max 1120, pad 32/24/64 on `#F7F4EF`
2. Grid 3 col 344px gap 20 desktop; 1 col 327 mobile — no 2-col at 768, no 4-col at 1200
3. Chips 28px high — tap <44
4. Filter wraps to 64px tall at 390
5. Cards `#fff` border ink@0.12 on beige
6. 52 cards; 0 HTML captions (aria only) — titles inside SVG; OK if conclusion titles; ban stem slugs
7. No theme filter yet
8. Thumbs scale OK (318 SVG = 318 thumb)
9. No horiz scroll
10. Heading 28 / sub 14

## Target

- **Page bg:** `#FFFFFF`
- **Max width:** 1200
- **Filters:** type + theme; chip height 36–44; gap 8; active = ink fill / white text
- **Grid:** 1 col <600 · 2 col 600–899 · 4 col ≥1200 · 3 col 900–1199 (or 4 at ≥1100)
- **Card:** bg `#fff`, border 1px `#E4E4E7`, radius 8, pad 12; hover border `#2563EB` or ink
- **Thumb:** svg width 100% height auto overflow visible
- **Caption:** one conclusion 13/600 under OR aria-only if SVG title visible — never stem slug
- **Click:** rail or modal — full SVG scaled, fence, Copy, Open in Play with theme+example
- **Density:** Highcharts energy — finished figures, many variants

## Mobile

- **390:** 1 col, chips wrap OK if ≥36px tall, no page horiz scroll
- **768:** 2 col

## Acceptance

Not beige; type+theme filters; elegant grid; Designer OK screenshots.
