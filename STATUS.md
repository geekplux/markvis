# Markvis 2.0 — Status

## Current unit
U1: In /workspace/markvis, pnpm install + make pnpm test pass on Node 20. Fix only install/test blockers. No types/ESM yet. Proof: pnpm test exit 0; PR if tree changed; update STATUS.md.

## Checklist
1. [x] Baseline green on Node 20+
2. [ ] Public contract typed
3. [ ] Modern module shape
4. [ ] Chart boundary
5. [ ] Docs match code

## U1 notes
- Node v20.19.2; package manager 9.15.9
- Updated __tests__/index.js golden HTML for current d3/jsdom SVG output (axis attrs + pie colors)
- Fixed examples/basic.js require path (drop .js ext for xo)
- Refreshed lockfile from install
- PR: https://github.com/geekplux/markvis/pull/16 (base: master; repo has no main)
