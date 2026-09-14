# Site

Public VitePress site in `apps/web`, built from branch `master`. This is the site, not a second docs tree. Product docs live under `docs/`.

markvis is an open-source library. Play, bake, or drop in a plugin. It is not a docs product and not a chart suite. The fence is the source. Same text, same SVG. No plugin, the table still shows.

Audience: any Markdown preview or rendered view, and any AI reply that needs a figure. Two host-permission-free paths: bake an SVG, or drop in a one-file script where the host already runs JavaScript.

Do not restyle SVG marks to match marketing chrome. If a plot clips, fix the card, not the chart language. Figures follow fence `theme:` / `palette:` (`SPEC.md`). Default `folio` is Ledger (`docs/visual-spec.md`). Site light/dark is chrome only — unrelated to fence `theme=`.

Chrome: QuickGUI landing architecture inside VitePress. Brand **MarkVis** (library name `markvis`). Klein Blue schema (`#002FA7` light / `#7AA2FF` dark) for accent, filled brand controls, links, and focus. Pale Klein tints for surfaces. Mint for “available now”. Radius 0, Geist Variable + Geist Mono, one centered column (`max-width: 72rem`) with 1px rails. No Motions yellow (`#ffdb2a`) and no peach identity. Logo is the Klein Blue square mark (white M, cyan V) at `apps/web/public/logo.png`.

Public pages never name competing diagram tools.

## Nav

Mark + wordmark: MarkVis. Header is 64px, sticky, on the 72rem rails. Same links on every public page.

Links: Docs · Examples · Playground · AI.

Filled: Playground → `/play`.

Site mode toggle lives in the right cluster. Mode is site mode, not chart theme.

## Home copy

Source for `/`. Public voice only. No competitor names. Do not lead with README authors.

Badge: OPEN SOURCE | v2 · MIT.

Headline: Charts in Markdown. / The fence is the data.

Filled: Get started → `#quickstart`.

Outline: Docs → `/get-started`. Examples → `/examples`.

Install chip: `$ npx markvis bake README.md` (copyable). Do not claim a v2 npm install line.

Proof figures (folio, uncropped; conclusion captions):

1. Mar led Midtown box office — `examples/out/01-bar-basic.svg`
2. Walk-up still leads member — `examples/out/02-line-multi.svg`
3. MARTA takes the largest mode share — `examples/out/05-pie-raw.svg`

Feature grid (1px gutter): library you can drop in; Any Markdown view; Same fence, same SVG; Table fallback; Six types; CSV or GFM table; Parser to IR to SVG; AI replies; Themes.

Tabbed fences: bar / line / pie from those three stems.

Quickstart: 01 Play · 02 Bake · 03 Skill.

Hosts: npm · script — clone + build. Skill / Play — available now. Do not stamp npm or script as “available now”.

Final CTA: logo, Get started with MarkVis, Playground / Docs / Examples / Star on GitHub.

Footer: © 2026 GeekPlux · MIT · 0.0.13 under `legacy/`.

## Examples gallery

`/examples` is generated from `examples/valid/*.md` plus `examples/out/<stem>.svg` so docs cannot drift. Today: 52 valid files. Invalid fixtures stay off the gallery.

- Card title = SVG `<title>` or fence `title:` (a conclusion, never a filename slug).
- `data-type` = fence `type:`. `data-id` = stem.
- Thumbs: SVG `width: 100%` / `height: auto` / `max-width: 100%`. No fixed-height crop. Entire plot + labels visible.
- One caption under the figure. No double title. No type name as caption.
- Click → `?id=` detail: full SVG, fence, Copy fence / Copy SVG / Open in playground. Grid geometry must not reflow sibling cards.
- Filters: type chips, then theme / palette. Play and Examples detail keep two controls (Theme + Color).

Gallery stories for every card: `docs/examples.md`.

## Play

Two panes under the site nav: fence left, figure right. Each at least 40% at `>=768px`. Theme and Color selects rewrite the fence and re-render. Copy fence / Copy SVG / Open in gallery. Invalid input shows the table + error, never a blank screen.

## Integrate / Spec / AI / Themes pages

Same family as the rest of the site. Body copy in `apps/web/*.md`. Pipeline diagrams stay in repo `docs/architecture.md` so public pages stay free of competitor diagram fences.
