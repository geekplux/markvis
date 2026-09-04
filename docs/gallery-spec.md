# gallery-spec — `/examples` (Highcharts density, Ledger figures)

Language for **figures** stays **Ledger** (`docs/designer-language.md`, `docs/visual-spec.md`): transparent SVG, conclusion titles, six types, no `theme:`.

This file specifies only the **gallery chrome** — the page that shows many figures. Steal from [Highcharts demos](https://www.highcharts.com/demo): dense grid of finished small charts, click → large, variation within a type. Do **not** steal: new families, 3D, stock, gauges, maps, animation-as-product.

Source of truth: `examples/valid/*.md` → baked/rendered SVG in `examples/out/`. Gallery must be **generated** from that set so docs cannot drift. Today: **52** valid files (≥40 locked).

---

## Page world

| Token | Value |
| --- | --- |
| Page paper | `#FAFAF9` (VitePress content surface — **not** painted into SVG) |
| Ink | `#171717` |
| Quiet | `#737373` |
| Rule | `#171717` at opacity `0.10` |
| Accent (UI chrome only) | `#3B82F6` — filter chip active, focus ring; never a second chart theme |
| Max content width | `1120px` centered |
| Page pad | `24px` sides · `32px` top under nav |

Home and Integrate keep VitePress defaults; `/examples` is the launch density surface.

---

## Hierarchy (3 levels)

1. **Page title** `28px/600` ink — `Examples` (one word). Subline `14px/400` quiet: `52 figures · six types · from examples/valid`.
2. **Filter row** type chips (see Filters).
3. **Card grid** — the product.

No sidebar. No marketing hero on `/examples`.

---

## Filters

- Chips: `All` · `bar` · `line` · `area` · `scatter` · `pie` · `hist`
- Chip: height `28px`, pad `0 12px`, radius `999px`, border rule `1px` ink@0.10, text `12px/500` quiet
- Active: fill ink `#171717`, text `#FAFAF9` (or accent fill `#3B82F6` + white text — pick **ink fill**; one active style)
- Default = `All`. Filter client-side by `data-type` on each card (from fence `type:`).
- Count in subline updates: `12 figures · bar`.

---

## Card grid (Highcharts upside)

| Token | Value |
| --- | --- |
| Grid | `display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));` |
| Breakpoints | natural via `auto-fill` — no fixed 3-col media query required |
| Visible on load | all 52 (or filtered subset) — no pagination for ≤60 |
| Card surface | `#FFFFFF` · border `1px` ink@0.10 · radius `0` (square — matches Ledger corner rule) · **no shadow** |
| Card pad | `12px` |
| Thumb frame | height `140px`, width 100%, overflow hidden, bg transparent |
| Thumb SVG | scale to fit width; `max-height: 140px`; preserve aspect; Ledger SVG stays transparent |
| Card title | `13px/600` ink · **conclusion only** (from IR/`<title>`) · max 2 lines · ellipsis |
| Meta | omit type name under title (type is in filter). Optional quiet `11px` id `01` right-aligned — optional, default **off** |
| Hover | border ink@0.28 · cursor pointer · **no** lift/shadow |
| Focus | `2px` accent outline offset `2px` |

Ban on cards: chart-type titles (`Bar Chart`), mint greens, rounded “SaaS” cards (`radius ≥ 8`), drop shadows, gradient washes.

---

## Click → enlarge (detail)

Two acceptable implementations (Coder picks one; prefer A):

### A — Same-route detail panel (recommended)

- Click card → URL ` /examples?id=01-bar-basic` (or hash `#01-bar-basic`)
- Right or below: **detail rail** `min-width 360px` / on narrow: full-width stack
- Detail contains:
  1. Full SVG at natural width (cap `720px`)
  2. Conclusion title `20px/600`
  3. Fence `<pre>` from the matching `examples/valid/*.md` body
  4. Buttons: `Copy fence` · `Copy SVG` · `Open in playground` (deep-link if playground supports `?example=`)
- Close: `Esc` · backdrop click · clear query

### B — Modal overlay

- Fixed overlay ink@0.40 · center panel `#FFFFFF` max `800px` · same content as A
- Same close rules

Either way: **static** enlarge — no chart animation, no Highcharts hover tooltips.

---

## Generation contract (no drift)

1. Build step (or VitePress plugin) reads `examples/valid/*.md`.
2. For each file, resolve SVG from `examples/out/<same-stem>.svg` (must exist; fail build if missing).
3. Card title = SVG `<title>` text (conclusion) or fence `title:` — never filename alone.
4. `data-type` = fence `type:` value.
5. `data-id` = stem (`01-bar-basic`).
6. Regenerating out/ + valid/ updates the gallery without hand-editing `examples.md`.

Stub `apps/web/examples.md` is replaced by this generated surface.

---

## Density checklist (acceptance)

| Check | Pass |
| --- | --- |
| ≥40 cards visible with All | 52 today |
| All six types present | bar line area scatter pie hist |
| Titles are conclusions | no `Bar Chart N` |
| Click shows full SVG + fence + copy | A or B |
| Figures match Ledger | transparent, no paper rect |
| Generated from valid | no hand-curated parallel list |
| No new chart types / theme / d3 / animation product | locked |

---

## Out of scope

Marketplace polish beyond VitePress, Highcharts product chrome clone, dark gallery theme pack, infinite scroll, search-as-you-type (optional later), Docusaurus.

## Done when

Coder implements `/examples` per this file; GeekPlux can scan 52 cards, click one, copy the fence. Designer does a measured pass on 3 cards + 1 detail if asked.
