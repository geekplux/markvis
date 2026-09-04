# markvis

Quantitative charts in Markdown — the fence is the data (CSV or GFM), Mermaid keeps structure.

## Figures

![Feb led Q3](../examples/out/01-bar-basic.svg)

![Pro pulled ahead](../examples/out/02-line-multi.svg)

![Shares stay raw](../examples/out/05-pie-raw.svg)

## Try

1. Playground: `apps/playground` (or open `apps/playground/dropin.html` for the zero-network script).
2. CLI: `markvis check examples/valid` then `markvis render` on one file.
3. Agents: `skills/markvis/SKILL.md`, `llms.txt`.

Gallery: `examples/gallery.html`. Spec: `SPEC.md`. Look: `docs/visual-spec.md` (Ledger, transparent canvas).

Bake for hosts that only show images (e.g. GitHub README): `markvis bake path/to.md` — keeps the fence, inserts `![…](….svg)` after it; second bake is a no-op.
