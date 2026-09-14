# markvis

Charts in Markdown. Write a table in a code block. MarkVis draws the picture. Change a number — the picture changes. If the chart cannot draw, you still see the table.

## Figures

![Mar led Midtown box office](../examples/out/01-bar-basic.svg)

![Walk-up still leads member](../examples/out/02-line-multi.svg)

![MARTA takes the largest mode share](../examples/out/05-pie-raw.svg)

## Try

1. Playground: open /play on the site, or run the playground app locally.
2. Command line: markvis check examples/valid then markvis bake on one file.
3. Agents: skills/markvis/SKILL.md, llms.txt.

Gallery: examples/gallery.html. Spec: SPEC.md. Architecture: docs/architecture.md. Look: docs/visual-spec.md. Themes: docs/themes.md. Site chrome: docs/site.md. Optional `theme:` and `palette:` per SPEC.md.

`markvis bake path/to.md` writes a picture next to the file and adds an image so any viewer can show it. The code block stays. Running bake again does nothing if nothing changed.

Hosts: docs/integrate.md.
