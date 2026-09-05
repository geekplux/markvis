# site-visual-spec — public markvis.js.org chrome

Scope: **the website** (VitePress layout, home, `/examples` cards, `/play` chrome).
Figures stay **Ledger** (`docs/visual-spec.md`). Do **not** add a chart `theme:`. Do **not** restyle SVG marks to match marketing — if a plot clips, **fix the card**, not the chart language.

Public voice (Writer owns words; this file owns placement): markvis is charts in Markdown. The fence is the data. **No Mermaid** on public surfaces.

North stars: paper/folio page (not SaaS hero). Gallery density from https://www.highcharts.com/demo — finished figures, click for large + source. Not untouched VitePress default.

Supersedes conflicting bits of `docs/gallery-spec.md` where noted (card crop / double title / stock VP home).

---

## World

| Token | Value |
| --- | --- |
| Page paper | `#F7F4EF` (warm off-white folio — **site only**; SVG canvas stays transparent) |
| Ink | `#171717` |
| Quiet | `#737373` |
| Rule | ink `#171717` @ opacity `0.12` |
| Accent | `#2563EB` — links, primary button fill, focus ring only |
| Max measure | home/integrate/AI: `720px` text · examples: `1120px` · play: full viewport under nav |
| Type | `ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", sans-serif` |

Ban: stock VitePress blue wordmark gradient, mint docsify, purple SaaS gradients, card shadows, radius ≥ `8px` on page chrome, “Proof” scaffolding, Mermaid comparisons.

---

## Nav (quiet)

- Height `52px`. Background paper `#F7F4EF` (same as page — no white slab above).
- Wordmark `markvis` `15px/600` ink — plain text, no VP brand clip gradient.
- Links `13px/500` quiet; current route ink + underline `1px` rule @0.28.
- Gap between links `20px`.
- Bottom rule `1px` ink@0.12 full bleed.
- No sidebar on `/` `/play` `/examples`.

---

## Home — figure on a page

Not a SaaS hero. One column, paper continuous under nav.

1. Wordmark / page identity `28px/600` ink.
2. Sentence max two lines: `16px/400` ink · max-width `36rem`. Writer: Charts in Markdown. The fence is the data.
3. Buttons row gap `12px`:
   - Primary Playground: fill `#2563EB`, text `#FFFFFF`, height `36px`, pad `0 16px`, radius `2px`
   - Secondary Examples: transparent, border `1px` ink@0.28, text ink, same height, radius `2px`
4. Three figures — row gap `16px` (stack under `720px`). Each: full SVG from out (`01`/`02`/`05`), no crop, width 100%, height auto, max-width `360px`. **One** caption under: conclusion `12px/500` quiet — never a heading above that repeats the SVG title.
5. One fence: pre on inset `#EFEBE4`, border `1px` rule, pad `12px`, font `12px` mono. No Proof scaffolding H2.
6. Footer legacy note `12px/400` quiet. Stop.

Remove VP `layout: home` hero clip styling via theme CSS overrides so the page is not recognizable as default VitePress.

---

## /examples — Highcharts density, no crop

### Page chrome

- Title Examples `28px/600` ink.
- Subline `14px/400` quiet with live count.
- Type chips: height `28`, pill, active fill ink / text paper (same as gallery-spec filters).

### Cards (fixes production fails)

| Token | Value |
| --- | --- |
| Grid | `repeat(auto-fill, minmax(260px, 1fr))` · gap `20px` |
| Card | `#FFFFFF` on page paper · border `1px` ink@0.12 · radius `0` · pad `12px 12px 10px` · no shadow |
| Thumb | **no fixed-height crop**. Size to SVG intrinsic aspect at card width. SVG width 100%, height auto, max-height none, overflow visible. Entire plot + labels visible. |
| Caption | **one** under figure only: conclusion `13px/600` ink · max 2 lines ellipsis |
| Ban | title above and below; fixture slug titles (line omitted title, stem ids); cropping the plot; type name as caption |

Title source: SVG title or fence title that is a conclusion. Missing conclusion → title-only edit on examples/valid + regen out (not a gallery stem fallback).

### Click to detail

Keep `?id=` side rail. Detail: full SVG cap `720px` uncropped · conclusion `20px/600` · Copy fence · Copy SVG · Open in playground · pre fence. Esc / backdrop close.

---

## /play — two panes, same paper

- Full viewport under site nav (iframe OK). Inside playground:
- Background paper `#F7F4EF`.
- Left editor at least 40% · right figure at least 40% · gap `1px` rule.
- Toolbar quiet: example switcher + Copy fence + Copy SVG + Open in gallery — `12px/500`, no debug or local-pnpm sentences.
- Figure pane: transparent SVG on paper.

---

## Integrate / Spec / AI

- Same paper + ink. Body `16px/400`, measure `640–720px`.
- H1 `28px/600`. H2 `18px/600`. Code blocks same inset as home fence.
- No Mermaid.

---

## Implementation notes for Coder

1. Override VitePress theme CSS (`--vp-c-bg`, `--vp-c-brand-1`, hero) to paper/ink/accent — must not read as default VP blue.
2. Home: no Proof heading; three uncropped SVGs + one caption each.
3. Gallery cards: remove double title; remove fixed 140px overflow hidden crop; show full chart.
4. Fixture slug / omitted titles: title-only valid edits + regen out (smallest set).
5. Align playground stylesheet to these paper tokens.
6. Do not change Ledger series hues or stroke widths for marketing.

---

## Acceptance

- Incognito `/` `/play` `/examples`: not stock VitePress; no Mermaid; `/play` edits fence and SVG updates.
- Example cards: whole plot visible; one caption; no fixture slugs.
- Home: wordmark, max 2-line sentence, two buttons, 3 uncropped figures, one fence.
- GeekPlux visual veto.

---

## Out of scope

npm latest, new chart types, theme picker, dark-mode-first marketing, docsify, markvis-editor rebuild, Mermaid essays.
