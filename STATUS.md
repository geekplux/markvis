# STATUS.md

## Snapshot
- tip: 38883c3 + S1 VitePress apps/web
- valid examples: 52
- Active: S1 Coder done — VitePress scaffold, no Pages, no docsify
- Next: S2 gallery UX (not this commit)

## Active
S1 complete -> S2 Designer examples gallery

## Commands (this round)
| command | exit |
| --- | --- |
| pnpm install --frozen-lockfile | 0 |
| pnpm test | 0 |
| pnpm markvis check examples/valid | 0 |
| pnpm markvis check examples/invalid | 1 (required) |
| pnpm --filter playground build | 0 |
| pnpm --filter web build | 0 |
