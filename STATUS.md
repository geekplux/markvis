# STATUS.md

## Snapshot
- Site chrome: paper/folio VitePress layout; home figures no figcaption; gallery cards aria-label only; play two panes iframe
- Gallery thumbs + detail: SVG width 100% / height auto / max-width 100% (no :deep, no 720px cap)
- Play chrome: Theme + Color selects (two controls); examples detail Theme + Color chips
- Chart `theme:` folio|highcharts|shadcn|docs|ant|recharts (default folio; unknown → E_UNKNOWN_THEME)
- Chart `palette:` ink|porcelain|warm|cool|vivid (omit → theme default colors; unknown → E_UNKNOWN_PALETTE)

## Active
U5 done: theme = grammar, palette = colors; PALETTES.md; Play+Examples two controls; snaps folio+ink / folio+vivid / highcharts+ink.
U6 done: plot fill transparent across packs; HC/shadcn/ant/recharts keep plot stroke only; no opaque data-plot-bg; enhance tip shape per theme.
U7 done: examples-data.md lock — 52 gallery fences with conclusion stories, densified 01–06/09 (+08=01), regen theme/home SVGs; keep U5 palettes + U6 transparent plots.

## Hour order
C1 ✓ → C2 ✓ → C3 ✓ → C4 ✓ → C5 ✓ → C6 ✓ playground switcher → C7 mobile 390 → C8 homepage from site-copy.md → C9 examples theme toggle → C10 launch kit → U1–U4 ✓ → U5 ✓ → U6 ✓ → U7 ✓

## Commands
pnpm test
pnpm markvis check examples/valid
pnpm markvis check examples/invalid
pnpm --filter playground build
