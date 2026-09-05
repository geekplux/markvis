# STATUS.md

## Snapshot
- Site chrome: paper/folio VitePress layout; home figures no figcaption; gallery cards aria-label only; play two panes iframe
- Gallery thumbs + detail: SVG width 100% / height auto / max-width 100% (no :deep, no 720px cap)
- Play preview pane #f7f4ef not white
- Chart `theme:` folio|highcharts|shadcn|docs (default folio; unknown → E_UNKNOWN_THEME)

## Active
C2 done (superseded by C3 on themes/).
C3 done: highcharts token pack wired; snapshot examples/out/themes/01-bar-basic.svg.
C4 done: shadcn token pack wired; snapshot examples/out/themes/shadcn/01-bar-basic.svg.
C5 done: docs token pack wired; snapshot examples/out/themes/docs/01-bar-basic.svg.

## Hour order
C1 ✓ → C2 ✓ → C3 ✓ → C4 ✓ → C5 ✓ → C6 playground switcher → C7 mobile 390 → C8 homepage from site-copy.md → C9 examples theme toggle → C10 launch kit

## Commands
pnpm test → 0 (449)
pnpm markvis check examples/valid → 0
pnpm markvis check examples/invalid → 1
pnpm --filter playground build → 0
