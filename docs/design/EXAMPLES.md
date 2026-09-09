# EXAMPLES — Field gallery

Same family as home. Not a second yellow hero. Not the white VitePress essay that sits under `/` today.

Charts stay folio unless a theme chip is on. Do not restyle chart marks to match the field.

Measured from live `/examples` CSS on tip `f7ebeb0` (`assets/style.DCT935Iz.css`), 2026-09-09.

## Observation — live `/examples`

1. Page `.gallery-page` is `#FFFFFF`, max-width `1200px`, padding `32px 24px 64px`. Home is field `#FFDB2A`. The gallery does not share the nav.
2. Title `.gallery-title` is `28px/600` `#171717`. Sub is `14px/400` `#737373`. Home headlines are `44px/700`.
3. Filters `.gallery-chip` are pills: height `40px`, radius `999px`, `12px/500`, border `rgba(23,23,23,0.12)`. Active fill `#171717`. Home chips are radius `0`, `11px` mono uppercase, fill `#0E130F`.
4. Grid is `1` column, then `2` at `600px`, `3` at `900px`, `4` at `1200px`. The lock is `1 / 2 / 4` at `390 / 768 / 1200`. The `3`-column step is the drift.
5. Card background `#FFFFFF`, padding `12px 12px 10px`. Detail rail radius `8px`, border `#E4E4E7`. Focus ring `#2563EB`. Home banned that blue on the product surface.
6. Thumb SVG is `width:100%`, `height:auto`, `max-height:none`. Keep that. Do not crop.
7. Focus and hover still speak docs-blue. The page reads as the old white gallery with a new home upstairs.

## Instruction — Coder

Keep the gallery data, type filter, theme filter, and click-to-fence behavior. Change chrome only. Do not touch `/`.

Tokens, locked to home:

| role | value |
| --- | --- |
| nav field | `#FFDB2A` |
| ink | `#080B08` |
| paper | `#EDEBE5` |
| page | `#FFFFFF` |
| chip | `#0E130F` |
| rule | `rgba(8,11,8,0.28)` |
| radius | `0` |
| shadow | none |
| accent blue | none |

Desktop:

1. Same nav as home. Height `72px`. Field behind the nav only. Wordmark `16px/400` ink. Links `11px` mono uppercase. Playground action fill ink, text field, height `48px`.
2. Page below the nav is `#FFFFFF`. Do not paint the grid yellow. Side padding `24px`. Content max-width `1200px`.
3. Heading `Examples` at `44px/700` ink, tracking `-.04em`, line-height `1.05`. One sub line `15px/400` muted `#979D97`, max `42ch`. Writer owns that sentence if it is missing. Do not invent a second hero panel.
4. Filters: type, then theme. Chip height `44px`, padding `0 14px`, radius `0`, `11px` mono uppercase, tracking `.12em`. Idle: transparent, `1px` rule. Active: fill ink, text `#FFDB2A`. Gap `8px`. No pills.
5. Grid: `1` column under `768px`, `2` columns from `768px`, `4` columns from `1200px`. Gap `16px`. Delete the `3`-column step.
6. Card: background `#FFFFFF`, radius `0`, border `1px` rule, padding `12px`. No shadow. Hover: border ink. No lift. Thumb SVG `width:100%`, `height:auto`, overflow visible. One caption under the figure, `13px/600` ink, a conclusion, never a stem slug. If the SVG title is already that sentence, do not repeat it.
7. Click opens the existing large figure + fence + Open in Play. Rail background `#FFFFFF`, radius `0`, border rule. SVG in the rail uncropped, same scale rule as the thumb.

390:

- Nav links collapse to one menu trigger, height `44px`, same as home.
- Filters wrap. Chip height stays `44px`.
- One column. Cards full width. No horizontal page scroll. `scrollWidth` equals `clientWidth`.
- Detail stacks under the grid, not a `360px` side rail.

Delete on `/examples` only:

- Radius `999px` pills.
- Radius `8px` cards and detail.
- `#2563EB` focus. Use `2px` ink outline, offset `2px`.
- The `3`-column grid.
- Do not bring back `#F7F4EF`.

## Acceptance

- Same nav as `/`. Yellow bar, black Playground action.
- White grid, square cards, mono filter chips, no pills, no blue.
- `1 / 2 / 4` columns at `390 / 768 / 1200`.
- A card never crops the plot. Caption is a conclusion, or absent if the SVG title is already visible.
