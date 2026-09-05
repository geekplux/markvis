# markvis

Charts in Markdown. The fence is the data (CSV or GFM).

## Figures

![Feb led Q3](../examples/out/01-bar-basic.svg)

![Pro pulled ahead](../examples/out/02-line-multi.svg)

![Shares stay raw](../examples/out/05-pie-raw.svg)

## Try

1. Playground: open /play on the site, or run the playground app locally.
2. CLI: markvis check examples/valid then markvis render on one file.
3. Agents: skills/markvis/SKILL.md, llms.txt.

Gallery: examples/gallery.html. Spec: SPEC.md. Look: docs/visual-spec.md (Ledger, transparent canvas).

Bake for hosts that only show images (e.g. GitHub README): markvis bake path/to.md — keeps the fence, inserts an image after it; second bake is a no-op.

Hosts: docs/integrate.md.
