# PLAY — same family, still a tool

Yellow nav. Dark chrome. Figure pane stays paper so the SVG reads. Must render.

## Instruction — Coder

Keep the real playground. Fence left, figure right. Theme switch rewrites the fence and re-renders. Do not touch `/`.

| role | value |
| --- | --- |
| nav field | `#FFDB2A` |
| chrome | `#0E1312` |
| figure pane | `#EDEBE5` |
| footer | none on this route |
| rule | `rgba(237,235,229,0.16)` |
| radius | `0` |
| accent blue | none |

1. Same nav as home. Playground is the current page: fill `#080B08`, text `#FFDB2A`.
2. Body under the nav is `#0E1312`. Two panes, `1px` rule between them. Left fence, right figure. Each at least `40%` at `>=768px`.
3. Toolbar one row, height `48px`, background `#0E1312`, border-bottom the rule. Controls min-height `44px`, radius `0`, `11px` mono uppercase, paper type. Theme, example, Copy fence, Copy SVG, Open in examples. Primary if needed: fill `#FFDB2A`, text ink.
4. Editor surface `#0E130F`. Fence text `13px` mono paper. Do not paint the figure pane dark.
5. Figure pane `#EDEBE5`. SVG `width:100%`, `height:auto`, uncropped.
6. Theme control sets `folio` | `highcharts` | `shadcn` | `docs` and re-renders. If it does not draw, the chrome is a fail.

390: stack figure under the fence. Toolbar scrolls inside itself, does not wrap to three rows. No horizontal page scroll.

## Acceptance

- Same yellow nav as `/`. Dark chrome. Paper figure.
- Edit a fence, see an SVG. Theme switch changes the figure.
- No beige. No blue. No white page.
