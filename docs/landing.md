# markvis

Charts in Markdown. The fence is the data (CSV or GFM). Open-source library for any Markdown preview or rendered view, and for an AI reply that needs a figure.

## Figures

![Mar led Midtown box office](../examples/out/01-bar-basic.svg)

![Walk-up still leads member](../examples/out/02-line-multi.svg)

![MARTA takes the largest mode share](../examples/out/05-pie-raw.svg)

## Try

1. Playground: open /play on the site, or run the playground app locally.
2. CLI: markvis check examples/valid then markvis render on one file.
3. Agents: skills/markvis/SKILL.md, llms.txt.

Gallery: examples/gallery.html. Spec: SPEC.md. Architecture: docs/architecture.md. Look: docs/visual-spec.md (Ledger / folio, transparent canvas). Optional `theme:` and `palette:` per SPEC.md.

Bake so any image viewer shows the figure (the fence stays in the file): markvis bake path/to.md — keeps the fence, inserts an image after it; second bake is a no-op.

Hosts: docs/integrate.md.
