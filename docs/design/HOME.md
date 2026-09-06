# HOME — product surface

Structure/restraint only (vite.dev / bun.sh / astro.build). Figures are the hero. Charts stay folio (Ledger); do not restyle chart marks for marketing.

## Intent (closed)

HN-screenshot home. Figures are the hero. White/near-white product surface — not a VitePress starter, not magazine paper wash.

## Delete from beige experiment

- Remove `--folio-paper` / `#F7F4EF` full-page wash from site chrome
- Remove `.folio-home` paper styling that paints whole `VPContent` beige
- Keep chart SVGs transparent / folio

## Live faults (desktop + 390)

Measured 2026-09-06 check:

1. Content max-width 720px centered on 1280 — skinny column in empty field
2. Desktop lede 576×23; mobile wraps 327×46
3. Buttons 36px high (need ≥44px tap) — mobile still one row 112+102 with 12px gap
4. Figures 213×142 desktop / stack mobile 327×218; caption count 0 (SVG title only — OK if intentional; if HTML caption returns, one only)
5. Fence block bg `#EFEBE4` (beige remnant)
6. Nav 52px VP shell + custom folio
7. No what/who/start sections — skeleton only
8. Mobile figure stack pushes fence to y≈1034
9. `scrollWidth=clientWidth` (no horiz overflow) — keep
10. Wordmark 28px vs nav 15px — OK hierarchy if product home, not docs

## Target layout

- **Max content width home:** 960–1040px (not 720)
- **Page bg:** `#FFFFFF` (or VP `--vp-c-bg` default)
- **Ink** `#171717`, **quiet** `#64748B`, **ONE accent** `#2563EB` (links/primary only)
- **Hero:** wordmark 32/600, lede 18/400 max 40rem, buttons height 44, radius 6, gap 12; at 390: full-width stack OR clean 2-up full width
- **Sections in order** (Writer owns words): What (3 bullets) · Who (3 cards) · Proof (3 figures) · Start · Use it table · Themes one-liner · Footer
- **Proof figures:** max 3 across ≥900px; stack 390; width 100% height auto; ONE caption 13/500 quiet if used — never duplicate SVG title as H2
- **Fence:** `#F4F4F5` border zinc, not `#EFEBE4` paper
- **Spacing:** section gap 48–64 desktop, 32 mobile; side pad 24

## Mobile 390 / 768

- No horizontal scroll
- Buttons ≥44px
- Figures stack; fence `overflow-x: auto` inside `pre`

## Acceptance

Incognito / not beige stub; sections visible; 390 no overflow; Designer screenshots OK.
