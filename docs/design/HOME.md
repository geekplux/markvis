# HOME — field + inset panel

Named language for this page: Field. One flat field. One ink panel. No gradient, no card shadow, no three-column SaaS. Charts stay folio. Do not restyle chart marks to match the field.

Source of measurements:

- Motion CSS, 2026-09-08: `https://motion.dev/assets/styles-D4pQaE39.css` plus homepage inline `--fresh-*`. oklch converted to hex in the table.
- markvis live chrome: shipped `apps/web/.vitepress/theme/site.css` on tip `ec1b4aa`, the tokens the `/` shell uses. Page text confirmed at `https://markvis.js.org/` the same day.

## Observation — live markvis `/`

1. Page and nav are `#FFFFFF`. `--vp-c-bg: #ffffff`. Nav height `52px`. Wordmark `15px/600`. Links `13px/500` `#64748B`. Border `1px` `rgba(23,23,23,0.12)`.
2. Home is a centered column `.folio-home` `max-width: 1040px`, padding `48px 24px 64px`. Not a full-bleed field. Not an inset panel.
3. Wordmark `.folio-mark` is `32px/600` `#171717`. Lede `.folio-lede` is `18px/400`, max `40rem`, margin `12px 0 24px`. Two short lines of prose, not a two-voice panel headline.
4. Actions are a row, gap `12px`, height `44px`. At `768px` they go 2-up. At `390px` they stack. Still two pills on a white column.
5. Live sections under the hero: What it does, Who it helps (Any Markdown view / AI replies / Themes), Proof, 30-second start, fence, Use it, Themes. That is a docs essay. The first screen must be a field, a panel, and a band.
6. Accent `#2563EB` paints home controls and focus. Field does not use that blue on the home panel.

## Observation — Motion home

Do not copy the Motion wordmark, the MOTION+ control, or the Framer line. Steal the skeleton.

- Field computed on the live page is `#FFDB2A`. Use that hex, not the oklch conversion. Nav sits on that field. Nav min-height `72px`, padding `12px 30px`, grid `minmax(180px, 1fr) auto minmax(180px, 1fr)`.
- Links `11px` mono, weight 560, tracking `.12em`, uppercase, min-height `44px`, padding `8px 12px`.
- Hero field min-height `720px`, background the field, content edge `clamp(24px, 5vw, 68px)`.
- Inset panel computed `#080B08`, width `520px` at 1280, padding `48px`. Radius `0`. No shadow. First headline voice is field yellow. Second voice is paper. Desktop CTAs are a row. At `390` they stack.
- Panel type paper `oklch(.94 .008 96)` → `#EDEBE5`. Muted `oklch(.69 .012 148)` → `#979D97`.
- Meta row `11px` mono, uppercase, tracking `.12em`, space-between.
- Title both voices `44px/700`, tracking `-.04em`, line-height `1.05`. Name is field `#FFDB2A`. Long line is paper. Same size. Color is the second voice.
- Primary control min-height `48px`, padding `12px 18px`, fill field `#FFDB2A`, text ink `#080B08`, `11px` mono uppercase, tracking `.12em`.
- Secondary control min-height `48px`, padding `0 18px`, `1px` border paper at 28% opacity, background transparent, text paper.
- Chip row height `40px`. Each chip fill `#0E130F`, `1px` paper border at 28% opacity. Labels are host install paths, not React / Vue.

## Instruction — Coder

Build `/` as one custom home. Do not restyle `.folio-home` into this. Hide the VitePress hero. Docs pages stay white. This file does not restyle Spec or Integrate.

Tokens, locked:

| role | value |
| --- | --- |
| field | `#FFDB2A` |
| ink | `#080B08` |
| paper | `#EDEBE5` |
| muted | `#979D97` |
| rule | `rgba(8,11,8,0.28)` |
| radius | `0` |
| shadow | none |

Desktop, first screen:

1. Nav height `72px`, padding-inline `30px`. Field behind it, no white bar. Wordmark left, `16px/400`, ink, not uppercase. Links center: Docs, Examples, Play, AI, `11px` mono uppercase, tracking `.12em`. One solid action right: Playground, fill ink, text field, height `48px`. No search pill. No `#2563EB`.
2. Field full-bleed, min-height `720px`, no gradient.
3. Ink panel, left inset `clamp(24px, 5vw, 68px)`, width `min(520px, calc(100% - 48px))`, min-height `390px`, padding `48px`, vertically centered in the field.
4. Inside the panel, top to bottom. Meta row: `OPEN SOURCE` and version, space-between, muted, `11px` mono uppercase. Writer supplies the version string.
5. Headline, two voices, both `44px/700`, tracking `-.04em`, line-height `1.05`. Slot one: `markvis.` in `#FFDB2A`. Slot two: Writer's long line in paper `#EDEBE5`. Do not paint both paper. Do not shrink the second voice to `18px`.
6. Two actions in a row on desktop, gap `12px`, not full panel width. Filled: Get started, to `/play`, fill `#FFDB2A`, text ink. Outline: Browse examples, to `/examples`. Height `48px`. `11px` mono uppercase. Stack them only at `390`.
7. Chip row under the actions, height `40px`, gap `8px`. Each chip: fill `#0E130F`, `1px` border paper at 28% opacity, paper text, `11px` mono uppercase. Labels: `npm` · `script` · `skill`. Not React / Vue.

Below the fold:

8. Dark band, full-bleed, background ink `#080B08`, color paper. Five columns, equal, gap `24px`, padding `48px clamp(24px, 5vw, 68px)`. Each column sits on `#0E130F`. Column title `13px/600` paper. Line under it `13px/400` muted, max `22ch`.
9. Column titles, this order. Writer writes the one line under each. Do not render these as white cards:
   - library you can drop in
   - Any Markdown view
   - same fence, same SVG
   - AI replies
   - Themes
10. No white What / Who / Proof essay above this band. Proof figures, if kept, sit after the band, uncropped, folio, one caption each, content max-width `1040px`. They are not the first screen. Do not put a fence sample in the panel.

390:

- Field still full-bleed. Side padding `16px`.
- Panel width `calc(100% - 32px)`, min-height `0`, not absolutely placed over cropped type.
- Headline may wrap. Do not clip. Floor stays `36px`. Name stays `#FFDB2A`. Rest stays paper.
- Both actions full width, stacked, height `48px`. Desktop stays a row.
- Chips wrap. Keep the `40px` bordered chip. Band columns stack, one per row, gap `20px`.
- Tap targets `>= 44px`. Nav links that do not fit become one menu whose trigger is `44px`.
- No horizontal page scroll. `scrollWidth` equals `clientWidth`.

Delete on `/` only:

- `#FFFFFF` page and `#FFFFFF` nav bar.
- `.folio-home` `max-width: 1040px` column as the hero.
- `#2563EB` on home controls.
- Who-cards as three white cards. The phrases move into the band.
- Do not bring back `#F7F4EF`.

## Acceptance

- First screen is field `#FFDB2A` and one ink panel. The name `markvis.` is yellow on that panel. The long line is paper.
- Desktop actions are a row. At `390` they stack. No VitePress hero pills. No white column. No blue primary.
- 390: no horizontal page scroll. Panel not cropped. Actions stacked, `48px`.
- Charts below the band, if shown, stay folio and uncropped.
