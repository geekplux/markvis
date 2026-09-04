# STATUS.md

## Snapshot
- tip: 00fff7c
- GeekPlux: Pass B REJECTED (still ugly) — Unit B chrome landed for review
- Locked: default SVG canvas TRANSPARENT (no paper fill) for MD hosts
- Active: Coder Unit B — cartesian/pie use INK + HAIRLINE_OPACITY 0.10 / STRUCTURE_OPACITY 0.28
- No README bake

## Active
Coder: Ledger transparent canvas in render-svg (docs/visual-spec.md). No axis box, no tick marks. Hairline horizontal grid. Structure baseline / pie separators / leaders.

## Last commands
- `pnpm exec vitest run -u` exit 0 (391)
- `pnpm markvis render examples/valid -o examples/out` exit 0
- `pnpm markvis gallery examples/out -o examples/gallery.html` exit 0
- `pnpm test` exit 0 (391)
