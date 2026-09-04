# STATUS.md

## Snapshot
- tip: Unit B Ledger render-svg (this commit)
- Active: Unit B Coder done
- Hold: README/landing bake until GeekPlux accepts five

## Waves
- [x] W0-W12 stop-gate
- [x] W14a visual-spec (Designer Unit A Ledger)
- [x] W14a render-svg (Coder Unit B Ledger)
- [ ] W14b B1-B8

## Active
Unit B Coder done. `packages/render-svg` implements `docs/visual-spec.md` Ledger. Title-only edits on 01/02/05/09/17. Regen `examples/out/*` + `examples/gallery.html`. No theme field. No d3. No HTML poster. No animation. No README bake.

## Commands (Unit B Coder)
```
pnpm test
# exit 0  (15 files, 391 passed)

pnpm markvis check examples/valid
# exit 0  (52 ok)

pnpm markvis check examples/invalid
# exit 1  (required non-zero; 0 ok, 18 error)

UPDATE_SNAPSHOTS=1 pnpm exec vitest run packages/render-svg
# exit 0  (76 passed; examples/out/*.svg rewritten)

pnpm markvis gallery examples/out -o examples/gallery.html
# exit 0  (wrote examples/gallery.html)

pnpm --filter playground build
# exit 0  (vite build; no playground source change)
```

## Unit B stop
01 / 02 / 05 / 09 / 17: conclusion titles, type 17/600 left at plot left, dual-encoding (n≤6 labels on / grid off; n>8 labels off / grid on), bar width ≤72 when n≤4, plot height share ≥0.55 (17 grew to 604), line end-labels not color legend, no chart-type title on 05.
