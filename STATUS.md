# STATUS.md

## Snapshot
- Site chrome: paper/folio VitePress layout; home figures no figcaption; gallery cards aria-label only; play two panes iframe
- Gallery thumbs + detail: SVG width 100% / height auto / max-width 100% (no :deep, no 720px cap)
- Play preview pane #f7f4ef not white
- No chart `theme:`

## Active
fix(web): captions + play pane + detail scale

## Commands
pnpm test → 0 (427)
pnpm markvis check examples/valid → 0
pnpm markvis check examples/invalid → 1
pnpm --filter playground build → 0
pnpm --filter playground run build:embed → 0
pnpm --filter web build → 0
