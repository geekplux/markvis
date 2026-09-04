# STATUS.md

## Snapshot
- tip: (this commit) B4 bake.yml
- W14a accepted (transparent Ledger)
- B1+B2+B3+B4 done
- Still open: B5/B6 hosts, B7 vscode, B8 integrate.md

## Active
B4 done. Next: B5/B6 hosts.

## Commands
```
pnpm markvis bake README.md docs/landing.md
# EXIT_BAKE:0
# baked README.md 0 unchanged
# baked docs/landing.md 0 unchanged
```

Workflow: `.github/workflows/bake.yml` — pull_request + push on v2; bake README.md + docs/landing.md; commit SVG/md if dirty (skip fork PRs). No theme, no d3, no new types.
