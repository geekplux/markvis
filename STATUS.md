# STATUS.md

## Snapshot
- Site chrome: paper/folio VitePress layout; home figures no figcaption; gallery cards aria-label only; play two panes iframe
- Gallery thumbs + detail: SVG width 100% / height auto / max-width 100% (no :deep, no 720px cap)
- Play preview pane #f7f4ef not white
- Chart `theme:` folio|highcharts|shadcn|docs (default folio; unknown → E_UNKNOWN_THEME)

## Active
C1 done @ 9d4ab18 (parser/IR/schema + invalid/19). Writer site-copy + launch drafts @ 0c43c7d.
C2 next: extract folio tokens into packages/render-svg/themes/folio.ts; renderer consumes folio; no visual redesign; no other packs yet.

## Hour order
C1 ✓ → C2 → C3/C4/C5 packs → C6 playground switcher → C7 mobile 390 → C8 homepage from site-copy.md → C9 examples theme toggle → C10 launch kit

## Commands
pnpm test → 0 (439)
pnpm markvis check examples/valid → 0
pnpm markvis check examples/invalid → 1
pnpm --filter playground build → 0
pnpm --filter playground run build:embed → 0
pnpm --filter web build → 0
