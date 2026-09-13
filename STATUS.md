# STATUS.md

## Snapshot
- Site chrome: Klein Blue schema in VitePress (no peach/Motions yellow); filled geometric M logo; Docs sidebar in rails; mobile Menu drawer 44px; play two panes iframe
- Gallery thumbs + detail: SVG width 100% / height auto / max-width 100% (no :deep, no 720px cap)
- Play chrome: Theme + Color selects (two controls); examples detail Theme + Color chips
- Chart `theme:` folio|highcharts|shadcn|docs|ant|recharts (default folio; unknown → E_UNKNOWN_THEME)
- Chart `palette:` ink|porcelain|warm|cool|vivid (omit → theme default colors; unknown → E_UNKNOWN_PALETTE)

## Active
English-only committed text (`AGENTS.md`). `docs/` is ten current-law files: architecture, integrate, themes, visual-spec, site, examples, landing, research-brief, model-errors, best-practices. Historical critiques, BACKLOG, launch kit, and design snapshots deleted; unique facts folded.
U5 done: theme = grammar, palette = colors (`docs/themes.md`); Play+Examples two controls; snaps folio+ink / folio+vivid / highcharts+ink.
U6 done: plot fill transparent across packs; HC/shadcn/ant/recharts keep plot stroke only; no opaque data-plot-bg; enhance tip shape per theme.
U7 done: `docs/examples.md` lock — 52 gallery fences with conclusion stories, densified 01–06/09 (+08=01), regen theme/home SVGs; keep U5 palettes + U6 transparent plots.

## Hour order
C1 ✓ → C2 ✓ → C3 ✓ → C4 ✓ → C5 ✓ → C6 ✓ playground switcher → C7 mobile 390 → C8 homepage copy → C9 examples theme toggle → C10 launch kit → U1–U4 ✓ → U5 ✓ → U6 ✓ → U7 ✓

## Commands
# site chrome: Klein Blue schema + filled M logo; Docs rails; mobile Menu
pnpm test                                    # exit 0  (536 passed)
pnpm markvis check examples/valid            # exit 0  (52 ok)
pnpm markvis check examples/invalid          # exit 1  (0 ok, 20 error)  # required non-zero
pnpm --filter playground build               # exit 0
pnpm --filter web build                      # exit 0
