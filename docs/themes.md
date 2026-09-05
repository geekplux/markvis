# themes.md — markvis theme token packs

Scope: optional fence `theme: folio|highcharts|shadcn|docs`. Omitted = folio. Unknown = error + table fallback. Themes are token packs in `packages/render-svg/themes/*.ts` only. No Highcharts/d3/Unovis/Recharts deps. No new chart types. Public UI labels may say Folio / Highcharts-style / shadcn-style / Docs — avoid trademark claims in marketing copy.

Default site figures stay folio.

Playground theme switcher and examples theme toggle are Coder C6/C9. This file is token truth only.

---

## folio

### Intent

Ledger editorial default: transparent canvas on the Markdown host, hairline grid, value labels when the dual-encoding rule allows, one accent for one series. Ink near-black; quiet gray for units and ticks. No paper plate.

### Locked tokens (from `folio.ts`)

| Token | Value |
| --- | --- |
| Canvas / paper | transparent (no full-frame fill; host shows through) |
| Ink | `#171717` |
| Quiet | `#737373` |
| Hairline opacity (grid) | `0.10` |
| Structure opacity (baseline, leaders, pie separators) | `0.28` |
| Series palette (cap 8) | `#3B82F6`, `#F97316`, `#10B981`, `#A855F7`, `#EAB308`, `#14B8A6`, `#F43F5E`, `#64748B` |
| Wrap opacity | `0.7` |
| Bar radius `BAR_RX` | `3` |
| Line stroke | `1.75` |
| Line point `r` | `2.5` |
| Area fill opacity | `0.22` |
| Type — title | `17` / `600` / `#171717` |
| Type — unit | `12` / `400` / `#737373` |
| Type — value | `11` / `500` / `#171717` |
| Type — tick | `10` / `400` / `#737373` |
| Type — note | `11` / `400` / `#737373` |
| Type — legend | `11` / `400` / `#171717` |
| Frame | `720×480` (max height `640`) |
| Plot min ratio | `0.55` |
| Margins | top `36`, right `20`, bottom `26`, left `48` |
| Max interior grid | `3` |
| Font | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` |

### Differentiator vs folio

N/A — folio is the reference pack. Site default figures resolve here.

### Ban list

- Full-frame paper / canvas fill (`#F7F4EF`, card slab, or any painted plate)
- Vertical grids, axis boxes, tick lines sticking off the axis
- Neon / rainbow defaults; accent on legend slabs or canvas
- Bar tops with `rx` other than `3`; card radius on the frame
- Stronger grid than hairline `0.10` / structure `0.28`
- Second ink world or dark mode inside this pack

### OPEN — D hour goal "one tier up"

Observation: empty gutter around site figures reads sparse next to denser demos.
Judgment: less empty gutter is **site chrome** (page layout, card pad, gallery thumb frame) — not a folio token change.
Instruction: keep folio chart locks — transparent canvas, hairline grid, value labels per dual-encoding rule, one accent for one series. Do not densify folio margins or grid to chase gallery density; that work stays in site / examples chrome.

---

## highcharts

### Intent

Denser plot, stronger grid, legend-friendly series chrome. Highcharts-demo-inspired look as tokens only — same keys as folio, no vendor deps.

### Locked tokens (from `highcharts.ts`)

| Token | Value |
| --- | --- |
| Canvas / paper | transparent (inherits host; no pack-level paper fill) |
| Ink | `#333333` |
| Quiet | `#666666` |
| Hairline opacity (grid) | `0.22` |
| Structure opacity | `0.42` |
| Series palette | `#7cb5ec`, `#434348`, `#90ed7d`, `#f7a35c`, `#8085e9`, `#f15c80`, `#e4d354`, `#2b908f` |
| Wrap opacity | `0.75` |
| Bar radius `BAR_RX` | `0` |
| Line stroke | `2` |
| Line point `r` | `3` |
| Area fill opacity | `0.28` |
| Type — title | `16` / `600` / `#333333` |
| Type — unit | `12` / `400` / `#666666` |
| Type — value | `11` / `500` / `#333333` |
| Type — tick | `11` / `400` / `#666666` |
| Type — note | `11` / `400` / `#666666` |
| Type — legend | `12` / `500` / `#333333` |
| Frame | `720×440` (max height `640`) |
| Plot min ratio | `0.62` |
| Margins | top `28`, right `16`, bottom `22`, left `44` |
| Max interior grid | `5` |
| Font | `Arial, Helvetica, "Segoe UI", sans-serif` |

### Differentiator vs folio (measured)

| Lock | folio | highcharts |
| --- | --- | --- |
| Ink | `#171717` | `#333333` |
| Quiet | `#737373` | `#666666` |
| Hairline | `0.10` | `0.22` |
| Structure | `0.28` | `0.42` |
| SVG height | `480` | `440` |
| Plot min ratio | `0.55` | `0.62` |
| Max interior grid | `3` | `5` |
| Margins | `36/20/26/48` | `28/16/22/44` |
| `BAR_RX` | `3` | `0` |
| Line stroke / point | `1.75` / `2.5` | `2` / `3` |
| Area opacity | `0.22` | `0.28` |
| Legend type | `11/400` | `12/500` |
| Palette | mid-chroma Ledger set | demo blues/greens/oranges (`#7cb5ec`…) |
| Font | system ui-sans | Arial/Helvetica stack |

### Ban list

- Soft Ledger hairline (`0.10`) — this pack’s grid is stronger by design
- Rounded bar tops (`BAR_RX > 0`)
- Claiming Highcharts product affiliation or shipping Highcharts JS
- Dropping plot density back to folio’s `0.55` / height `480` while keeping the name
- Folio’s single soft accent language when multi-series legend chrome is the point

---

## shadcn

### Intent

Rounded marks, categorical chart-1..5 hues (light-theme oklch → hex), quiet axes — muted ticks and soft structure so the figure sits on a card surface without loud chrome.

### Locked tokens (from `shadcn.ts`)

| Token | Value |
| --- | --- |
| Canvas / paper | transparent (card/host shows through; no pack-level paper fill) |
| Ink | `#0A0A0A` |
| Quiet | `#737373` |
| Hairline opacity (grid) | `0.08` |
| Structure opacity | `0.18` |
| Series palette (chart-1..5) | `#F54900`, `#009689`, `#104E64`, `#FFB900`, `#FE9A00` |
| Wrap opacity | `0.72` |
| Bar radius `BAR_RX` | `6` |
| Line stroke | `2` |
| Line point `r` | `3` |
| Area fill opacity | `0.2` |
| Type — title | `16` / `600` / `#0A0A0A` |
| Type — unit | `12` / `400` / `#737373` |
| Type — value | `11` / `500` / `#0A0A0A` |
| Type — tick | `11` / `400` / `#737373` |
| Type — note | `11` / `400` / `#737373` |
| Type — legend | `12` / `500` / `#0A0A0A` |
| Frame | `720×480` (max height `640`) |
| Plot min ratio | `0.55` |
| Margins | top `32`, right `18`, bottom `24`, left `44` |
| Max interior grid | `3` |
| Font | `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` |

### Differentiator vs folio (measured)

| Lock | folio | shadcn |
| --- | --- | --- |
| Ink | `#171717` | `#0A0A0A` |
| Hairline | `0.10` | `0.08` |
| Structure | `0.28` | `0.18` |
| `BAR_RX` | `3` | `6` |
| Line stroke / point | `1.75` / `2.5` | `2` / `3` |
| Area opacity | `0.22` | `0.2` |
| Palette | 8 mid-chroma hues | 5 categorical (`#F54900`…`#FE9A00`) |
| Title size | `17` | `16` |
| Legend | `11/400` | `12/500` |
| Margins | `36/20/26/48` | `32/18/24/44` |
| Font | system ui-sans | Inter-first stack |

### Ban list

- Square bar tops (`BAR_RX = 0`) — rounded marks are the lock
- Folio blue-first palette or highcharts demo blues
- Stronger structure than `0.18` / hairline louder than `0.08` (axes stay quiet)
- Shipping shadcn/ui or Recharts as a runtime dependency
- Loud filled legend slabs; accent must stay on the mark

---

## docs

### Intent

Zinc/slate ink, thin ticks, no loud fill — page-figure language that reads native on a docs site surface (Vite/VitePress-adjacent), still as tokens only.

### Locked tokens (from `docs.ts`)

| Token | Value |
| --- | --- |
| Canvas / paper | transparent (docs page paper is site chrome, not SVG fill) |
| Ink | `#18181B` (zinc-900) |
| Quiet | `#64748B` (slate-500) |
| Hairline opacity (grid) | `0.06` |
| Structure opacity | `0.16` |
| Series palette | `#475569`, `#64748B`, `#0F766E`, `#334155`, `#78716C`, `#57534E` |
| Wrap opacity | `0.65` |
| Bar radius `BAR_RX` | `0` |
| Line stroke | `1.5` |
| Line point `r` | `2` |
| Area fill opacity | `0.12` |
| Type — title | `15` / `600` / `#18181B` |
| Type — unit | `11` / `400` / `#64748B` |
| Type — value | `10` / `500` / `#18181B` |
| Type — tick | `10` / `400` / `#64748B` |
| Type — note | `11` / `400` / `#64748B` |
| Type — legend | `11` / `500` / `#18181B` |
| Frame | `720×480` (max height `640`) |
| Plot min ratio | `0.55` |
| Margins | top `28`, right `16`, bottom `22`, left `40` |
| Max interior grid | `3` |
| Scatter `r` / opacity | `2.5` / `0.75` |
| Font | `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` |

Status: `docs.ts` is present on disk with the values above (not stub-equal to folio). If C5 still lands wiring/export polish, keep these measured locks; do not silently revert to folio hex.

### Differentiator vs folio (measured)

| Lock | folio | docs |
| --- | --- | --- |
| Ink | `#171717` | `#18181B` |
| Quiet | `#737373` | `#64748B` |
| Hairline | `0.10` | `0.06` |
| Structure | `0.28` | `0.16` |
| `BAR_RX` | `3` | `0` |
| Line stroke / point | `1.75` / `2.5` | `1.5` / `2` |
| Area opacity | `0.22` | `0.12` |
| Palette | mid-chroma Ledger set | muted zinc/slate/teal |
| Title / value sizes | `17` / `11` | `15` / `10` |
| Margins | `36/20/26/48` | `28/16/22/40` |
| Wrap opacity | `0.7` | `0.65` |
| Scatter | `3` / `0.85` | `2.5` / `0.75` |

### What MUST stay true when C5 finishes

- Ink stays zinc/slate (`#18181B` / `#64748B`), not folio `#171717` / `#737373`
- Hairline ≤ `0.06`, structure ≤ `0.16` — thinner than folio
- Area opacity stays quiet (`0.12`); no loud fill wash
- `BAR_RX = 0` (crisp docs rects, not card-rounded)
- Palette stays muted zinc/slate — no Ledger blue `#3B82F6` as series-1 default
- No full-frame paper painted into the SVG; page paper remains site chrome

### Ban list

- Loud mid-chroma folio accents as the default series set
- Rounded card marks (`BAR_RX` like shadcn `6` or folio `3`)
- Area fills at folio `0.22` or highcharts `0.28`
- Strong demo grids (highcharts `0.22` hairline)
- Claiming VitePress/Vite product affiliation or adding their chart libs
