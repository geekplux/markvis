# STATUS.md

## Snapshot
- Site chrome: paper/folio VitePress layout; home figures on page; examples cards uncropped one caption; play two panes iframe
- Gallery thumbs: SVG width 100% / height auto / max-width 100% (no 720px overflow)
- No chart `theme:`

## Active
fix(web) gallery thumb scale — shipped

## Commands
pnpm test → 0 (426)
pnpm markvis check examples/valid → 0
pnpm markvis check examples/invalid → 1
pnpm --filter playground build → 0
pnpm --filter playground run build:embed → 0
pnpm --filter web build → 0
