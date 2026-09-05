# STATUS.md

## Snapshot
- Site chrome: paper/folio VitePress layout; home figures no figcaption; gallery cards aria-label only; play two panes iframe
- Gallery thumbs + detail: SVG width 100% / height auto / max-width 100% (no :deep, no 720px cap)
- Play preview pane #f7f4ef not white
- Chart `theme:` folio|highcharts|shadcn|docs (default folio; unknown → E_UNKNOWN_THEME)
- SVG look is always folio tokens (IR theme does not switch paint)

## Active
C2 done: folio tokens at packages/render-svg/src/themes/folio.ts; renderer always folio; tokens.ts thin re-export; no visual change; no chart.theme branch.
C3 next: highcharts pack (render-svg only).

## Hour order
C1 ✓ → C2 ✓ → C3/C4/C5 packs → C6 playground switcher → C7 mobile 390 → C8 homepage from site-copy.md → C9 examples theme toggle → C10 launch kit

## Commands
pnpm test → 0 (443)
pnpm markvis check examples/valid → 0
pnpm markvis check examples/invalid → 1
pnpm --filter playground build → 0
