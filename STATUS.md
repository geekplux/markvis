# STATUS.md

## Snapshot
- tip: 8ac5b57 (origin/v2)
- gallery.html: regenerated from examples/out
- Active: W14a scale fix done — hold B1 for GeekPlux/Designer sign-off
- Next: sign-off 01 02 05 09 17 + gallery vs visual-spec; then W14b B1(+B2)

## Waves
- [x] W0-W12 stop-gate
- [x] W14a visual-spec (Designer)
- [x] W14a render-svg (Coder)
- [x] W14a scale fix (full-USD one scale; no auto-k)
- [ ] W14b B1-B8

## Active
W14a complete including Designer full-USD path for ex17. Hold B1 for sign-off.

## Commands (W14a scale fix)
```
pnpm test
# exit 0  (15 files, 389 passed)

pnpm markvis check examples/valid
# exit 0  (52 ok)

pnpm markvis check examples/invalid
# exit 1  (required non-zero; 0 ok, 18 error)

# pnpm --filter playground build  — skipped (W14a: no playground rebuild)
```

## W14a stop
spot-check 01 02 05 09 17 vs visual-spec; full-USD one scale on 17.
