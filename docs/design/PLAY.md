# PLAY — Field tool

Same nav and type as `/`. Layout is an editor, not a marketing panel. The figure must render. A pretty shell that does not draw is a fail.

Charts stay folio until the theme control rewrites the fence. Do not restyle marks for the site.

Measured faults still in the product path: nav `52px` white, accent `#2563EB`, figure pane was `#F7F4EF`, toolbar controls under `44px`. Those are the miss. Do not bring beige back.

## Instruction — Coder

Keep the real playground. Fence left, figure right. Theme switch rewrites the fence header and re-renders. Do not touch `/` paint.

Chrome, locked to home:

| role | value |
| --- | --- |
| nav field | `#FFDB2A` |
| ink | `#080B08` |
| paper | `#EDEBE5` |
| page | `#FFFFFF` |
| rule | `rgba(8,11,8,0.28)` |
| radius | `0` |
| shadow | none |
| accent blue | none |

1. Same nav as home. Height `72px`. Field bar. Playground action is the current page: fill ink, text field. Do not also show a second Play link as active blue.
2. Body under the nav is `#FFFFFF`. Two panes, `1px` rule between them. Left fence, right figure. Each pane at least `40%` at `>=768px`.
3. Toolbar is one row, height `48px`, padding-inline `16px`, bg `#FFFFFF`, border-bottom the rule. Controls min-height `44px`, radius `0`, `11px` mono uppercase. Theme, example, Copy fence, Copy SVG, Open in examples. Idle: transparent, `1px` rule. One primary if needed: fill `#FFDB2A`, text ink. No `#2563EB`.
4. Editor surface `#FFFFFF`. Fence text `13px` mono ink. Do not paint the whole pane `#080B08`.
5. Figure pane `#EDEBE5` so a transparent SVG reads. SVG `width:100%`, `height:auto`, uncropped.
6. Theme control sets `folio` | `highcharts` | `shadcn` | `docs` and re-renders. If it does not draw, the chrome is a fail.

390:

- Stack figure under the fence.
- Toolbar is one horizontal scroll row, not a wrap of three. Control height `44px`.
- No horizontal page scroll. `scrollWidth` equals `clientWidth`.

## Acceptance

- Same yellow nav as `/`.
- Edit a fence, see an SVG.
- Theme switch changes the figure.
- At `390` the toolbar scrolls inside itself. No beige. No blue.
