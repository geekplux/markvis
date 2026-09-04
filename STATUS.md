# STATUS.md

## Snapshot
- tip: 60ede8c feat(render-svg) visual-spec (v2)
- gallery.html: regenerated from examples/out
- Active: W14a Coder render-svg done
- Next: GeekPlux review of 01 02 05 09 17; then W14b

## Waves
- [x] W0-W12 stop-gate
- [x] W14a visual-spec (Designer)
- [x] W14a render-svg (Coder)
- [ ] W14b B1-B8

## Active
W14a Coder done. Default SVG implements docs/visual-spec.md in packages/render-svg only. No theme field. No d3. No playground rebuild.

## Commands (W14a Coder)
```
pnpm test
# exit 0  (15 files, 389 passed)

pnpm markvis check examples/valid
# exit 0  (52 ok)

pnpm markvis check examples/invalid
# exit 1  (required non-zero; 0 ok, 18 error)

UPDATE_SNAPSHOTS=1 pnpm exec vitest run packages/render-svg
# exit 0  (74 passed; examples/out/*.svg rewritten)

pnpm markvis gallery examples/out -o examples/gallery.html
# exit 0  (wrote examples/gallery.html)

# pnpm --filter playground build  — skipped (W14a: no playground rebuild)
```

## W14a stop
01-bar-basic, 02-line-multi, 05-pie-raw, 09-bar-twelve-categories, 17-bar-long-labels match visual-spec (paper, tokens, unit on title, pie outside labels, 09 horizontal, 17 full −55° labels, compact ticks).
