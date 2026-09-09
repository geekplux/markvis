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

## Pixel fail — live `/` at `f7ebeb0`

Designer OK is withdrawn. The field and panel colors match. The pixels do not.

Compared to the live Motion home, same day:

1. Buttons center the label. Motion uses `justify-content: space-between`, padding `12px 18px`, a trailing `>` on the right. Both buttons. Height `48px`.
2. Meta is `OPEN SOURCE` and `v2`. Motion is a slash pair on the left: `OPEN SOURCE / MIT LICENSE`. Right stays the version.
3. Chips sit with no label line. Motion has an `11px` mono uppercase line with a leading `>`, then the chips. Do not copy the Framer sentence. Slot: `> available for` then the three chips.
4. The band is five cards with `gap: 24px` and paper titles at `13px/600`. Motion's row is a hairline grid: `gap: 1px`, cell padding `22px`, title `11px` mono uppercase in field `#FFDB2A`, line under it muted. Background of the grid is the rule. Cells are `#0E130F`.
5. Below that, Motion shows figures in cells. markvis shows a section titled `Proof`. Delete that heading. Three folio SVGs, uncropped, each in a paper cell `#EDEBE5` so the transparent chart reads. No second caption if the SVG title is visible. Radius `0`.

Do not copy the Motion wordmark, MOTION+ label, or Framer line. Playground stays the right action. `npm` · `script` · `skill` stay the chips.

@Coder: these five paints on `/` only. @Writer: the slash pair and the chip label line, if the strings above are not the ones you want. Layout is not waiting on new sentences if those slots are used as written.

## Rest of the page — simpler, same family

Recorded after load and a full scroll, 2026-09-09. The reference page is a yellow hero, then a dark body, then a light footer. markvis keeps that rhythm and cuts the rest.

Reference sections after the hero, in order. Do not build these:

- dark 4 by 2 interactive feature grid
- example card grid with favourite marks
- three docs-product cards
- workflow split with a second product
- showcase carousel
- changelog plus magazine
- partner and sponsor strips
- score callout
- newsletter

markvis page after the panel, locked. Body is ink, not a second yellow field.

1. Hairline row. `gap: 1px`. Cells `#0E130F`. Title `11px` mono uppercase in `#FFDB2A`.
2. Figure atlas. Background `#0E1312`. Index `01`, `11px` mono uppercase, `#FFDB2A`. Heading `44px/700` paper `#EDEBE5`. One line muted, max `42ch`. Three cells, one row at `>=900px`, stack at `390`. Cell paper `#EDEBE5`, radius `0`, padding `16px`. Existing folio SVGs, `width:100%`, `height:auto`, uncropped. No Proof heading.
3. Examples strip. Same ink `#0E1312`. Heading `Examples.` `44px/700` paper. Link `Browse examples` with trailing `>`, to `/examples`. Four thumbs, paper cells, gap `12px`. At `390`, `2x2`. Not a yellow band.
4. Start band. Same ink. Two columns at `>=768px`, stack at `390`. `Start.` `44px/700` paper. Button Get started, fill `#FFDB2A`, text ink, height `48px`, trailing `>`. Right: `npm` / `script` / `skill`, hairline `1px` between rows.
5. Agent links. Same ink. Index `02`. Heading `44px/700` paper. Two links, `11px` mono uppercase: `/llms.txt` and `/ai`.
6. Footer. Light `#F8F8F6`, not yellow. Four links: Docs, Examples, Play, GitHub. Then `MIT` and `0.0.13` under `legacy/`. `13px` ink. Padding `32px` the same inset.

390: no horizontal page scroll. Atlas and start stack. Thumbs `2x2`. Tap targets `>= 44px`.

Do not add a plus product, partner logos, a blog, a carousel, or a score tool.

## Mobile nav — overflow

Measured in shipped CSS, not a new look. Same bar on `/` and the family pages.

The bar uses `grid-template-columns: minmax(180px, 1fr) auto minmax(180px, 1fr)` and `padding-inline: 30px`. That is at least `360px` plus the link cluster. It overflows under about `700px`.

Links hide only at `max-width: 390px`. Phones at `393` to `430` still get the full row. That is the overflow.

Lock:

1. Collapse the center links at `max-width: 768px`, not `390`. Show the Menu trigger. Height `44px`.
2. Below `768px` the grid is `minmax(0, 1fr) auto auto`. Wordmark `min-width: 0`. No `180px` floor.
3. Playground stays. Padding `0 12px`. Height `48px`. It must sit inside the bar, not past the right edge.
4. Nav and page: `overflow-x: hidden`. `scrollWidth` equals `clientWidth` at `390` and at `430`.
5. Same rule on `.home-nav` and `.family-nav`.
