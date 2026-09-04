# STATUS.md

## Snapshot
- tip: 4e34b50 (origin/v2; render-svg tip dac55e0)
- gallery.html: regenerated from examples/out
- Active: W14a done — hold B1 for GeekPlux/Designer sign-off
- Next: sign-off 01 02 05 09 17 + gallery vs visual-spec; then W14b B1(+B2)

## Waves
- [x] W0-W12 stop-gate
- [x] W14a visual-spec (Designer)
- [x] W14a render-svg (Coder)
- [ ] W14b B1-B8

## Active
W14a complete. Hold: do not start B1(+B2) until GeekPlux or Designer signs off spot-checks 01 02 05 09 17 + gallery against docs/visual-spec.md.

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
