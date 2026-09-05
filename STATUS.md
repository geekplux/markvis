# STATUS.md

## Snapshot
- P1 /play embeds real playground (iframe /play-app)
- Next: Writer Mermaid purge → Designer site-visual-spec → Coder apply chrome

## Active
## Writer P2

- Mermaid stripped from public web + README + landing/integrate + skill/llms; research-brief kept internal

P1 shipped: VitePress /play full-viewport iframe of apps/playground
web build: pnpm --filter playground run build:embed → public/play-app then vitepress
?example= forwarded; Open in gallery target=_top

## Commands
pnpm test → 0 (422)
pnpm --filter playground build → 0
pnpm --filter playground run build:embed → 0
pnpm --filter web build → 0
