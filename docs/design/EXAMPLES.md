# EXAMPLES — stable grid + drawer

Named language: same **Lattice** family as `SITE.md`. Yellow nav. Dark page. Paper cards. Light footer. Charts follow the active theme grammar; default public cards use folio unless the theme filter says otherwise.

## Observation — live fail

`.gallery-layout.open { grid-template-columns: 1fr minmax(360px, 40%); }` puts the detail **inside** the layout grid. Opening a card reflows columns; sibling card widths shrink. That accordion is banned.

## Judgment

Grid geometry is constant. Detail is an overlay layer, never a second track that steals width from the grid.

## Instruction — Coder

### Chrome

| role | value |
| --- | --- |
| nav field | `#FFDB2A` |
| page | `var(--site-page)` — same as home/docs; **no island** `#0E1312` |
| card | `#EDEBE5` |
| footer | `#F8F8F6` |
| rule | `rgba(237,235,229,0.16)` |
| radius | `0` |
| accent blue | none |

1. Same nav as home. Playground fill `#080B08`, text `#FFDB2A`, height `48px`.
2. Page below nav `#0E1312`. Heading `Examples` `44px/700` paper. Sub `15px` muted, max `42ch`. Content max-width `1200px`. Side pad `24px`.
3. Filters: type, then theme. Chip height `44px`, radius `0`, `11px` mono uppercase. Idle: transparent, `1px` paper at 28%. Active: fill `#FFDB2A`, text ink. Filters **only refilter** — they must not open or resize cards.
4. Grid: `1` col `<768`, `2` from `768`, `4` from `1200`. Gap `16px`. No `3`-column step. Column template **never** changes when a card is selected.
5. Card: paper `#EDEBE5`, radius `0`, padding `12px`. Thumb SVG `width:100%`, `height:auto`, uncropped. Show SVG title when present; optional one-line caption under if title is missing. Hover: `translateY(-1px)` + border to paper; **no** width/flex change.
6. Footer `#F8F8F6`, same as home.

### Delete

- `.gallery-layout.open` two-column reflow (or any class that changes `grid-template-columns` / flex basis of the card grid on select).
- Click-to-expand that resizes siblings.
- Inline aside that shares a track with the grid.

### Detail layer (drawer preferred)

Desktop `>=768`:

1. Fixed **right drawer**, width `min(480px, 92vw)`, height `100vh`, `z-index` above page, background paper `#EDEBE5`, radius `0`, `1px` ink-rule on the left edge.
2. Enter: `transform: translateX(100% → 0)`, `240ms` `cubic-bezier(0.22, 1, 0.36, 1)`. Backdrop `rgba(8,11,8,0.45)`, fade `200ms`.
3. Body scroll on the page is locked **or** scroll position is saved and restored on close. Close must return to the **same scroll position**.
4. Drawer content, top to bottom:
   - Close control `44×44` tap target
   - Title (conclusion sentence)
   - Large uncropped figure
   - Theme switcher chips (all registry ids) — switches this detail’s figure/fence only
   - Actions: Copy fence · Copy SVG · Open in Play
   - Full fence `<pre>`
5. Opening card N does not remount or reflow cards 1…N−1, N+1…. Sibling `getBoundingClientRect().width` stays constant (±1px).

Mobile `<768`:

- Same content as a **bottom sheet**: height `min(88vh, 100%)`, slide up `240ms`, handle/close `44px`. Grid still full width underneath; no column collapse.

Deep link optional: `?id=` or `/examples/:id` may open the same drawer. Not required in the first paint unit if query sync already exists — keep scroll restore.

### Card quality (public)

A card may ship only if:

- title is a conclusion
- axes labeled when the grammar requires them
- multi-series has a legend
- whole plot visible (no crop)
- theme grammar readable without reading the id

Theme filter lists: `folio | highcharts | shadcn | docs | ant | recharts` once those ids exist.

Site mode (`light`|`dark`) is `SITE.md` §G. This page follows `--site-page`; do not force a second background.

## Acceptance

- Same nav and footer as `/`.
- Dark page, paper cards, square chips, grid `1 / 2 / 4`.
- Opening a detail **does not** change sibling card width.
- Close restores scroll position.
- `390`: one column, sheet detail, no horizontal page scroll.
- `prefers-reduced-motion`: drawer appears without slide.

@Coder: delete the accordion in the same unit as the drawer. Do not touch `/` in the examples unit unless SITE.md hero work is the same commit family under PM order.
