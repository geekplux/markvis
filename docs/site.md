# Site

Public VitePress site in `apps/web`, built from branch `master`. This is the site, not a second docs tree. Product docs live under `docs/`.

markvis is an open-source library. Play, save a picture, or drop in a plugin. It is not a docs product and not a chart suite. The numbers live in a Markdown code block. Same text, same picture. If the chart cannot draw, the table still shows.

Audience: anyone writing Markdown, and any AI reply that needs a figure. Two paths that need no plugin on the host: save a picture next to the file (`bake`), or drop in a one-file script where the page already runs JavaScript.

Do not restyle SVG marks to match marketing chrome. If a plot clips, fix the card, not the chart language. Figures follow fence `theme:` / `palette:` (`SPEC.md`). Default `folio` is Ledger (`docs/visual-spec.md`). Site light/dark is chrome only — unrelated to fence `theme=`.

Chrome: a bordered landing page inside VitePress, sections split by hairlines and card grids with a 1px gutter. Brand **MarkVis** (library name `markvis`). Klein Blue schema (`#002FA7` light / `#7AA2FF` dark) for accent, filled brand controls, links, and focus. Pale Klein tints for surfaces. Radius 0, Geist Variable + Geist Mono, one centered column (`max-width: 72rem`) with 1px rails. No Motions yellow (`#ffdb2a`) and no peach identity. Logo is the Klein Blue square mark (white M, cyan V) at `apps/web/public/logo.png`.

Public pages never name competing diagram tools.

## Nav

Mark + wordmark: MarkVis. Header is 64px, sticky, on the 72rem rails. Same links on every public page.

Links: Docs · Examples · Play.

Filled: Play → `/play`.

Docs sidebar, in this order: Get started → Integrate → Theming → Chart types → Spec → Contributing. `/themes` redirects to `/theming`, and `/ai` redirects to Integrate's last section, "Tell a model" (the model instruction), the way `/docs` redirects to `/get-started`.

Site mode toggle lives in the right cluster. Mode is site mode, not chart theme.

## Home copy

Source for `/`. Public voice only. No competitor names. Do not lead with README authors. One screen answers "what is it, show me, how do I use it"; the rest of the page is examples, not arguments.

Page order (section ids): Hero (`#hero`) → Use it (`#use`) → Your colors (`#colors`) → Seventeen kinds of chart (`#types`) → close (`#cta`).

Badge: MARKVIS 2 | CHARTS AS TEXT.

Headline: Charts as text in Markdown. One line, 3.5rem / 600 / -0.03em.

Sub: Write a short chart block. markvis draws it as plain SVG wherever Markdown is rendered. Where it cannot draw, the numbers stay as a table.

Buttons: Get started → `#use` (filled). GitHub ↗ (outline).

Hero stage (`HeroStage`, `apps/web/components/HeroStage.vue`, driven by `apps/web/src/hero.ts`): one chart block types itself and the chart beside it is `render()` on the text on screen, in ten scenes: Write, Paste, Kind (bar → sankey → treemap → heatmap → bar), Stack (`layout: stacked`), Theme (graphite, docs), Palette (warm, vivid), Color (the stage sets `--markvis-series-1`; nothing redraws), Dark (the other surface), Width (the chart pane narrows to 360 px and back), Table (`8.1x`: the table and one error line). Then the poster for 5 s, and the loop. The data is real: the ten largest US source-to-sector energy flows in 2023 (US EIA, Monthly Energy Review), so one word in `type:` turns the same rows into a bar, a sankey, a treemap, or a heatmap. The ten ticks on the foot jump to a scene. Click or any key on the text opens a live editor with a Replay button; an invalid edit keeps the last good chart and shows the error in the caption. The server renders the poster, so the built page already holds the finished chart. Reduced motion shows the poster and a Play button; a tick then shows that scene still. The stage and its chart share the site card color in both site modes.

Numbers line (mono, muted), under the stage and above the note: `56 kB gzip · 0 dependencies · under 1 ms a chart · plain SVG`. The README carries the same line; `apps/web/test/numbers.test.ts` keeps the gzip figure within 10 % of `dist/markvis.min.js`.

Note under the numbers line (mono, muted): Data: US EIA, Monthly Energy Review 2023 · Click the text to edit it · Open in Play ↗. The data credit is required.

README picture: the README's chart block (Visits by day) shows `https://markvis.js.org/home/visits-by-day.svg`, because npmjs.com cannot load a relative image. `apps/web/public/home/visits-by-day.svg` is byte-equal to the `README.svg` that bake writes (`apps/web/test/readme-image.test.ts`).

Public install: `npm install markvis`. 2.0.0 replaces 0.0.13.

Use it (`#use`, two per row): 01 One script tag · 02 JavaScript · 03 React · 04 GitHub (the copyable chip `$ npx markvis bake README.md`). Each card: the snippet, one line, and `more →` to its Integrate section.

Your colors (`#colors`): the chart reads the page. One SVG string drawn on a light page and a dark page, each setting a few `--markvis-*` variables (`ColorsDemo`); the toggle `Light page` / `Dark page` shows that page's CSS. Caption: Leave them unset and the chart uses its own defaults.

Seventeen kinds of chart (`#types`): one card per type in SPEC order (`TypeGrid`, data from `apps/web/src/type-pages.ts`), 3 / 2 / 1 columns. Each card: the type name (links to `/types/<type>`), its "Use for" line, the chart block of the first `examples/valid` file of that type drawn by `ChartBlock` once the card nears the viewport, a `block ▾` disclosure with that block's text, and `Open in Play ↗` (Play opened on that same file, so the card and Play show one chart).

Close (`#cta`): logo, Write the numbers. Get the chart., Play / GitHub ↗.

Charts follow the site mode: `ChartBlock`, the examples gallery, and Play set `--markvis-ink`, `--markvis-muted`, `--markvis-grid` (the text color: grid lines are drawn at the theme's faint opacity), `--markvis-paper`, and `--markvis-plate` from the site tokens, so no chart sits on a white card in dark mode. Play leaves a block that asks for the dark or export surface on that surface's own colors.

Social card: `apps/web/public/og.png` (1200 × 630) is the hero poster, captured from the built home page.

Manual check before a site PR is merged: build (`pnpm --filter web build`), serve `apps/web/.vitepress/dist`, and take screenshots of `/` at 1280 and 390 wide, in light and dark site mode, of the poster (reduced motion) and mid-typing (scene 01); also `/play`, `/examples`, `/types/bar`, and `/theming` in dark mode. At 1280 × 900 the stage foot sits inside the first screen. One browser at a time.

Footer: © 2026 GeekPlux · MIT · 0.0.13 under `legacy/`.

## Examples gallery

`/examples` is generated from `examples/valid/*.md` plus `examples/out/<stem>.svg` so docs cannot drift. Today: 88 valid files. Invalid fixtures stay off the gallery.

- Card title = SVG `<title>` or fence `title:` (a conclusion, never a filename slug).
- `data-type` = fence `type:`. `data-id` = stem.
- Thumbs: SVG `width: 100%` / `height: auto` / `max-width: 100%`. No fixed-height crop. Entire plot + labels visible.
- One caption under the figure. No double title. No type name as caption.
- Click → `?id=` detail: full SVG, fence, Copy fence / Copy SVG / Open in playground. Grid geometry must not reflow sibling cards.
- Filters: type chips, then theme / palette. Play and Examples detail keep two controls (Theme + Color).

Gallery stories for every card: `docs/examples.md`.

## Play

Two panes under the site nav: fence left, figure right. Each at least 40% at `>=768px`. Theme and Color selects rewrite the fence and re-render. Copy fence / Copy SVG / Open in gallery. Invalid input shows the table + error, never a blank screen.

## Chart types

`/integrate` is the one page for every way to show a block; there is no second overview. `/types/<type>`: one page per chart type, generated at build time (`apps/web/src/type-pages.ts`, dynamic route `apps/web/types/[type].paths.ts`) from `packages/types/<type>/README.md`, its `examples/valid.md` and `examples/invalid.md`, and the type's row in `SPEC.md`, so the pages cannot drift. `ChartBlock` draws the examples.

## Integrate / Theming / Spec pages

Same family as the rest of the site. Body copy in `apps/web/*.md`. Integrate ends with "Tell a model" (the model instruction from `docs/prompt.md`). Theming holds themes, palettes, and the side-by-side strip. `apps/web/ai.md` and `apps/web/themes.md` are redirect stubs. Pipeline diagrams stay in repo `docs/architecture.md` so public pages stay free of competitor diagram fences.
