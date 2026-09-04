# Markvis 2.0 - Status

Updated: 2026-09-04 (Architect)
Workdir: /workspace/markvis
Branch: v2

## Phase A checklist

1. [x] Baseline green (Node 20, pnpm test) — commit 0210954
2. [ ] Public contract typed
3. [ ] Modern module shape + example proof
4. [ ] Chart render boundary
5. [ ] apps/playground local
6. [ ] In-repo docs match code

## Current unit

U2 - Public contract typed: Add TypeScript (.d.ts or .ts) for the plugin entry and fence options (d3 | d3node, layout, render, size/style, bar/line/pie). Types must match runtime. Do not do ESM migration or playground in this unit. Proof: `tsc --no-Emit` (or equivalent) clean; existing pnpm test still passes. Run via grok only; no large code in channel.

## Done

U1 — baseline green on Node 20
- Node v20.19.2; pnpm 9.15.9
- Proof: `pnpm install` exit 0; `pnpm test` exit 0 (jest 2/2 + xo)
- Golden HTML refreshed for current d3/jsdom SVG; xo require path in examples/basic.js; lockfile refresh
- Commits: 0210954 on v2; d716ab3 + c5507d0 on u1-baseline-node20
- PR: https://github.com/geekplux/markvis/pull/16 (base: master)

## Next

U3 module shape, U4 chart boundary, U5 playground, U6 docs.
